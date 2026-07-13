#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-west-2}"
AMPLIFY_APP_NAME="${AMPLIFY_APP_NAME:-mcpeak-family}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
DOMAIN_NAME="${DOMAIN_NAME:-mcpeakfamily.org}"

APP_ID="$(aws amplify list-apps --region "$AWS_REGION" --query "apps[?name=='${AMPLIFY_APP_NAME}'].appId | [0]" --output text)"

if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  echo "No Amplify app named '$AMPLIFY_APP_NAME' in $AWS_REGION."
  echo "Run ./scripts/amplify-setup.sh first."
  exit 1
fi

echo "App: $AMPLIFY_APP_NAME ($APP_ID)"
aws amplify get-app --region "$AWS_REGION" --app-id "$APP_ID" \
  --query 'app.{name:name,defaultDomain:defaultDomain,platform:platform,computeRole:computeRoleArn}' \
  --output table

echo
echo "Branches:"
aws amplify list-branches --region "$AWS_REGION" --app-id "$APP_ID" \
  --query 'branches[].{branch:branchName,status:status,url:displayName}' \
  --output table

echo
echo "Recent jobs:"
aws amplify list-jobs --region "$AWS_REGION" --app-id "$APP_ID" --branch-name "$GITHUB_BRANCH" --max-results 5 \
  --query 'jobSummaries[].{id:jobId,type:jobType,status:status,commit:commitMessage}' \
  --output table 2>/dev/null || echo "(no jobs yet)"

echo
echo "Domain ($DOMAIN_NAME):"
aws amplify get-domain-association --region "$AWS_REGION" --app-id "$APP_ID" --domain-name "$DOMAIN_NAME" \
  --query 'domainAssociation.{status:domainStatus,verified:domainVerificationStatus,cert:certificateVerificationDNSRecord}' \
  --output table 2>/dev/null || echo "(domain not associated yet)"
