# Notify family (SES email / SNS SMS)

Signed-in users can open **More → Notify family** to:

1. Copy member emails (manual send fallback)
2. Email a site-link blast via Amazon SES (editable subject + body)
3. Text a site-link blast via Amazon SNS when enabled (editable body)

The login city answer is **not** included in outbound messages.

## App routes

| Route | Purpose |
|---|---|
| `GET /api/emails` | Unique member emails |
| `GET /api/phones` | Member phone strings on file |
| `POST /api/notify/email` | Blast site link by email |
| `POST /api/notify/sms` | Blast site link by SMS |

Body (optional):

```json
{
  "dryRun": true,
  "memberIds": ["member-guid-1", "member-guid-2"],
  "subject": "McPeak family directory",
  "text": "You're invited to the McPeak family directory: https://mcpeakfamily.org"
}
```

- `dryRun: true` — logs payloads without calling AWS (also forced when `FAMILY_MESSAGING_DRY_RUN=true`).
- `memberIds` — send only to those members’ on-file email/phone. Omit to blast everyone. Empty array is rejected (`400`). Contacts are always resolved server-side from member records (client-supplied addresses are not accepted).
- `subject` — email only; omit to use the default template subject.
- `text` — plain-text body for email and SMS; omit to use the default channel template. Email HTML is derived from this text.

In the UI, **Email or text family** includes editable subject/body fields and per-channel multi-select pickers (Select all / Clear). Defaults to everyone eligible; narrow the list for a one-person smoke test or partial send.

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
2. Open **More → Email or text family**
3. Edit subject/body if needed; confirm (or narrow) email and text recipients
4. Choose **Send email** and/or **Send text**
5. Use **Copy emails** if AWS email is not configured yet

## Reputation

Watch SES bounce/complaint metrics in the AWS console after blasts. Automated bounce webhooks are out of scope for v1.
