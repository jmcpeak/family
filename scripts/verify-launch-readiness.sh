#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-west-2}"
TABLE_NAME="${TABLE_NAME:-mcpeak}"
AMPLIFY_APP_NAME="${AMPLIFY_APP_NAME:-mcpeak-family}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
PROD_DOMAIN="${PROD_DOMAIN:-mcpeakfamily.org}"
STAGING_URL="${STAGING_URL:-}"
PLAYWRIGHT_LOGIN_ANSWER="${PLAYWRIGHT_LOGIN_ANSWER:-}"
CREATE_BACKUP="${CREATE_BACKUP:-false}"
RESTORE_TABLE_NAME="${RESTORE_TABLE_NAME:-}"

echo "==> Resolving Amplify app"
APP_ID="$(aws amplify list-apps --region "$AWS_REGION" --query "apps[?name=='${AMPLIFY_APP_NAME}'].appId | [0]" --output text)"
if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  echo "Unable to find Amplify app: $AMPLIFY_APP_NAME"
  exit 1
fi

COMPUTE_ROLE_ARN="$(aws amplify get-app --region "$AWS_REGION" --app-id "$APP_ID" --query "app.computeRoleArn" --output text)"
if [[ "$COMPUTE_ROLE_ARN" == "None" || -z "$COMPUTE_ROLE_ARN" ]]; then
  echo "Amplify app is missing a compute role."
  exit 1
fi
ROLE_NAME="${COMPUTE_ROLE_ARN##*/}"
echo "    App ID: $APP_ID"
echo "    Compute role: $ROLE_NAME"

echo "==> Verifying DynamoDB PITR"
PITR_STATUS="$(aws dynamodb describe-continuous-backups --region "$AWS_REGION" --table-name "$TABLE_NAME" --query "ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus" --output text)"
if [[ "$PITR_STATUS" != "ENABLED" ]]; then
  echo "PITR is not enabled for table $TABLE_NAME (status: $PITR_STATUS)."
  exit 1
fi
echo "    PITR: $PITR_STATUS"

BACKUP_ARN=""
if [[ "$CREATE_BACKUP" == "true" ]]; then
  BACKUP_NAME="pre-cutover-${TABLE_NAME}-$(date +%Y%m%d-%H%M%S)"
  echo "==> Creating on-demand backup: $BACKUP_NAME"
  BACKUP_ARN="$(aws dynamodb create-backup --region "$AWS_REGION" --table-name "$TABLE_NAME" --backup-name "$BACKUP_NAME" --query "BackupDetails.BackupArn" --output text)"
  echo "    Backup ARN: $BACKUP_ARN"
fi

if [[ -n "$RESTORE_TABLE_NAME" ]]; then
  if [[ -z "$BACKUP_ARN" ]]; then
    BACKUP_ARN="$(aws dynamodb list-backups --region "$AWS_REGION" --table-name "$TABLE_NAME" --backup-type USER --time-range-lower-bound "$(date -u -v-7d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "7 days ago" +"%Y-%m-%dT%H:%M:%SZ")" --query "BackupSummaries | sort_by(@,&BackupCreationDateTime) | [-1].BackupArn" --output text)"
  fi

  if [[ "$BACKUP_ARN" == "None" || -z "$BACKUP_ARN" ]]; then
    echo "No user backup available to restore."
    exit 1
  fi

  echo "==> Restoring backup to table: $RESTORE_TABLE_NAME"
  aws dynamodb restore-table-from-backup \
    --region "$AWS_REGION" \
    --target-table-name "$RESTORE_TABLE_NAME" \
    --backup-arn "$BACKUP_ARN" >/dev/null
  aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$RESTORE_TABLE_NAME"
  echo "    Restore table is active."
fi

echo "==> Validating compute role policy scope"
ROLE_POLICY="$(aws iam get-role-policy --role-name "$ROLE_NAME" --policy-name FamilyDynamoDbAccess --query "PolicyDocument" --output json)"
if [[ "$ROLE_POLICY" == *":table/test"* ]]; then
  echo "Compute role policy still references the test table. Remove it before launch."
  exit 1
fi
if [[ "$ROLE_POLICY" != *":table/${TABLE_NAME}"* ]]; then
  echo "Compute role policy does not reference expected table: $TABLE_NAME"
  exit 1
fi
echo "    Policy references only expected production table."

echo "==> Verifying CloudWatch alarms exist"
ALARM_COUNT="$(aws cloudwatch describe-alarms --region "$AWS_REGION" --alarm-name-prefix "family-" --query "length(MetricAlarms)" --output text)"
if [[ "$ALARM_COUNT" -eq 0 ]]; then
  echo "No launch alarms found (alarm-name-prefix family-)."
  exit 1
fi
echo "    Alarm count: $ALARM_COUNT"

echo "==> Verifying production redirects and health endpoints"
HTTP_LOCATION="$(curl -sSI "http://${PROD_DOMAIN}" | awk 'tolower($1)=="location:" { print $2 }' | tr -d '\r' | tail -n 1)"
WWW_LOCATION="$(curl -sSI "https://www.${PROD_DOMAIN}" | awk 'tolower($1)=="location:" { print $2 }' | tr -d '\r' | tail -n 1)"
HTTPS_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "https://${PROD_DOMAIN}")"
READY_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "https://${PROD_DOMAIN}/api/health/ready")"

if [[ "$HTTP_LOCATION" != "https://${PROD_DOMAIN}/" ]]; then
  echo "Unexpected HTTP redirect target: $HTTP_LOCATION"
  exit 1
fi
if [[ "$WWW_LOCATION" != "https://${PROD_DOMAIN}/" ]]; then
  echo "Unexpected www redirect target: $WWW_LOCATION"
  exit 1
fi
if [[ "$HTTPS_STATUS" != "200" ]]; then
  echo "Unexpected HTTPS status: $HTTPS_STATUS"
  exit 1
fi
if [[ "$READY_STATUS" != "200" ]]; then
  echo "Unexpected readiness status: $READY_STATUS"
  exit 1
fi
echo "    Redirects and health checks look good."

if [[ -n "$STAGING_URL" && -n "$PLAYWRIGHT_LOGIN_ANSWER" ]]; then
  echo "==> Running full staging smoke test"
  SMOKE_BASE_URL="$STAGING_URL" \
    PLAYWRIGHT_LOGIN_ANSWER="$PLAYWRIGHT_LOGIN_ANSWER" \
    npm run test:smoke:staging
fi

echo "==> Launch readiness checks completed successfully."
echo "Rollback command: AWS_PROFILE=\${AWS_PROFILE:-default} ./scripts/amplify-deploy.sh"
