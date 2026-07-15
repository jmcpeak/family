# Hosting mcpeakfamily.org with HTTPS

Production URL: [https://mcpeakfamily.org](https://mcpeakfamily.org)

The legacy app at [http://mcpeakfamily.org](http://mcpeakfamily.org) was a static AngularJS site. The Next.js app requires a Node-capable host because it uses API routes, server sessions, and DynamoDB access.

## What the app enforces

1. **HTTP → HTTPS redirect** in production (`src/proxy.ts`)
   - Any request where the proxy reports `x-forwarded-proto: http` is redirected to `https://mcpeakfamily.org`.
2. **www → apex redirect** in production
   - `https://www.mcpeakfamily.org` redirects to `https://mcpeakfamily.org`.
3. **HSTS header** in production (`next.config.ts`)
   - Browsers are instructed to use HTTPS for two years (`Strict-Transport-Security`).
4. **Secure session cookies** in production (`src/lib/auth.ts`)
   - Auth cookies are marked `Secure` so they are only sent over HTTPS.

## Required production environment variables

```bash
NODE_ENV=production
AWS_REGION=us-west-2
FAMILY_DDB_TABLE=mcpeak
FAMILY_USE_IN_MEMORY_DB=false
FAMILY_LOGIN_ANSWER=<private-family-answer>
FAMILY_SESSION_SECRET=<long-random-secret>
CANONICAL_HOST=mcpeakfamily.org
NEXT_PUBLIC_SITE_URL=https://mcpeakfamily.org
```

## DNS cutover (high level)

1. Deploy the Next.js app to your hosting provider.
2. Point `mcpeakfamily.org` DNS to the new host (replace any GitHub Pages records).
3. Enable TLS/HTTPS at the host or edge (most providers issue certificates automatically).
4. Verify:
   - `http://mcpeakfamily.org` → redirects to `https://mcpeakfamily.org`
   - `https://www.mcpeakfamily.org` → redirects to `https://mcpeakfamily.org`
   - Login, member list, save/delete, export all work over HTTPS

## Recommended hosting options

### Option A: Vercel (simplest for Next.js)

1. Import the GitHub repo in Vercel.
2. Set production environment variables (see above).
3. Add custom domain `mcpeakfamily.org` in Vercel project settings.
4. Update DNS per Vercel instructions (usually `A`/`CNAME` records).
5. Vercel provisions and renews HTTPS certificates automatically.

### Option B: AWS Amplify Hosting

Detailed walkthrough: [`docs/migration/amplify-deploy.md`](amplify-deploy.md)

1. Connect the repo to Amplify (GitHub).
2. Use repo `amplify.yml` (Node 20, `.next` SSR output).
3. Set production environment variables (see above).
4. Attach an **SSR Compute IAM role** with DynamoDB access (`infra/amplify-compute-dynamodb-policy.json`).
5. Add custom domain `mcpeakfamily.org`.
6. Update DNS per Amplify console; HTTPS certificate is provisioned automatically.

### Option C: Cloudflare in front of any origin

1. Point DNS to Cloudflare.
2. Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
3. Set SSL/TLS mode to **Full (strict)** once the origin serves HTTPS.
4. Keep app proxy as a backup redirect layer.

## Post-deploy smoke checks

- [ ] `https://mcpeakfamily.org` loads the login screen
- [ ] Login with configured `FAMILY_LOGIN_ANSWER` works
- [ ] Session persists after refresh
- [ ] Member CRUD works against production DynamoDB
- [ ] CSV export downloads over HTTPS
- [ ] No mixed-content warnings in browser devtools

## Rollback

If cutover fails, revert DNS to the prior host serving the legacy static app while keeping DynamoDB data unchanged.
