---
phase: 02-machine-model-and-payload-owner-workflow
plan: 03
subsystem: auth-and-migrations
tags: [payload-auth, draft-preview, postgres-migration, security]
requires: [02-01-permanent-machine-identity, 02-02-structured-content]
provides: [protected-staff-accounts, authenticated-draft-preview, registered-phase2-migration]
affects: [03-photography-and-jpj-protection, 04-public-inventory, 05-enquiries]
completed: 2026-10-01
duration: 1 session
tasks: 3
requirements-completed: [ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-10]
requirements-pending: []
status: complete
---

# Phase 2 Plan 03 Summary

**Payload staff access, short-lived authenticated draft preview, and the reviewed PostgreSQL migration are ready for an approved local database.**

## Accomplishments

- Added Payload owner and website-administrator identities. First-user setup assigns the owner; server-side rules permit only one owner-created administrator, lock identity roles, and deny account deletion and public staff creation.
- Restricted machine, media, page, version, and Admin access to recognized Payload staff identities. HTTPS auth cookies use `Secure`.
- Added a five-minute machine-bound signed preview link; the route authenticates staff, reads with access checks enabled, enables Draft Mode only after validation, and redirects to the configured origin.
- Added a no-delivery email adapter so password-reset tokens are never printed or sent before Phase 5 email setup.
- Generated and reviewed the Phase 2 migration, including machine/page versions, contact/media tables, the permanent ID sequence, and the existing users-table role extension. The migration stops safely if pre-existing user rows need owner identification.

## Verification

- `node --test tests/machine-model.test.mjs tests/machine-access.test.mjs tests/smoke-environment.test.mjs` — passed (26 tests).
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.
- Full `node --test` — three existing config-test child processes fail in this sandbox because `tsx` calls OS `userInfo()` and receives `uv_os_get_passwd returned ENOMEM`. A temporary workaround caused those child processes to stall; it was removed. Phase 2 tests and other test files pass.
- `npm audit` — reports 21 dependency advisories (2 low, 18 moderate, 1 high), including a high finding in Payload's separate `undici@7.29.0` dependency. Existing Payload package versions were kept aligned; no audit fix or downgrade was applied. Track security remediation as a separate dependency review before deployment.
- The migration was not applied: no approved disposable PostgreSQL service is available. The Admin, account-creation race, media-storage, and live recovery flows therefore remain unverified against services.

## Deferred Work and Next Phase Readiness

- Apply the reviewed migration and verify two staff accounts against an already available approved disposable PostgreSQL service.
- Configure real password-reset email delivery in Phase 5; configure media storage and verify uploads when an approved compatible service is available.
- Resolve or explicitly assess dependency advisories before deployment. Do not downgrade the aligned Payload stack to npm's suggested versions.
- Phase 2 local implementation is complete. Phase 3 may proceed as local work, with live media/database verification still pending. Phase 3 was not started.

---
*Phase: 02-machine-model-and-payload-owner-workflow*
*Completed: 2026-10-01*
