# Cutover Runbook

Use this runbook to move from the legacy AngularJS app to the Next.js app and keep rollback options available during the transition window.

## 1) Pre-cutover freeze

1. Freeze feature work on legacy AngularJS (`legacy-angularjs`) and accept only critical fixes.
2. Confirm production environment variables are set:
   - `AWS_REGION`
   - `FAMILY_DDB_TABLE`
   - `FAMILY_USE_IN_MEMORY_DB=false`
   - `FAMILY_LOGIN_ANSWER` (optional override)
   - `FAMILY_SESSION_SECRET`
   - `CANONICAL_HOST=mcpeakfamily.org`
   - `NEXT_PUBLIC_SITE_URL=https://mcpeakfamily.org`
3. Execute full validation:
   - `npm run validate`
   - `npm run build`

## 2) Staging verification

1. Deploy current branch to staging.
2. Run smoke checks:
   - login
   - list/search/select member
   - save existing member
   - add member
   - delete member
   - email export
   - csv export download
3. Validate write/read behavior against the staging DynamoDB table.

## 3) Production cutover

1. Announce short maintenance window.
2. Deploy Next.js build to production host for `mcpeakfamily.org`.
3. Update DNS and confirm HTTPS certificate is active (see `docs/migration/hosting-mcpeakfamily-org.md`).
4. Verify `http://` and `www.` redirect to `https://mcpeakfamily.org`.
5. Run post-deploy smoke checks against production data.
6. Monitor logs for API 4xx/5xx spikes and DynamoDB throttling.

## 4) Rollback strategy (one release window)

1. Keep prior production artifact (legacy deployment) available for immediate redeploy.
2. If critical regression occurs:
   - Redeploy prior stable artifact.
   - Revert DNS/traffic split to prior app.
   - Open incident and track migration defect.
3. Preserve DynamoDB data (no schema destructive changes introduced by this migration).

## 5) Post-cutover cleanup

1. After stability window, remove obsolete CI/build files no longer needed.
2. Archive final legacy release notes and freeze `legacy-angularjs` as read-only reference.
