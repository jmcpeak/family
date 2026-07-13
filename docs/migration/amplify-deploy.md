# Deploy to AWS Amplify (mcpeakfamily.org)

Step-by-step guide to host the Next.js app on [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html) with HTTPS and DynamoDB access.

Production URL target: [https://mcpeakfamily.org](https://mcpeakfamily.org)

## Before you start

- [ ] AWS account with access to Amplify, IAM, and DynamoDB
- [ ] GitHub repo pushed with this branch (`family` project)
- [ ] DynamoDB table `mcpeak` exists in **us-west-2** (legacy app used this region)
- [ ] Domain `mcpeakfamily.org` DNS managed at your registrar (Route 53 or other)

**Recommended Amplify region:** `US West (Oregon) / us-west-2` (same region as DynamoDB).

---

## Step 1 — Log into AWS (CLI)

Your default profile has **expired access keys**. Use a dedicated profile:

```bash
# In your terminal (opens browser — complete sign-in there)
aws configure set region us-west-2 --profile mcpeak-family
aws login --profile mcpeak-family

# Verify you're in the family account (legacy DynamoDB account)
AWS_PROFILE=mcpeak-family aws sts get-caller-identity
# Expect Account: 754934490052
```

If `aws login` is unavailable, configure credentials manually:

```bash
aws configure --profile mcpeak-family
# Enter access key, secret key, region us-west-2
```

---

## Step 2 — Run automated CLI setup

From the repo root (after code is pushed to GitHub):

```bash
# Optional: GitHub PAT with repo scope for auto-deploy from GitHub
export GITHUB_TOKEN=ghp_your_token_here

export AWS_PROFILE=mcpeak-family
./scripts/amplify-setup.sh
```

This script via AWS CLI:

1. Creates IAM compute role `amplify-family-compute-role` with DynamoDB access
2. Creates/updates Amplify app `mcpeak-family` (WEB_COMPUTE / Next.js SSR)
3. Sets production environment variables
4. Creates `main` branch
5. Starts a deploy (if `GITHUB_TOKEN` is set)
6. Associates `mcpeakfamily.org` and prints DNS records

Check status anytime:

```bash
AWS_PROFILE=mcpeak-family ./scripts/amplify-status.sh
```

Redeploy:

```bash
AWS_PROFILE=mcpeak-family ./scripts/amplify-deploy.sh
```

---

## Step 2 (manual) — Create IAM SSR Compute role

Skip if you used `./scripts/amplify-setup.sh` above.


Amplify SSR apps need a **Compute role** so API routes can call DynamoDB without hardcoded keys. See [Amplify SSR Compute role docs](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html).

### 2a. Create the role

1. Go to **IAM** → **Roles** → **Create role**
2. **Trusted entity type:** AWS service
3. **Use case:** Amplify → **Amplify - Backend Deployment** (or custom trust; Amplify console can also guide this when you attach the role later)
4. Click **Next**

Alternatively, use **Custom trust policy** if Amplify offers "Compute role" in the wizard:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "amplify.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

5. **Permissions:** Create inline policy from [`infra/amplify-compute-dynamodb-policy.json`](../../infra/amplify-compute-dynamodb-policy.json)
   - Replace `ACCOUNT_ID` with your 12-digit AWS account ID
6. **Role name:** `amplify-family-compute-role`
7. **Create role**

---

## Step 3 — Create the Amplify app

1. Go to **AWS Amplify** → **Create new app**
2. Choose **Host web app**
3. **GitHub** → Authorize AWS Amplify to access GitHub if prompted
4. Select repository: `jmcpeak/family` (or your fork)
5. Select branch: `main`
6. Amplify should detect **Next.js - SSR**
7. Confirm build settings use repo root **`amplify.yml`** (already in this project)
8. **Advanced settings** → Environment variables (add all):

| Variable | Value |
|---|---|
| `AWS_REGION` | `us-west-2` |
| `FAMILY_DDB_TABLE` | `mcpeak` |
| `FAMILY_USE_IN_MEMORY_DB` | `false` |
| `FAMILY_SESSION_SECRET` | *(generate a long random string)* |
| `CANONICAL_HOST` | `mcpeakfamily.org` |
| `NEXT_PUBLIC_SITE_URL` | `https://mcpeakfamily.org` |
| `NODE_ENV` | `production` |

Do **not** set `FAMILY_LOGIN_ANSWER` unless you want to override the reunion-city check.

9. **Save and deploy**

First build takes several minutes. When it succeeds, Amplify gives you a URL like:

`https://main.d1234abcdef.amplifyapp.com`

### 3b. Attach Compute role

1. Amplify app → **App settings** → **IAM roles**
2. Under **Compute role**, click **Edit**
3. Select `amplify-family-compute-role`
4. Save

Redeploy if the first deploy ran before the role was attached ( **Hosting** → branch → **Redeploy this version** ).

---

## Step 4 — Smoke test on Amplify URL

Before touching DNS, verify on the `*.amplifyapp.com` URL:

- [ ] Login with **New London**
- [ ] Member list loads from DynamoDB
- [ ] Save / add / delete works
- [ ] CSV export works

If DynamoDB calls fail with access denied, recheck the Compute role policy and `FAMILY_DDB_TABLE`.

---

## Step 5 — Add custom domain + HTTPS

Amplify provisions ACM certificates automatically when you add a domain.

1. Amplify app → **Hosting** → **Custom domains**
2. **Add domain** → enter `mcpeakfamily.org`
3. Also add `www.mcpeakfamily.org` if offered (app redirects www → apex)
4. Amplify shows DNS records to create at your registrar

Typical records (Amplify shows exact values in console):

| Host | Type | Points to |
|---|---|---|
| `mcpeakfamily.org` (apex) | ANAME/ALIAS or Amplify-provided A records | Amplify CloudFront distribution |
| `www` | CNAME | Amplify target hostname |

5. Add records at your DNS provider (Route 53, Cloudflare, etc.)
6. Wait for certificate status **Available** (can take 15–60 minutes)

HTTPS is automatic once DNS validates. No extra cert step needed.

---

## Step 6 — Cut over from legacy site

The old site at [http://mcpeakfamily.org](http://mcpeakfamily.org) likely pointed to GitHub Pages or static hosting.

1. Remove old GitHub Pages / static DNS records for `mcpeakfamily.org`
2. Keep only Amplify-provided records
3. Verify:
   - `http://mcpeakfamily.org` → `https://mcpeakfamily.org`
   - `https://www.mcpeakfamily.org` → `https://mcpeakfamily.org`
   - Login and CRUD against production data

---

## Troubleshooting

### Build fails (Node version)

This repo requires Node 20+. `amplify.yml` runs `nvm use 20`. In Amplify console → **Build settings**, confirm build image supports Node 20.

### Build fails (Next.js 16)

Amplify officially documents support through Next.js 15 ([SSR support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)). This app uses Next.js 16; if build fails, check Amplify build logs. Most Next.js 16 SSR apps work on `WEB_COMPUTE` with `baseDirectory: .next`.

### DynamoDB access denied

- Confirm Compute role is attached (not just the build Service role)
- Confirm policy ARN includes correct account ID and table name `mcpeak`
- Confirm `AWS_REGION=us-west-2` and `FAMILY_DDB_TABLE=mcpeak`

### Login works locally but not on Amplify

- `FAMILY_SESSION_SECRET` must be set in Amplify env vars
- Site must be served over HTTPS (cookies are `Secure` in production)

---

## Quick reference links

- [Deploy Next.js SSR to Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [Amplify SSR Compute IAM role](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html)
- [Amplify custom domains](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)
