---
phase: 03-photography-media-processing-and-jpj-protection
plan: 04
subsystem: database
tags: [payload, postgres, migration, roles, audit, media-security]
requires:
  - phase: 03
    provides: private media/document workflows, persisted permissions and append-only application audit events
provides:
  - Locally generated and reviewed Phase 3 schema migration and snapshot, not applied
  - Fail-closed legacy role mapping, stable Owner/Admin seed and photo sequence
  - Owner-only role/account administration safeguards, with concurrency-aware Owner bootstrap and retention
  - Rollback preflight that locks history, refuses loss of populated/nonrepresentable records and never cascades
  - Explicit record of pending live service checks and closed public media delivery gate
affects: [phase-03-readiness, phase-04-public-inventory, database, authorization, media-security]
plan_head_before: 574e94ccb6461469d428ac3dde84b70f9f17db70
plan_head_after: 5b5d65d
commits: 1
actuals:
  tokens: 47272
  tasks: 1
  commits: 1
tech-stack:
  added: []
  patterns: [transaction-bound role bootstrap lock, persisted Owner authority separate from document approval permission, migration rollback refusal preflight]
key-files:
  created: [src/migrations/20261001_171946_phase3_media_documents.ts, src/migrations/20261001_171946_phase3_media_documents.json, tests/phase3-migration.test.mjs, .planning/phases/03-photography-media-processing-and-jpj-protection/03-04-SERVICE-READINESS.md]
  modified: [src/collections/Roles.ts, src/collections/Users.ts, src/lib/auth/permissions.ts, src/migrations/index.ts, tests/machine-access.test.mjs]
key-decisions:
  - "Use stable role keys and map only exact legacy role values; abort on unknown assignments or existing photos that need human-reviewed backfill."
  - "Role/account administration depends on the current persisted Owner role, separately from Approve Public Documents; serialize first-owner bootstrap and last-Owner role changes/deletion on the Owner role row."
  - "Keep migration unapplied and public media delivery disabled until exact disposable database/storage targets are provided and approved for their specific live checks."
patterns-established:
  - "Payload access probes stay read-only; transaction locks and authoritative rechecks happen in mutation hooks."
  - "Role permissions are validated as array entries with a name field; explicit null cannot stand in for an omitted value."
requirements-completed: [ADMN-06, IMAG-06, IMAG-09, JPJD-01, JPJD-02, JPJD-04, JPJD-06]
coverage:
  - id: D1
    description: "Phase 3 migration is generated and reviewed locally with exact role mapping, required photo sequence, audit mutation triggers and a guarded non-cascading down migration."
    verification:
      - kind: unit
        ref: tests/phase3-migration.test.mjs
        status: pass
      - kind: other
        ref: "npm run typecheck; synthetic npm run build"
        status: pass
    human_judgment: true
    rationale: "Static checks do not prove PostgreSQL syntax, trigger, lock or real apply/rollback behavior; no approved disposable database target is available."
  - id: D2
    description: "Public media delivery remains denied until the documented installed Payload/GCS checks pass."
    verification: []
    human_judgment: true
    rationale: "Live handler, object-access and cache behavior require an exact approved disposable storage target."
duration: 25min
completed: 2026-10-02
status: complete
---

# Phase 3 Plan 04: Migration and Service Readiness Summary

**Phase 3 schema artifacts, stable staff-role mapping and audit-history rollback guards are reviewed locally while all service and public-delivery gates remain closed.**

## Performance

- **Duration:** Approximately 25 minutes (one execution session)
- **Started:** 2026-10-01T17:17:00Z (approximate; exact dispatch timestamp was not captured)
- **Completed:** 2026-10-01T17:42:05Z
- **Tasks:** 1
- **Files modified or created:** 10

## Accomplishments

- Generated and registered the Phase 3 Payload migration and schema snapshot; Payload type generation confirmed the checked-in types were already current.
- Seeded stable Owner and Website Administrator roles; only Owner receives `Approve Public Documents` initially. Legacy users map only from the two exact prior role values. Unknown roles and existing photos needing invented identity/digest/review data stop migration.
- Added the `hgr_machine_photo_seq` required by uploads. Rollback only removes it after the locked preflight passes.
- Kept role/account administration Owner-only using fresh persisted authority, separately from the document approval grant. Bootstrap, last-Owner demotion and deletion paths use transaction-bound Owner-row locking and recounts; role permission checks reject explicit null and retain the Owner grant.
- Added append-only database triggers for audit UPDATE, DELETE and TRUNCATE. Rollback takes ACCESS EXCLUSIVE locks, checks every refusal condition before destructive statements, reverses the user-role mapping while Roles still exist and uses no `CASCADE`.
- Recorded the remaining database/storage checks and operational inputs. The migration remains unapplied, `push` remains false and `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` remains unset/default-denied.

## Task Commits

1. **Task 03-04-01: Generate and review migration; preserve the live-service checkpoint** — `5b5d65d` (fix).

**Plan metadata:** captured by the final GSD documentation commit.

## Files Created/Modified

- `src/migrations/20261001_171946_phase3_media_documents.ts` and `.json` — registered Phase 3 schema change, exact role migration, sequence, audit triggers and guarded rollback.
- `src/collections/Roles.ts`, `src/collections/Users.ts`, `src/lib/auth/permissions.ts` — persisted Owner authority and defensive account/role safeguards.
- `src/migrations/index.ts` — registers the generated migration.
- `tests/machine-access.test.mjs`, `tests/phase3-migration.test.mjs` — verifies role mapping, access/deletion safeguards, sequence and rollback SQL contracts.
- `.planning/phases/03-photography-media-processing-and-jpj-protection/03-04-SERVICE-READINESS.md` — records local review, checks, gates and deferred inputs.

## Local Checks

- 38 focused tests passed across machine access, migration contracts, audit, media and documents.
- `npm run typecheck` — passed after final Owner-delete locking change.
- `npm run build` — passed with synthetic-only environment values after the final implementation changes; no service was contacted.
- `git diff --check HEAD` — passed (Git reported line-ending normalization warnings only).
- Sol final read-only security review — passed after the authorization and sequence repairs.

These are local/static checks. No PostgreSQL parser/apply/rollback, GCS handler, object access or cache check was run against a live service.

## Decisions Made

- Current persisted Owner authority is the basis for role/account administration; `Approve Public Documents` stays independently delegable.
- Payload permission probes are read-only. Bootstrap locking and authoritative recount happen during the transaction-bound mutation hook.
- Unknown prior roles or nonempty media that would need invented security state stop migration for human-reviewed handling.
- Public byte delivery remains denied until exact approved disposable targets pass real installed Payload/GCS verification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Harden Owner and role administration after final security review**
- **Found during:** Task 03-04-01
- **Issue:** The Payload create permission probe could attempt a transaction lock; explicit null could bypass required Owner permission retention; Local API override deletion needed hook-level guards; and the migration omitted the upload photo sequence.
- **Fix:** Made permission probing read-only, kept transaction locking and recounting in mutation hooks, rejected null permission removal, added last-Owner/stable-role deletion guards and added guarded sequence creation/removal.
- **Files modified:** `src/collections/Users.ts`, `src/collections/Roles.ts`, `src/migrations/20261001_171946_phase3_media_documents.ts`, `tests/machine-access.test.mjs`, `tests/phase3-migration.test.mjs`.
- **Verification:** Focused suite 38/38, typecheck, synthetic build and Sol final read-only review passed.
- **Committed in:** `5b5d65d`.

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical safeguard).
**Impact on plan:** Required for correct authorization and migration rollback; no live-service or production scope was added.

## Deferred Issues and Inputs

- PostgreSQL syntax, migration apply/rollback, trigger and transaction lock behavior need verification against an exact existing isolated disposable database target approved for those operations.
- Installed Payload/GCS private-original denial, derivative authorization, revision withdrawal, cache/range behavior and synthetic browser upload-progress checks need exact existing isolated disposable targets approved for those operations.
- The project has no approved disposable PostgreSQL or GCS-compatible targets; do not connect to an unknown target, provision one, or apply the migration.
- GCS ACL versus Uniform Bucket-Level Access, watermark artwork/defaults, accepted document formats and human redaction procedure, per-file/batch limits, retention/regeneration remain deferred operational inputs.
- Phase 3 service verification remains incomplete. Phase 4 is not ready and was not started.

## Next Phase Readiness

Plan 03-04 local implementation, static review and readiness recording are complete. Phase 3 still requires approved live database/storage verification and resolution of deferred operational inputs before public media delivery or Phase 4 readiness. The migration is unapplied and both public-delivery gates remain closed.

## Self-Check: PASSED

- Migration, snapshot, registration, tests and readiness files exist.
- Task commit `5b5d65d` exists and the measured task commit count is 1.
- Focused tests, typecheck, synthetic build, whitespace check and Sol final review passed.

---
*Phase: 03-photography-media-processing-and-jpj-protection*
*Completed: 2026-10-02*
