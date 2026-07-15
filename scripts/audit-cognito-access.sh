#!/usr/bin/env bash
set -euo pipefail

COGNITO_REGION="${COGNITO_REGION:-us-east-1}"
IDENTITY_POOL_ID="${IDENTITY_POOL_ID:-us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150}"
TABLE_REGION="${TABLE_REGION:-us-west-2}"
TABLE_NAME="${TABLE_NAME:-mcpeak}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
TABLE_ARN="arn:aws:dynamodb:${TABLE_REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}"

echo "Identity pool: $IDENTITY_POOL_ID ($COGNITO_REGION)"
echo "Table ARN:      $TABLE_ARN"
echo

AUTH_ROLE_ARN="$(aws cognito-identity get-identity-pool-roles --identity-pool-id "$IDENTITY_POOL_ID" --query "Roles.authenticated" --output text --region "$COGNITO_REGION" 2>/dev/null || true)"
UNAUTH_ROLE_ARN="$(aws cognito-identity get-identity-pool-roles --identity-pool-id "$IDENTITY_POOL_ID" --query "Roles.unauthenticated" --output text --region "$COGNITO_REGION" 2>/dev/null || true)"

if [[ -z "$AUTH_ROLE_ARN" || "$AUTH_ROLE_ARN" == "None" ]]; then
  echo "Authenticated role: not configured"
else
  echo "Authenticated role: $AUTH_ROLE_ARN"
fi

if [[ -z "$UNAUTH_ROLE_ARN" || "$UNAUTH_ROLE_ARN" == "None" ]]; then
  echo "Unauthenticated role: not configured"
else
  echo "Unauthenticated role: $UNAUTH_ROLE_ARN"
fi

echo

audit_role() {
  local role_arn="$1"
  local role_name
  role_name="${role_arn##*/}"
  local found_table_access="false"

  echo "Inspecting role: ${role_name}"

  local attached_policy_arns
  attached_policy_arns="$(aws iam list-attached-role-policies --role-name "$role_name" --query "AttachedPolicies[].PolicyArn" --output text)"
  for policy_arn in $attached_policy_arns; do
    local default_version
    default_version="$(aws iam get-policy --policy-arn "$policy_arn" --query "Policy.DefaultVersionId" --output text)"
    local policy_doc
    policy_doc="$(aws iam get-policy-version --policy-arn "$policy_arn" --version-id "$default_version" --query "PolicyVersion.Document" --output json)"
    if [[ "$policy_doc" == *"dynamodb"* && "$policy_doc" == *"$TABLE_NAME"* ]]; then
      echo "  - attached policy allows DynamoDB table access: $policy_arn"
      found_table_access="true"
    fi
  done

  local inline_policy_names
  inline_policy_names="$(aws iam list-role-policies --role-name "$role_name" --query "PolicyNames[]" --output text)"
  for policy_name in $inline_policy_names; do
    local policy_doc
    policy_doc="$(aws iam get-role-policy --role-name "$role_name" --policy-name "$policy_name" --query "PolicyDocument" --output json)"
    if [[ "$policy_doc" == *"dynamodb"* && "$policy_doc" == *"$TABLE_NAME"* ]]; then
      echo "  - inline policy allows DynamoDB table access: $policy_name"
      found_table_access="true"
    fi
  done

  if [[ "$found_table_access" != "true" ]]; then
    echo "  - no policies mentioning ${TABLE_NAME} were detected"
  fi
}

if [[ -n "$AUTH_ROLE_ARN" && "$AUTH_ROLE_ARN" != "None" ]]; then
  audit_role "$AUTH_ROLE_ARN"
fi

if [[ -n "$UNAUTH_ROLE_ARN" && "$UNAUTH_ROLE_ARN" != "None" ]]; then
  audit_role "$UNAUTH_ROLE_ARN"
fi

if [[ -n "$UNAUTH_ROLE_ARN" && "$UNAUTH_ROLE_ARN" != "None" ]]; then
  echo
  echo "If the unauthenticated role has DynamoDB access above, remove it before production cutover."
fi
