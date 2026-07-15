#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-west-2}"
LOG_GROUP_NAME="${LOG_GROUP_NAME:-/aws/amplify/mcpeak-family/main}"
TABLE_NAME="${TABLE_NAME:-mcpeak}"
WEB_ACL_NAME="${WEB_ACL_NAME:-family-api-rate-limits}"
WAF_REGION="${WAF_REGION:-CLOUDFRONT}"
DASHBOARD_NAME="${DASHBOARD_NAME:-family-prod-health}"
SNS_TOPIC_ARN="${SNS_TOPIC_ARN:-}"

NAMESPACE="FamilyApp"

put_metric_filter() {
  local filter_name="$1"
  local pattern="$2"
  local metric_name="$3"

  aws logs put-metric-filter \
    --region "$AWS_REGION" \
    --log-group-name "$LOG_GROUP_NAME" \
    --filter-name "$filter_name" \
    --filter-pattern "$pattern" \
    --metric-transformations \
      "metricName=${metric_name},metricNamespace=${NAMESPACE},metricValue=1,defaultValue=0" >/dev/null
}

put_alarm() {
  local alarm_name="$1"
  local metric_name="$2"
  local threshold="$3"
  local comparison="$4"
  local period="${5:-300}"

  local actions=()
  if [[ -n "$SNS_TOPIC_ARN" ]]; then
    actions=(--alarm-actions "$SNS_TOPIC_ARN" --ok-actions "$SNS_TOPIC_ARN")
  fi

  aws cloudwatch put-metric-alarm \
    --region "$AWS_REGION" \
    --alarm-name "$alarm_name" \
    --namespace "$NAMESPACE" \
    --metric-name "$metric_name" \
    --statistic Sum \
    --period "$period" \
    --evaluation-periods 1 \
    --threshold "$threshold" \
    --comparison-operator "$comparison" \
    --treat-missing-data notBreaching \
    "${actions[@]}" >/dev/null
}

echo "Configuring log metric filters in ${LOG_GROUP_NAME}"
put_metric_filter \
  "FamilyApi5xxCount" \
  '"event":"api_error" "status":5' \
  "Api5xxCount"
put_metric_filter \
  "FamilyLoginFailureCount" \
  '"event":"api_response" "route":"/api/auth/login" "status":401' \
  "LoginFailureCount"
put_metric_filter \
  "FamilyReadinessFailureCount" \
  '"event":"api_response" "route":"/api/health/ready" "status":503' \
  "ReadinessFailureCount"

echo "Configuring application alarms"
put_alarm "family-api-5xx-spike" "Api5xxCount" 5 "GreaterThanOrEqualToThreshold"
put_alarm "family-login-failure-spike" "LoginFailureCount" 20 "GreaterThanOrEqualToThreshold"
put_alarm "family-readiness-failures" "ReadinessFailureCount" 3 "GreaterThanOrEqualToThreshold"

echo "Configuring DynamoDB throttle alarms"
aws cloudwatch put-metric-alarm \
  --region "$AWS_REGION" \
  --alarm-name "family-dynamodb-read-throttle" \
  --namespace AWS/DynamoDB \
  --metric-name ReadThrottleEvents \
  --dimensions "Name=TableName,Value=${TABLE_NAME}" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching >/dev/null

aws cloudwatch put-metric-alarm \
  --region "$AWS_REGION" \
  --alarm-name "family-dynamodb-write-throttle" \
  --namespace AWS/DynamoDB \
  --metric-name WriteThrottleEvents \
  --dimensions "Name=TableName,Value=${TABLE_NAME}" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching >/dev/null

echo "Configuring WAF blocked requests alarm"
aws cloudwatch put-metric-alarm \
  --region "$AWS_REGION" \
  --alarm-name "family-waf-blocked-requests" \
  --namespace AWS/WAFV2 \
  --metric-name BlockedRequests \
  --dimensions "Name=WebACL,Value=${WEB_ACL_NAME}" "Name=Region,Value=${WAF_REGION}" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching >/dev/null

DASHBOARD_BODY_FILE="$(mktemp)"
cat > "$DASHBOARD_BODY_FILE" <<EOF
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "title": "API Error Metrics",
        "view": "timeSeries",
        "region": "${AWS_REGION}",
        "metrics": [
          ["${NAMESPACE}", "Api5xxCount"],
          [".", "LoginFailureCount"],
          [".", "ReadinessFailureCount"]
        ]
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "title": "DynamoDB Throttles",
        "view": "timeSeries",
        "region": "${AWS_REGION}",
        "metrics": [
          ["AWS/DynamoDB", "ReadThrottleEvents", "TableName", "${TABLE_NAME}"],
          [".", "WriteThrottleEvents", ".", "."]
        ]
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "title": "WAF Blocked Requests",
        "view": "timeSeries",
        "region": "${AWS_REGION}",
        "metrics": [
          ["AWS/WAFV2", "BlockedRequests", "WebACL", "${WEB_ACL_NAME}", "Region", "${WAF_REGION}"]
        ]
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --region "$AWS_REGION" \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body "file://${DASHBOARD_BODY_FILE}" >/dev/null

rm -f "$DASHBOARD_BODY_FILE"

echo "CloudWatch alarms configured."
echo "Dashboard: ${DASHBOARD_NAME}"
echo "Log group: ${LOG_GROUP_NAME}"
