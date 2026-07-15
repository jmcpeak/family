#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-west-2}"
WAF_REGION="${WAF_REGION:-us-east-1}"
AMPLIFY_APP_NAME="${AMPLIFY_APP_NAME:-mcpeak-family}"
WEB_ACL_NAME="${WEB_ACL_NAME:-family-api-rate-limits}"
LOGIN_RATE_LIMIT="${LOGIN_RATE_LIMIT:-120}"
SENSITIVE_RATE_LIMIT="${SENSITIVE_RATE_LIMIT:-500}"

APP_ID="$(aws amplify list-apps --region "$AWS_REGION" --query "apps[?name=='${AMPLIFY_APP_NAME}'].appId | [0]" --output text)"
if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  echo "Unable to detect Amplify app id for ${AMPLIFY_APP_NAME}."
  exit 1
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
RESOURCE_ARN="arn:aws:amplify:${AWS_REGION}:${ACCOUNT_ID}:apps/${APP_ID}"

RULES_FILE="$(mktemp)"
cat > "$RULES_FILE" <<EOF
[
  {
    "Name": "RateLimitAuthLogin",
    "Priority": 0,
    "Statement": {
      "RateBasedStatement": {
        "Limit": ${LOGIN_RATE_LIMIT},
        "AggregateKeyType": "IP",
        "ScopeDownStatement": {
          "ByteMatchStatement": {
            "SearchString": "L2FwaS9hdXRoL2xvZ2lu",
            "FieldToMatch": { "UriPath": {} },
            "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
            "PositionalConstraint": "EXACTLY"
          }
        }
      }
    },
    "Action": { "Block": {} },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "RateLimitAuthLogin"
    }
  },
  {
    "Name": "RateLimitSensitiveRoutes",
    "Priority": 1,
    "Statement": {
      "RateBasedStatement": {
        "Limit": ${SENSITIVE_RATE_LIMIT},
        "AggregateKeyType": "IP",
        "ScopeDownStatement": {
          "OrStatement": {
            "Statements": [
              {
                "ByteMatchStatement": {
                  "SearchString": "L2FwaS9tZW1iZXJz",
                  "FieldToMatch": { "UriPath": {} },
                  "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
                  "PositionalConstraint": "STARTS_WITH"
                }
              },
              {
                "ByteMatchStatement": {
                  "SearchString": "L2FwaS9leHBvcnQvbWFpbGluZw==",
                  "FieldToMatch": { "UriPath": {} },
                  "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
                  "PositionalConstraint": "EXACTLY"
                }
              },
              {
                "ByteMatchStatement": {
                  "SearchString": "L2FwaS9zdXJ2ZXlz",
                  "FieldToMatch": { "UriPath": {} },
                  "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
                  "PositionalConstraint": "STARTS_WITH"
                }
              },
              {
                "ByteMatchStatement": {
                  "SearchString": "L2FwaS9lbWFpbHM=",
                  "FieldToMatch": { "UriPath": {} },
                  "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
                  "PositionalConstraint": "EXACTLY"
                }
              }
            ]
          }
        }
      }
    },
    "Action": { "Block": {} },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "RateLimitSensitiveRoutes"
    }
  }
]
EOF

WEB_ACL_ID="$(aws wafv2 list-web-acls --scope CLOUDFRONT --region "$WAF_REGION" --query "WebACLs[?Name=='${WEB_ACL_NAME}'].Id | [0]" --output text)"

if [[ "$WEB_ACL_ID" == "None" || -z "$WEB_ACL_ID" ]]; then
  echo "Creating WAF web ACL: $WEB_ACL_NAME"
  WEB_ACL_ARN="$(aws wafv2 create-web-acl \
    --scope CLOUDFRONT \
    --region "$WAF_REGION" \
    --name "$WEB_ACL_NAME" \
    --default-action '{"Allow":{}}' \
    --visibility-config "SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=${WEB_ACL_NAME}" \
    --rules "file://${RULES_FILE}" \
    --query Summary.ARN \
    --output text)"
else
  echo "Updating WAF web ACL: $WEB_ACL_NAME"
  LOCK_TOKEN="$(aws wafv2 get-web-acl --scope CLOUDFRONT --region "$WAF_REGION" --name "$WEB_ACL_NAME" --id "$WEB_ACL_ID" --query LockToken --output text)"
  WEB_ACL_ARN="$(aws wafv2 get-web-acl --scope CLOUDFRONT --region "$WAF_REGION" --name "$WEB_ACL_NAME" --id "$WEB_ACL_ID" --query WebACL.ARN --output text)"
  aws wafv2 update-web-acl \
    --scope CLOUDFRONT \
    --region "$WAF_REGION" \
    --name "$WEB_ACL_NAME" \
    --id "$WEB_ACL_ID" \
    --default-action '{"Allow":{}}' \
    --visibility-config "SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=${WEB_ACL_NAME}" \
    --rules "file://${RULES_FILE}" \
    --lock-token "$LOCK_TOKEN" >/dev/null
fi

aws wafv2 associate-web-acl \
  --region "$WAF_REGION" \
  --web-acl-arn "$WEB_ACL_ARN" \
  --resource-arn "$RESOURCE_ARN"

rm -f "$RULES_FILE"

echo "Configured WAF ACL ${WEB_ACL_NAME}"
echo "Associated with Amplify app ${APP_ID}"
echo "Login rate limit: ${LOGIN_RATE_LIMIT} requests / 5 minutes per IP"
echo "Sensitive route rate limit: ${SENSITIVE_RATE_LIMIT} requests / 5 minutes per IP"
