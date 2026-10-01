---
phase: 03-photography-media-processing-and-jpj-protection
plan: 03
subsystem: asset-review
tags: [payload, postgres, audit, roles, private-preview]
requires:
  - phase: 03
    provides: flexible persisted roles, private document revisions and human photo review
provides:
  - Append-only application asset audit events for machine photos and documents
  - Current-permission Publish action with exact-revision Owner attestation and separate approval/publication records
  - Authenticated, private, no-store Preview as Public route for the selected redacted document revision
affects: [phase-03-04, public-media-delivery, asset-audit]
plan_head_before: c722a09fb2fd5f28e4508420ff30dca649735df1
plan_head_after: 46889041732f728d1318ac91d53025b8bf480b61
commits: 4
actuals:
  tokens: 16918
  tasks: 2
  commits: 4
tech-stack:
  added: []
  patterns: [append-only asset event collection, WeakSet-backed trusted Local API workflow, fresh DB permission checks, request-transaction row locking]
key-files:
  created: [src/collections/AssetAuditEvents.ts, src/lib/audit/assets.ts, src/components/payload/MachineDocumentActions.tsx]
  modified: [src/collections/MachineDocuments.ts, src/collections/MachineMedia.ts, src/collections/Machines.ts, src/lib/machines/documents.ts, src/app/api/machine-documents/[action]/route.ts, src/app/(payload)/admin/importMap.js, src/payload-types.ts, src/payload.config.ts, tests/asset-audit.test.mjs, tests/machine-documents.test.mjs]
key-decisions:
  - "Asset event writes use the same Payload request transaction as the protected asset transition; the database trigger and service verification remain in Plan 03-04."
  - "A current role with Approve Public Documents sees Preview as Public and one Publish action; an Owner may publish a draft directly, while users without the permission may submit drafts for review."
  - "Preview streams the exact latest redacted revision through the app after fresh permission checks and remains private/no-store; anonymous photo and document delivery remain disabled."
  - "No AI review, database migration application, storage service, or production change was introduced."
requirements-completed: [ADMN-06, IMAG-06, IMAG-09, JPJD-01, JPJD-02, JPJD-04, JPJD-05, JPJD-06]
coverage:
  - id: D1
    description: "Application asset audit events are append-only, staff-readable and server-stamped, with exact entity revision and digest references."
    requirement: JPJD-05
    verification:
      - kind: unit
        ref: tests/asset-audit.test.mjs#audit events are registered as create-only and server-stamped
        status: pass
    human_judgment: false
  - id: D2
    description: "The current named permission gates one atomic Publish operation that stores Owner attestation and separate approval/publication stamps and events."
    requirement: JPJD-06
    verification:
      - kind: unit
        ref: tests/machine-documents.test.mjs#Owner publishing is permission-gated and preview is exact-revision, private, and read-only
        status: pass
      - kind: other
        ref: npm run typecheck and synthetic npm run build
        status: pass
    human_judgment: true
    rationale: "No disposable PostgreSQL service is available to exercise the actual transaction, row lock and rollback path."
  - id: D3
    description: "Preview as Public authorizes the current role and streams the latest exact redacted revision with private no-store headers."
    requirement: JPJD-04
    verification:
      - kind: unit
        ref: tests/machine-documents.test.mjs#Owner publishing is permission-gated and preview is exact-revision, private, and read-only
        status: pass
      - kind: other
        ref: npm run build
        status: pass
    human_judgment: true
    rationale: "The private Payload/GCS file handler could not be exercised without an approved disposable storage target; live byte delivery remains pending."
duration: 25min
completed: 2026-10-02
status: complete
---

# Phase 3 Plan 03: Append-only Asset Audit, Publish and Preview Summary

**Append-only photo/document audit events and a current-permission Owner Publish workflow with exact-revision private preview.**

## Performance

- **Duration:** 25 minutes (one execution session)
- **Started:** 2026-10-01T16:48:00Z (approximate; start timestamp was not captured at dispatch)
- **Completed:** 2026-10-01T17:13:39Z
- **Tasks:** 2
- **Files modified or created:** 13

## Accomplishments

- Added `AssetAuditEvents`, denying ordinary creation, all updates and deletion. A narrow append helper uses an in-memory trusted-request capability and writes with the caller's Payload request, so an audit failure aborts the associated transition.
- Wired photo/document upload, redaction, modification, submission, approval and publication records to append-only event entries with server actor/time and exact revision/digest references.
- Added the permission-gated single Publish action. It reloads the persisted role permission, locks the redacted revision and its private-original parent in a Payload/PostgreSQL transaction, checks the latest revision and full human checklist, and records distinct approval/publication audit events.
- Added `Preview as Public`; it rechecks permission, selects the latest redacted copy by ID and digest, streams the private file through the application, and sets `private, no-store` on success, range and error responses. It does not change workflow state.
- Kept the public photo delivery flag default-denied and machine documents staff-only outside the authenticated preview route.

## Task Commits

1. **Task 1: Record asset lifecycle events as append-only history** — `68edf1e` (RED test), `ce1aa3b` (implementation).
2. **Task 2: Add the atomic Publish action and exact-revision public preview** — `c92e572` (RED test), `4688904` (implementation).

## Verification

- `node --test tests/asset-audit.test.mjs tests/machine-access.test.mjs tests/machine-documents.test.mjs tests/machine-media.test.mjs` — 33 passed.
- `npm run typecheck` — passed.
- `npm run build` with synthetic local environment values — passed. No database or object-storage service was contacted.
- `git diff --check HEAD` — passed.
- Payload type generation completed from the local collection schema with synthetic environment values; no migration was generated or applied.

## Decisions Made

- A user with the current `Approve Public Documents` permission publishes a draft or submitted redacted revision directly; the Admin Submit control is hidden and server-denied for users with that permission.
- Preview is authenticated, app-streamed and exact-revision-bound. It does not create an object URL to GCS, change approval state or enable anonymous delivery.
- Audit event identifiers are non-relational text values so deleting an asset cannot cascade-delete its history. Application-level append-only behavior does not claim protection from a database superuser.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] Permit direct Owner Publish from a draft**
- **Found during:** Task 2
- **Issue:** Requiring a draft to be submitted first would expose a Submit action to an Owner and conflict with the approved single-Publish Owner workflow.
- **Fix:** Permission holders can preview and publish a draft directly; users without the permission can submit it for Owner review.
- **Files modified:** `src/lib/machines/documents.ts`, `src/collections/MachineDocuments.ts`, `src/components/payload/MachineDocumentActions.tsx`, `src/app/api/machine-documents/[action]/route.ts`
- **Verification:** Focused document tests and typecheck passed.
- **Committed in:** `4688904`

**2. [Rule 1 - Bug] Regenerate Payload types and narrow existing photo audit history values**
- **Found during:** Task 2 typecheck
- **Issue:** The new collection and Owner review fields were missing from generated Payload types; the regenerated type also exposed an existing untyped audit-history access in `Machines.ts`.
- **Fix:** Regenerated `src/payload-types.ts` from the local schema and narrowed audit history entries before reading their event field.
- **Files modified:** `src/payload-types.ts`, `src/collections/Machines.ts`
- **Verification:** `npm run typecheck` and the synthetic production build passed.
- **Committed in:** `4688904`

---

**Total deviations:** 2 auto-fixed (1 Rule 1 bug, 1 Rule 2 missing critical behavior).
**Impact on plan:** Both changes were required to enforce the approved permission-based workflow and keep generated types/builds correct; no scope expansion occurred.

## Issues Encountered

- The local Payload type-generation CLI initially hit the sandbox's existing `uv_os_get_passwd returned ENOMEM` issue. It succeeded after an approved local rerun using synthetic environment values only; no service connection was made.
- The first synthetic build lacked the existing `PREVIEW_SECRET` setting and stopped during route configuration. Re-running with a synthetic value passed.

## Deferred Items

- Verify actual Postgres row locking, transaction rollback and audit-write failure against an approved disposable local database.
- Verify authenticated preview bytes through the actual Payload/GCS handler using an approved disposable object-storage target.
- Keep anonymous photo and document delivery disabled until Plan 03-04's approved live verification passes. No migration was applied and no service was provisioned.
- Confirm GCS ACL/Uniform Bucket-Level Access behavior, document formats/limits and redaction operational procedure, watermark artwork/defaults, representative photo sizes and retention/regeneration policy.
- Owner visual review of the Payload admin Publish/Preview controls remains a procedural check; a live Owner session and private document were not used.

## Next Phase Readiness

Plan 03-03 local work is complete. Phase 3 still has Plan 03-04, which owns the reviewed unapplied migration and gated service verification. Phase 4 is not ready to start and was not started. Reassess Phase 4 only after Plan 03-04 and the Phase 3 success criteria are complete.

## Self-Check: PASSED

- Required source, UI and generated type files exist.
- Task commits `68edf1e`, `ce1aa3b`, `c92e572` and `4688904` exist.
- Focused tests, typecheck, synthetic build and whitespace check passed.

---
*Phase: 03-photography-media-processing-and-jpj-protection*
*Completed: 2026-10-02*
