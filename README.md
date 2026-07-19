# Family (Next.js Migration)

This repository now runs on modern Next.js + React + TypeScript.

The original AngularJS/Grunt/Bower application is preserved in `legacy-angularjs` for reference during migration validation.

## Requirements

- Node.js 20+
- npm 10+

## Stack

- Next.js 16 + React 19
- MUI 9 (`@mui/material`, `@mui/icons-material`) with Emotion
- TypeScript 7, Vitest, Biome

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open **https://localhost:3000** (dev server uses a self-signed certificate; your browser may show a one-time security warning).

For plain HTTP instead: `npm run dev:http`

By default, `.env.example` enables `FAMILY_USE_IN_MEMORY_DB=true` so you can run the app without AWS while validating UI and API behavior.

### Local development with real DynamoDB

The family data lives in DynamoDB table `mcpeak` in AWS account **754934490052** (`us-west-2`).

**Easiest path (no AWS login):** the legacy public site used a Cognito identity pool for DynamoDB access. Enable the same for local dev:

```bash
# In .env.local
FAMILY_DDB_TABLE=mcpeak
FAMILY_USE_IN_MEMORY_DB=false
FAMILY_USE_COGNITO_CREDENTIALS=true
```

Verify:

```bash
FAMILY_USE_COGNITO_CREDENTIALS=true ./scripts/verify-local-dynamodb.sh
npm run dev
```

**Alternative (IAM/root credentials):** log into account `754934490052` and use an AWS profile:

```bash
aws configure set region us-west-2 --profile mcpeak-family
aws login --profile mcpeak-family
# Sign into account 754934490052 — use the account-specific console URL if needed:
# https://754934490052.signin.aws.amazon.com/console
AWS_PROFILE=mcpeak-family ./scripts/verify-local-dynamodb.sh
```

If `aws login` keeps landing in the wrong account, use the Cognito option above or create access keys in the `754934490052` console and run `aws configure --profile mcpeak-family`.

## Environment variables

- `AWS_REGION`: AWS region for DynamoDB access.
- `FAMILY_DDB_TABLE`: DynamoDB table name for production data.
- `FAMILY_USE_IN_MEMORY_DB`: `true` to use local in-memory repository, `false` to use DynamoDB.
- `FAMILY_LOGIN_ANSWER`: Plain-text login challenge answer. Required in production.
- `FAMILY_SESSION_SECRET`: Secret used to sign session cookies.
- `CANONICAL_HOST`: Production hostname (default `mcpeakfamily.org`).
- `NEXT_PUBLIC_SITE_URL`: Canonical site URL (default `https://mcpeakfamily.org`).

## Production hosting

The app is intended for [https://mcpeakfamily.org](https://mcpeakfamily.org). Production builds enforce HTTPS redirects and secure cookies.

- General hosting + HTTPS: `docs/migration/hosting-mcpeakfamily-org.md`
- **AWS Amplify deploy walkthrough:** `docs/migration/amplify-deploy.md`

## Scripts

- `npm run dev` - start Next dev server with HTTPS (self-signed cert).
- `npm run dev:http` - start Next dev server over HTTP.
- `npm run build` - production build.
- `npm run start` - run production server.
- `npm run lint` - run Biome checks.
- `npm run typecheck` - TypeScript check.
- `npm run test` - run unit tests.
- `npm run test:coverage` - run tests with coverage.
- `npm run test:smoke` - run non-destructive Playwright smoke tests.
- `npm run test:smoke:staging` - run write/revert smoke flow (`SMOKE_ALLOW_WRITES=true`).
- `npm run validate` - lint + typecheck + unit tests + coverage + critical coverage checks.
- `npm run amplify:verify` - run AWS launch-readiness checks (PITR, alarms, redirects, health).

## Migration docs

- Baseline and scope: `docs/migration/baseline-and-scope.md`
- Hosting and HTTPS: `docs/migration/hosting-mcpeakfamily-org.md`
- AWS Amplify deploy: `docs/migration/amplify-deploy.md`
- Identity roadmap: `docs/migration/identity-roadmap.md`

