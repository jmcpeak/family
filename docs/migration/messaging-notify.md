# Notify family (SES email / SNS SMS)

Signed-in users can open **More → Notify family** to:

1. Copy member emails (manual send fallback)
2. Email a fixed site-link blast via Amazon SES
3. Text a fixed site-link blast via Amazon SNS (when enabled)

The login city answer is **not** included in outbound messages.

## App routes

| Route | Purpose |
|---|---|
| `GET /api/emails` | Unique member emails |
| `GET /api/phones` | Member phone strings on file |
| `POST /api/notify/email` | Blast site link by email |
| `POST /api/notify/sms` | Blast site link by SMS |

Body (optional): `{ "dryRun": true }` — logs payloads without calling AWS (also forced when `FAMILY_MESSAGING_DRY_RUN=true`).

## Environment

| Variable | Meaning |
|---|---|
| `FAMILY_SES_FROM_ADDRESS` | Verified SES from address (e.g. `noreply@mcpeakfamily.org`) |
| `FAMILY_MESSAGING_DRY_RUN` | `true` = never call SES/SNS |
| `FAMILY_SMS_ENABLED` | `true` only after AWS SMS origination / 10DLC is ready |
| `NEXT_PUBLIC_SITE_URL` | Link embedded in templates |

Local default: dry-run on (see `.env.example`).

## AWS setup checklist

### Email (SES)

1. In `us-west-2` (app region), verify domain `mcpeakfamily.org` in SES.
2. Publish DKIM DNS records; wait until verified.
3. If the account is still in the SES sandbox, request production access (sandbox can only send to verified addresses).
4. Set Amplify env `FAMILY_SES_FROM_ADDRESS=noreply@mcpeakfamily.org` and `FAMILY_MESSAGING_DRY_RUN=false`.
5. Ensure the Amplify compute role has `FamilyMessagingAccess` (attached by `scripts/amplify-setup.sh` from `infra/amplify-compute-messaging-policy.json`).

### SMS (SNS)

1. Request an SMS spend limit / exit sandbox as needed in SNS.
2. Complete US A2P 10DLC (or toll-free) registration for production traffic.
3. Confirm member profiles have usable phone numbers (US 10-digit preferred).
4. Set `FAMILY_SMS_ENABLED=true` on Amplify.

### IAM note

`sns:Publish` is allowed on `*` because direct SMS publish does not target a topic ARN. Restrict further if AWS adds tighter resource patterns for your account.

## How to send (Karen / any signed-in user)

1. Sign in to https://mcpeakfamily.org
2. Open **More → Notify family**
3. Confirm recipient counts and message preview
4. Choose **Send email blast** and/or **Send SMS blast**
5. Use **Copy emails** if AWS email is not configured yet

## Reputation

Watch SES bounce/complaint metrics in the AWS console after blasts. Automated bounce webhooks are out of scope for v1.
