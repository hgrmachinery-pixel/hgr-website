---
phase: 07-measurement-privacy-security-and-recovery
plan: 02
subsystem: security-and-recovery
tags: [privacy, access-control, staging, secrets, postgres, object-storage]
dependency-graph:
  requires:
    - phase: 07-01
      provides: local privacy-safe measurement and enquiry boundaries
  provides:
    - regression coverage for existing public/private, upload and staff-role boundaries
    - local staging-indexing and tracked-secret hygiene checks
    - provider-neutral synthetic backup and isolated restore procedure
  affects: [phase-07-staging-acceptance, phase-07-live-restore, launch-readiness]
actuals:
  tokens: 4315.75
  tasks: 3
  commits: 3
tech-stack:
  added: []
  patterns: [node-test-regression-coverage, names-only-environment-check, matched-capture-recovery-runbook]
key-files:
  created:
    - tests/phase7-security.test.mjs
    - tests/phase7-staging.test.mjs
    - tests/phase7-secrets.test.mjs
    - docs/operations/backup-and-restore.md
  modified: []
decisions:
  - Keep the existing collections, routes, authentication, permissions, storage policy and deployment architecture unchanged.
  - Treat robots/noindex as crawler guidance only; host authentication, cache behavior and live restore require separately approved target checks.
  - Use synthetic-only data and a shared recorded capture revision for database and object recovery evidence.
metrics:
  duration: about 14 minutes
  completed: 2026-10-02
  status: complete
status: complete
requirements-completed: [SAFE-02, SAFE-04, SAFE-07]
requirements-pending: [SAFE-01, SAFE-03, SAFE-05]
plan_head_before: 36335a2141f22918f0eff8f9ba4f14658ed82913
plan_head_after: 869d26c17f6a9f8480a535d55f82857278ceaa56
---

# Phase 07 Plan 02: Security Regression and Recovery Runbook Summary

Added local regression checks around existing access and privacy boundaries, fail-closed crawler policy and repository secret hygiene, plus an isolated synthetic-data backup/restore procedure.

## Performance

- **Duration:** About 14 minutes; exact start time was not captured.
- **Completed:** 2026-10-02
- **Tasks:** 3
- **Files changed by this plan:** 4

## Accomplishments

- Added regression coverage for draft/private projection, public-query constraints, private document responses, private media, input validation and the initial staff-role boundary.
- Added source-level staging-indexing checks that clearly distinguish crawler directives from host authentication and cache denial.
- Added tracked-file credential-pattern checks that report paths and rule categories without printing matched values. They detect quoted and unquoted credential assignments and reject tracked real environment files. The existing safe `HGR_LOCAL_UI_REVIEW=false` default is allowed; other environment-example values must be blank.
- Documented matched database/object capture points, migration/source revisions, separated public/private object classes, protected configuration, permission parity, isolated restore checks and explicit stop conditions.

## Verification

- `node --test tests/phase7-security.test.mjs tests/machine-access.test.mjs tests/machine-documents.test.mjs tests/machine-media.test.mjs tests/phase5-enquiries.test.mjs` — passed, 55 tests.
- `node --test tests/phase7-staging.test.mjs tests/phase7-secrets.test.mjs tests/phase6-seo.test.mjs` — passed, 15 tests.
- `node --test tests/phase7-secrets.test.mjs` — passed, 2 tests.
- After Sol's audit identified quoted-assignment and tracked-environment-file coverage gaps, the focused analytics/secret suite passed again (10 tests), including synthetic quoted credential and tracked `.env` filename cases.
- The follow-up also handles cross-tab `localStorage.clear()` by returning the app-level consent adapter to unknown; focused analytics and secret checks, typecheck and diff check passed.
- `git diff --check HEAD` — passed.
- `npm run typecheck` — passed.
- No provider endpoint was contacted, no service/resource was created, and no live backup or restore was attempted.

## Owner Gates Remaining

- SAFE-03 staging host authentication/cache acceptance remains open until the exact target is verified.
- SAFE-05 live database-and-object restore evidence remains open until an exact disposable target and rehearsal are approved.
- SAFE-01 broad deployed page/API/media/cache acceptance remains pending; these tests provide local regression evidence only.
- External recipient, retention, privacy reviewer and provider facts remain owner-confirmation items. No provider, account, target, schedule, retention period, operator or credential was selected.

## Task Commits

1. **Task 1: Add regressions for public, private and upload boundaries** — `0f17064` (`test`).
2. **Task 2: Check fail-closed staging and source-control hygiene** — `938742d` (`test`).
3. **Task 3: Document portable backup and recovery steps** — `869d26c` (`docs`).

**Measured plan commits:** 3, from `36335a2141f22918f0eff8f9ba4f14658ed82913` through `869d26c17f6a9f8480a535d55f82857278ceaa56`.

## Files Created

- `tests/phase7-security.test.mjs` — public projection/query, private document/media, role and validation regressions.
- `tests/phase7-staging.test.mjs` — fail-closed indexing policy and crawler-vs-access distinction.
- `tests/phase7-secrets.test.mjs` — names-only environment template and non-disclosing tracked-file scan.
- `docs/operations/backup-and-restore.md` — portable recovery template for synthetic-only, isolated rehearsal.

## Deviations from Plan

**Post-close-out security correction:** Sol's review found the original secret check missed quoted assignments and did not detect tracked real environment files. The scanner and tests were corrected to cover both; no actual credential was found. The privacy-boundary summary for 07-01 now explicitly limits local consent evidence to application events and keeps external tag-container/withdrawal behavior gated for owner verification. The pre-existing `.env.example` edit was preserved; its single non-secret false-valued local-review flag remains explicitly allowed by the local template check.

## Known Stubs

None. The runbook's `TO CONFIRM` fields are intentional owner gates for facts the plan forbids guessing; they do not represent a claimed live restore.

## Self-Check: PASSED

All four listed artifacts exist. The three task commits are present, and their measured count matches the plan ledger range.

---
*Phase: 07-measurement-privacy-security-and-recovery*
*Completed: 2026-10-02*
