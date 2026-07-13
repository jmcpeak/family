#!/usr/bin/env bash
set -euo pipefail

# AWS CLI setup for mcpeak-family on Amplify Hosting.
# Prereqs: AWS CLI v2, authenticated session for account 754934490052 (legacy DynamoDB account).
#
# Usage:
#   aws login                                    # if credentials are expired
#   export GITHUB_TOKEN=ghp_...                  # optional, for GitHub-connected deploys
#   ./scripts/amplify-setup.sh
#
# Optional env overrides:
#   AWS_PROFILE=default
#   AWS_REGION=us-west-2
#   AMPLIFY_APP_NAME=mcpeak-family
#   GITHUB_REPO=https://github.com/jmcpeak/family.git
#   GITHUB_BRANCH=main
#   FAMILY_DDB_TABLE=mcpeak
#   DOMAIN_NAME=mcpeakfamily.org

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

AWS_REGION="${AWS_REGION:-us-west-2}"
AMPLIFY_APP_NAME="${AMPLIFY_APP_NAME:-mcpeak-family}"
GITHUB_REPO="${GITHUB_REPO:-https://github.com/jmcpeak/family.git}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
FAMILY_DDB_TABLE="${FAMILY_DDB_TABLE:-mcpeak}"
DOMAIN_NAME="${DOMAIN_NAME:-mcpeakfamily.org}"
COMPUTE_ROLE_NAME="${COMPUTE_ROLE_NAME:-amplify-family-compute-role}"
SESSION_SECRET="${FAMILY_SESSION_SECRET:-$(openssl rand -base64 48)}"

echo "==> Verifying AWS credentials"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
echo "    Account: $ACCOUNT_ID"
echo "    Region:  $AWS_REGION"

if [[ "$ACCOUNT_ID" != "754934490052" && "${SKIP_ACCOUNT_CHECK:-}" != "true" ]]; then
  echo "WARNING: Legacy DynamoDB table mcpeak is in account 754934490052."
  echo "         You are authenticated as $ACCOUNT_ID."
  if [[ -t 0 ]]; then
    read -r -p "Continue anyway? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
  else
    echo "Set SKIP_ACCOUNT_CHECK=true to bypass this check in non-interactive mode."
    exit 1
  fi
fi

echo "==> Ensuring IAM compute role: $COMPUTE_ROLE_NAME"
if ! aws iam get-role --role-name "$COMPUTE_ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role \
    --role-name "$COMPUTE_ROLE_NAME" \
    --assume-role-policy-document "file://$ROOT_DIR/infra/amplify-compute-trust-policy.json" \
    --description "Amplify SSR compute role for mcpeak-family DynamoDB access"
  echo "    Created role"
else
  echo "    Role already exists"
fi

POLICY_FILE="$(mktemp)"
sed "s/ACCOUNT_ID/$ACCOUNT_ID/g" "$ROOT_DIR/infra/amplify-compute-dynamodb-policy.json" > "$POLICY_FILE"
aws iam put-role-policy \
  --role-name "$COMPUTE_ROLE_NAME" \
  --policy-name FamilyDynamoDbAccess \
  --policy-document "file://$POLICY_FILE"
rm -f "$POLICY_FILE"
echo "    Attached DynamoDB policy"

COMPUTE_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${COMPUTE_ROLE_NAME}"

ENV_VARS="FAMILY_DDB_TABLE=${FAMILY_DDB_TABLE},FAMILY_USE_IN_MEMORY_DB=${FAMILY_USE_IN_MEMORY_DB:-false},CANONICAL_HOST=${DOMAIN_NAME},NEXT_PUBLIC_SITE_URL=https://${DOMAIN_NAME},FAMILY_SESSION_SECRET=${SESSION_SECRET}"

echo "==> Looking for existing Amplify app: $AMPLIFY_APP_NAME"
APP_ID="$(aws amplify list-apps --region "$AWS_REGION" --query "apps[?name=='${AMPLIFY_APP_NAME}'].appId | [0]" --output text)"
if [[ "$APP_ID" == "None" || -z "$APP_ID" ]]; then
  echo "==> Creating Amplify app"
  CREATE_ARGS=(
    --name "$AMPLIFY_APP_NAME"
    --platform WEB_COMPUTE
    --region "$AWS_REGION"
    --build-spec "file://$ROOT_DIR/amplify.yml"
    --environment-variables "$ENV_VARS"
    --enable-branch-auto-build
  )

  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    CREATE_ARGS+=(--repository "$GITHUB_REPO" --access-token "$GITHUB_TOKEN")
    echo "    Connecting GitHub repo: $GITHUB_REPO"
  else
    echo "    No GITHUB_TOKEN set — app will be created without repository connection."
    echo "    Set GITHUB_TOKEN and re-run, or connect GitHub in Amplify console."
  fi

  APP_ID="$(aws amplify create-app "${CREATE_ARGS[@]}" --query app.appId --output text)"
  echo "    Created app: $APP_ID"
else
  echo "    Found existing app: $APP_ID"
  aws amplify update-app \
    --region "$AWS_REGION" \
    --app-id "$APP_ID" \
    --environment-variables "$ENV_VARS" \
    --build-spec "file://$ROOT_DIR/amplify.yml" >/dev/null
  echo "    Updated app settings"
fi

echo "==> Attaching compute role"
aws amplify update-app \
  --region "$AWS_REGION" \
  --app-id "$APP_ID" \
  --compute-role-arn "$COMPUTE_ROLE_ARN" >/dev/null
echo "    Compute role attached"

echo "==> Ensuring branch: $GITHUB_BRANCH"
BRANCH_EXISTS="$(aws amplify list-branches --region "$AWS_REGION" --app-id "$APP_ID" --query "branches[?branchName=='${GITHUB_BRANCH}'].branchName | [0]" --output text)"
if [[ "$BRANCH_EXISTS" == "None" || -z "$BRANCH_EXISTS" ]]; then
  aws amplify create-branch \
    --region "$AWS_REGION" \
    --app-id "$APP_ID" \
    --branch-name "$GITHUB_BRANCH" \
    --enable-auto-build >/dev/null
  echo "    Created branch"
else
  echo "    Branch already exists"
fi

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "==> Starting deployment job"
  JOB_ID="$(aws amplify start-job \
    --region "$AWS_REGION" \
    --app-id "$APP_ID" \
    --branch-name "$GITHUB_BRANCH" \
    --job-type RELEASE \
    --query jobSummary.jobId --output text)"
  echo "    Job ID: $JOB_ID"
fi

if [[ "${SETUP_DOMAIN:-true}" == "true" ]]; then
  echo "==> Ensuring custom domain: $DOMAIN_NAME"
  DOMAIN_EXISTS="$(aws amplify list-domain-associations --region "$AWS_REGION" --app-id "$APP_ID" --query "domainAssociations[?domainName=='${DOMAIN_NAME}'].domainName | [0]" --output text 2>/dev/null || echo None)"
  if [[ "$DOMAIN_EXISTS" == "None" || -z "$DOMAIN_EXISTS" ]]; then
    aws amplify create-domain-association \
      --region "$AWS_REGION" \
      --app-id "$APP_ID" \
      --domain-name "$DOMAIN_NAME" \
      --sub-domain-settings "prefix=,branchName=${GITHUB_BRANCH}" "prefix=www,branchName=${GITHUB_BRANCH}" >/dev/null
    echo "    Domain association created"
  else
    echo "    Domain already associated"
  fi

  echo
  echo "==> DNS records to add at your registrar:"
  aws amplify get-domain-association \
    --region "$AWS_REGION" \
    --app-id "$APP_ID" \
    --domain-name "$DOMAIN_NAME" \
    --query 'domainAssociation.subDomains[].{prefix:subDomainSetting.prefix,dnsRecord:dnsRecord,dnsType:dnsRecordType,value:dnsRecordValue}' \
    --output table
fi

DEFAULT_DOMAIN="$(aws amplify get-app --region "$AWS_REGION" --app-id "$APP_ID" --query app.defaultDomain --output text)"

echo
echo "==> Setup complete"
echo "App ID:          $APP_ID"
echo "Default domain:  https://${GITHUB_BRANCH}.${DEFAULT_DOMAIN}"
echo "Compute role:    $COMPUTE_ROLE_ARN"
echo "Session secret:  $SESSION_SECRET"
echo
echo "Next:"
echo "  ./scripts/amplify-status.sh"
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "  export GITHUB_TOKEN=ghp_... && ./scripts/amplify-setup.sh   # connect GitHub + deploy"
fi
