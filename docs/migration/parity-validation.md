# Parity Validation

This document tracks legacy-to-Next behavior parity for the big-bang migration.

## Automated validation status

- `npm run lint`: passing
- `npm run typecheck`: passing
- `npm run test`: passing
- `npm run build`: passing

## Workflow parity checklist

| Area | Legacy behavior | Next migration status |
| --- | --- | --- |
| Login gate | Challenge question required before main app | Implemented via `/api/auth/login` and session cookie |
| Member list | Search + alphabetical ordering + selected user highlight | Implemented in `src/components/family-app.tsx` |
| Last update banner | Shows last update date and user | Implemented via metadata from `/api/members` |
| Save/Add/Delete | CRUD flows with API-backed persistence | Implemented via `/api/members` and `/api/members/[id]` |
| Parent selectors | Father/mother lists filtered by gender | Implemented via `/api/parents` |
| Display-name generation | Suggested display names based on name fields | Implemented in `buildDisplayNameOptions` |
| Address links | Maps/street-view preview for valid addresses | Implemented in address tab |
| Email utility | Gather and copy bulk addresses | Implemented via `/api/emails` dialog |
| CSV export | Download contact CSV | Implemented via `/api/export/mailing` |
| Children rows | Add/remove dynamic child rows | Implemented with legacy dynamic field keys |

## Remaining manual UAT

- Validate login challenge answer against production secret.
- Validate DynamoDB table integration in non-memory mode.
- Verify parity against real historical records for edge-case fields.
- Verify street-view image rendering and outbound map links in production.
