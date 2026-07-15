# Cutover Runbook

Use this runbook to move from the legacy AngularJS app to the Next.js app and keep rollback options available during the transition window.

## 1) Pre-cutover freeze

1. Freeze feature work on legacy AngularJS (`legacy-angularjs`) and accept only critical fixes.
2. Confirm production environment variables are set:
   - `AWS_REGION`
   - `FAMILY_DDB_TABLE`
   - `FAMILY_USE_IN_MEMORY_DB=false`
   - `FAMILY_LOGIN_ANSWER` (required; keep private)
   - `FAMILY_SESSION_SECRET`
   - `CANONICAL_HOST=mcpeakfamily.org`
   - `NEXT_PUBLIC_SITE_URL=https://mcpeakfamily.org`
3. Verify legacy Cognito identity-pool roles cannot read/write the production table:
   - `AWS_PROFILE=mcpeak-family ./scripts/audit-cognito-access.sh`
   - Remove DynamoDB access from the unauthenticated role if detected.
4. Configure edge rate limiting with AWS WAF:
   - `AWS_PROFILE=mcpeak-family ./scripts/configure-waf.sh`
   - Defaults: `120` requests/5m/IP for `/api/auth/login`, `500` requests/5m/IP for sensitive API routes.
   - Keep `/api/health` and static assets excluded from these rules.
5. Configure CloudWatch dashboard + alarms:
   - `AWS_PROFILE=mcpeak-family ./scripts/configure-cloudwatch-alarms.sh`
   - Ensure alarms exist for API 5xx, login failures, readiness failures, WAF blocks, and DynamoDB throttles.
6. Execute full validation:
   - `npm run validate`
   - `npm run build`
7. Run launch-readiness verification (AWS + redirect + health checks):
   - `AWS_PROFILE=mcpeak-family CREATE_BACKUP=true npm run amplify:verify`
   - Optional restore test: add `RESTORE_TABLE_NAME=mcpeak-restore-check` to verify backup recovery.

## 2) Staging verification

1. Deploy current branch to staging.
2. Run automated smoke checks:
   - Local/non-destructive CI smoke: `npm run test:smoke`
   - Staging full smoke: `SMOKE_BASE_URL=https://staging-url PLAYWRIGHT_LOGIN_ANSWER='your-answer' npm run test:smoke:staging`
3. Run smoke checks:
   - `/api/health/live` returns `200`
   - `/api/health/ready` returns `200`
   - login
   - list/search/select member
   - save existing member
   - add member
   - delete member
   - email export
   - csv export download
4. Validate write/read behavior against the staging DynamoDB table.

## 3) Production cutover

1. Announce short maintenance window.
2. Deploy Next.js build to production host for `mcpeakfamily.org`.
3. Update DNS and confirm HTTPS certificate is active (see `docs/migration/hosting-mcpeakfamily-org.md`).
4. Verify `http://` and `www.` redirect to `https://mcpeakfamily.org`.
5. Run post-deploy smoke checks against production data.
6. Monitor logs for API 4xx/5xx spikes, WAF blocks, readiness failures, and DynamoDB throttling.
7. Re-run `npm run amplify:verify` without `CREATE_BACKUP` to confirm production remains healthy after cutover.

## 4) Rollback strategy (one release window)

1. Keep prior production artifact (legacy deployment) available for immediate redeploy.
2. If critical regression occurs:
   - Redeploy prior stable artifact.
   - Revert DNS/traffic split to prior app.
   - Temporarily disassociate WAF web ACL if false positives are blocking valid traffic.
   - Open incident and track migration defect.
3. Preserve DynamoDB data (no schema destructive changes introduced by this migration).

## 5) Post-cutover cleanup

1. After stability window, remove obsolete CI/build files no longer needed.
2. Archive final legacy release notes and freeze `legacy-angularjs` as read-only reference.
3. Review `docs/migration/identity-roadmap.md` and choose trigger thresholds for moving off shared-answer auth.
