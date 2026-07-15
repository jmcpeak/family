# Identity Roadmap (Post-Launch)

The current production model uses a shared family challenge answer (`FAMILY_LOGIN_ANSWER`) and short-lived signed session cookies. This is acceptable for the immediate migration launch, but this document defines when and how to move to stronger identity.

## Current posture

- One shared login answer for all users.
- No per-user attribution on member edits.
- No role separation (all authenticated users can edit/delete/export).

## Trigger conditions for upgrading identity

Move off shared-answer auth when any of the following is true:

1. More than one household asks for distinct access controls.
2. You need an edit/audit trail by individual user.
3. Repeated brute-force / abuse attempts are observed in WAF or login-failure alarms.
4. Access must be revoked for a specific person without changing credentials for everyone.

## Recommended evolution path

1. **Phase A — Invite-based accounts**
   - Implement passwordless magic-link sign-in (email OTP or provider-hosted links).
   - Persist a stable user ID in the session payload.
   - Record `updatedByUserId` in mutation paths.

2. **Phase B — Roles**
   - Add at least `viewer` and `editor` roles.
   - Restrict delete/export/survey admin endpoints to `editor`.
   - Add role checks to API guards and UI affordances.

3. **Phase C — Managed identity provider**
   - Move sign-in to Cognito User Pools or equivalent managed IdP.
   - Enforce MFA for editor-capable accounts if risk profile increases.
   - Rotate and retire shared-answer login permanently.

## Migration notes

- Keep session cookie signing/expiration logic, but replace shared-answer validation with user identity claims.
- Add a one-time migration banner so family members know the login flow changed.
- Preserve rollback by running old and new auth strategies behind a feature flag for one release window.
