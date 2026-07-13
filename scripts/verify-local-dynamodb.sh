#!/usr/bin/env bash
set -euo pipefail

PROFILE="${AWS_PROFILE:-mcpeak-family}"
REGION="${AWS_REGION:-us-west-2}"
TABLE="${FAMILY_DDB_TABLE:-mcpeak}"
EXPECTED_ACCOUNT="754934490052"
USE_COGNITO="${FAMILY_USE_COGNITO_CREDENTIALS:-false}"

if [[ "${USE_COGNITO}" == "true" ]]; then
  echo "Checking DynamoDB via legacy Cognito identity pool..."
  node --input-type=module -e "
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const poolId = process.env.FAMILY_COGNITO_IDENTITY_POOL_ID ?? 'us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150';
const creds = fromCognitoIdentityPool({
  client: new CognitoIdentityClient({ region: 'us-east-1' }),
  identityPoolId: poolId
});
const client = new DynamoDBClient({ region: '${REGION}', credentials: creds });
const out = await client.send(new DescribeTableCommand({ TableName: '${TABLE}' }));
console.log('  Table:', out.Table?.TableName);
console.log('  Status:', out.Table?.TableStatus);
console.log('  Items:', out.Table?.ItemCount);
"
  echo ""
  echo "OK — local dev can use real DynamoDB data (no AWS account login required)."
  echo "Start the app with: npm run dev"
  exit 0
fi

echo "Checking AWS credentials (profile: ${PROFILE})..."
IDENTITY="$(AWS_PROFILE="${PROFILE}" aws sts get-caller-identity --output json)"
ACCOUNT="$(echo "${IDENTITY}" | python3 -c "import json,sys; print(json.load(sys.stdin)['Account'])")"
echo "  Account: ${ACCOUNT}"

if [[ "${ACCOUNT}" != "${EXPECTED_ACCOUNT}" ]]; then
  echo ""
  echo "ERROR: Expected account ${EXPECTED_ACCOUNT} (legacy mcpeak DynamoDB table)."
  echo "You are logged into ${ACCOUNT} instead."
  echo ""
  echo "Options:"
  echo "  A) Local dev without AWS login — set in .env.local:"
  echo "       FAMILY_USE_COGNITO_CREDENTIALS=true"
  echo "  B) IAM/root login — run: aws login --profile ${PROFILE}"
  echo "     then sign into account ${EXPECTED_ACCOUNT}"
  exit 1
fi

echo "Checking DynamoDB table ${TABLE} in ${REGION}..."
AWS_PROFILE="${PROFILE}" aws dynamodb describe-table \
  --table-name "${TABLE}" \
  --region "${REGION}" \
  --query "Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount}" \
  --output table

echo ""
echo "OK — local dev can use real DynamoDB data."
echo "Start the app with: AWS_PROFILE=${PROFILE} npm run dev"
