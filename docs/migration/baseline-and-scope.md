# Baseline And Scope

This document captures current behavior in the legacy AngularJS app and defines parity scope for the Next.js migration.

## Legacy architecture summary

- Framework: AngularJS 1.4 app rooted at `src/index.html` and `src/app`.
- Build/tooling: Grunt + Bower (`Gruntfile.js`, `bower.json`).
- Data access: Browser-side AWS SDK v2 in `src/app/app.js` (`jmDB` service).
- Authentication gate: challenge question in `src/app/user/login.tpl.html` plus Cognito credential fetch in `src/app/user/user.js`.

## Module-to-feature mapping

| Legacy module/file | Current behavior | Next target |
| --- | --- | --- |
| `src/app/list/list.js` + `src/app/list/list.tpl.html` | Loads family records, renders searchable/sortable member list, drives selected user | `app/page.tsx` list pane + shared list components |
| `src/app/user/user.js` + `src/app/user/content.tpl.html` + `src/app/user/tabs.tpl.html` | Save/add/delete, tabbed editor, about/email dialogs, search drawer | Main workspace UI components + dialogs/modals |
| `src/app/partials/required.tpl.html` | Core profile fields, generated display names, father/mother lookup | `FamilyMemberForm` profile section |
| `src/app/partials/address.tpl.html` | Address/contact fields + Google maps/street-view links | `FamilyMemberForm` contact/address section |
| `src/app/partials/spouse.tpl.html` | Spouse identity fields | `FamilyMemberForm` spouse section |
| `src/app/partials/datesAndPlaces.tpl.html` | Birth/wedding/death dates and places + derived durations | `FamilyMemberForm` dates/places section |
| `src/app/partials/children.tpl.html` | Dynamic child rows and pets notes | `FamilyMemberForm` children/pets section |
| `src/app/input/*.js` + `src/app/input/*.tpl.html` | Angular input/select/duration primitives and validation wrappers | Reusable React form field components |

## Data-operation migration matrix

Source implementation: `jmDB` service in `src/app/app.js`.

| Legacy call | Current purpose | Proposed Next API route | Notes |
| --- | --- | --- | --- |
| `queryAll()` | Scan all family members (excluding short ids) | `GET /api/members` | Keep default sort on client (`lastName`, `firstName`) |
| `queryParents(gender)` | Scan potential father/mother options | `GET /api/parents?gender=m|f` | Preserve spouse-gender fallback logic |
| `getEmailAddresses()` | Return non-empty email list for bulk mail | `GET /api/emails` | UI still offers copy-to-clipboard list |
| `exportToCSV()` | Download CSV of key contact fields | `GET /api/export.csv` | Server-generated CSV stream |
| `getItem(id)` | Fetch member or metadata row (`lastUpdateDate`) | `GET /api/members/{id}` | Support metadata id path |
| `putItem(user)` | Upsert member record | `PUT /api/members/{id}` | Server updates metadata after write |
| `deleteItem(user)` | Delete member by id | `DELETE /api/members/{id}` | Preserve optimistic UI removal |
| `setLastUpdateDate(id)` | Write metadata row with timestamp and id | internal helper | Keep internal to API layer |

## Data model baseline (legacy shape)

Common top-level fields used by UI:

- identity: `id`, `firstName`, `middleName`, `lastName`, `maidenName`, `titleName`, `suffixName`, `nickName`, `displayName`, `gender`
- family links: `father`, `mother`
- contact/location: `email`, `phone`, `address`, `address2`, `city`, `theState`, `zipcode`, `country`
- spouse: `firstNameSpouse`, `middleNameSpouse`, `lastNameSpouse`, `maidenNameSpouse`, `titleNameSpouse`, `suffixNameSpouse`, `nickNameSpouse`, `genderSpouse`, `hobbiesSpouse`
- lifecycle/dates: `birthday`, `cityBirth`, `stateBirth`, `wedding`, `cityWedding`, `stateWedding`, `death`, `cityDeath`, `stateDeath`
- spouse lifecycle: `bithdaySpouse` (legacy misspelling retained in current data), `cityBirthSpouse`, `stateBirthSpouse`, `deathSpouse`, `cityDeathSpouse`, `stateDeathSpouse`
- children/pets: `children` (number array of row ids), `firstNameChild{n}`, `middleNameChild{n}`, `lastNameChild{n}`, `bithdayChild{n}`, `genderChild{n}`, `pets`
- misc text: `hobbies`

Metadata row shape:

- primary key `id = "lastUpdateDate"`
- fields: `lastUpdated` (epoch millis), `lastUpdatedID` (member id attribute object in DynamoDB format)

## Parity checklist for migration signoff

- Login gate appears first and blocks app until successful sign-in.
- Member list supports search and alphabetical ordering.
- Selecting a member loads full record and highlights active row.
- Save/Add/Delete flows function with user feedback.
- Father/mother dropdown options update based on gender filtering.
- Display-name suggestions recompute as name-related fields change.
- CSV export downloads contact data.
- Email utility produces bulk address list and copy action.
- Address section still supports maps/street-view links when address fields are valid.
- Children rows can be added/removed and persist correctly.
- Last update banner displays timestamp + affected member id.
