#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-west-2}"
AMPLIFY_APP_NAME="${AMPLIFY_APP_NAME:-mcpeak-family}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

APP_ID="$(aws amplify list-apps --region "$AWS_REGION" --query "apps[?name=='${AMPLIFY_APP_NAME}'].appId | [0]" --output text)"

if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  echo "No Amplify app named '$AMPLIFY_APP_NAME'."
  exit 1
fi

JOB_ID="$(aws amplify start-job \
  --region "$AWS_REGION" \
  --app-id "$APP_ID" \
  --branch-name "$GITHUB_BRANCH" \
  --job-type RELEASE \
  --query jobSummary.jobId --output text)"

echo "Started deployment job $JOB_ID for $AMPLIFY_APP_NAME ($GITHUB_BRANCH)"
echo "Watch: ./scripts/amplify-status.sh"
