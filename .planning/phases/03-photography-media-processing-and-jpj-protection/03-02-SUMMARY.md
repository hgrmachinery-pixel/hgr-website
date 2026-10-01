---
phase: photography-media-processing-and-jpj-protection
plan: "02"
subsystem: media-security
tags: [payload, roles, permissions, jpjd, machine-documents, photo-review, audit]
requires:
  - phase: 02-machine-model-and-payload-owner-workflow
    provides: Stable machine identity, Payload staff access and publication model
  - phase: 03-photography-media-processing-and-jpj-protection
    provides: Private photo masters, revision-bound derivatives and human checklist workflow
provides:
  - Persisted flexible role assignments with current-record permission checks
  - Private immutable document originals and separate redacted-copy revisions with staff submission for Owner review
  - Photo review/audit history protection bound to the current serial-visibility policy revision
affects: [03-03, 03-04, photo-media-delivery]
actuals:
  tokens: 21516
  tasks: 3
  commits: 6
plan_head_before: c12a5744240ac636d4387663482c23af594f7767
plan_head_after: 484778b102e54708fdbadd2465d106aecdaee287
commits: 6
tech-stack:
  added: []
  patterns:
    - Current permissions resolve from persisted User-to-Role relationships on each protected request
    - Private originals and immutable redacted revisions are separate records; only the exact latest redacted digest may be submitted
    - Photo review and audit events preserve their prior JSON history and serialize against machine policy changes
key-files:
  created:
    - src/collections/Roles.ts
    - src/collections/MachineDocuments.ts
    - src/lib/auth/permissions.ts
    - src/lib/machines/documents.ts
    - src/app/api/machine-documents/[action]/route.ts
    - src/components/payload/SubmitDocumentForReview.tsx
    - tests/machine-documents.test.mjs
  modified:
    - src/collections/Users.ts
    - src/collections/Machines.ts
    - src/collections/MachineMedia.ts
    - src/lib/machines/media-review.ts
    - src/lib/machines/media.ts
    - src/payload.config.ts
    - src/payload-types.ts
    - tests/machine-access.test.mjs
    - tests/machine-media.test.mjs
key-decisions:
  - "The permission name Approve Public Documents is persisted on flexible roles; Owner receives it initially and Administrator does not."
  - "Administrators prepare private drafts and submit the exact latest redacted revision for Owner review; no approval or publication control exists in this plan."
  - "Photo review is tied to the machine serial-visibility policy revision, and any policy change invalidates every photo review for that machine."
  - "The public media delivery gate remains closed pending the separate approved storage-handler verification."
patterns-established:
  - "Review and audit JSON histories must preserve the complete prior prefix and append exactly one server-authored transition event."
  - "Machine policy and media transitions lock and compare current persisted state inside a Payload/PostgreSQL transaction."
requirements-completed: [JPJD-01, JPJD-02, JPJD-03, JPJD-07]
coverage:
  - id: D1
    description: Current persisted roles grant flexible named permissions, ignoring request-body and stale-token claims.
    requirement: JPJD-05
    verification:
      - kind: unit
        ref: node --test tests/machine-access.test.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: Private originals and pending redacted revisions are staff-only; staff can create separate copies and submit the latest exact copy for Owner review without approval or publication.
    requirement: JPJD-01
    verification:
      - kind: unit
        ref: node --test tests/machine-documents.test.mjs
        status: pass
      - kind: other
        ref: npm run typecheck
        status: pass
    human_judgment: true
    rationale: Live Payload/GCS object, optimizer and cache authorization require the approved service gate in Plan 03-04.
  - id: D3
    description: Every machine photo revision requires the human D-10 checklist; review and audit history are append-only and approval is invalidated on serial-policy revision changes.
    requirement: JPJD-07
    verification:
      - kind: unit
        ref: node --test tests/machine-media.test.mjs
        status: pass
      - kind: other
        ref: npm run build -- --webpack with synthetic local-only environment values
        status: pass
    human_judgment: true
    rationale: Actual PostgreSQL row-lock behaviour and visual inspection of human-reviewed content were not exercised; no database or media service was accessed.
  - id: D4
    description: Owner Publish and Preview as Public controls and document public display remain for Plan 03-03.
    verification: []
    human_judgment: true
    rationale: This plan deliberately reserves publication and public preview for the next Phase 3 plan.
duration: 1 session
completed: 2026-10-02
status: complete
---

# Phase 3 Plan 02: Flexible Roles, Private Documents and Photo Review Summary

**Persisted permissions and private document preparation now work locally, while photo approvals remain revision-bound to both image bytes and the machine's current serial policy.**

## Performance

- **Duration:** 1 session
- **Tasks:** 3
- **Files modified or created:** 24
- **Task commits:** 6 measured commits from the plan ledger, including RED-test commits

## Accomplishments

- Replaced fixed role labels with persisted role assignments and current-database permission checks. The Owner role starts with **Approve Public Documents**; the Administrator role does not. Assignments and role permission edits are server-protected.
- Added private original and separate redacted-copy records. Administrators can upload, save drafts and submit the exact current redacted revision for Owner review. Direct file access is private/no-store; custom submission requests validate Origin and Fetch Metadata before reading the body.
- Enforced the full D-10 photo checklist, immutable photo revision identity/digests, append-only audit/review history, transaction row locks, and serial-policy revision checks. Serial policy changes invalidate every machine photo review. A public serial setting never bypasses human review.
- Kept public photo delivery closed. No PostgreSQL/GCS service, migration application, real business document, production system or public file delivery was used.

## Task Commits

1. **Task 1: Persist flexible roles and resolve permissions from current records** - `20eb513` (RED), `f53884c` (implementation)
2. **Task 2: Keep document originals and unapproved revisions private** - `9949205` (RED), `77d4548` (implementation)
3. **Task 3: Let staff redact and submit for review without publication controls** - `5c4481e` (RED), `484778b` (implementation and Sol-directed integrity hardening)

## Important Files

- `src/collections/Roles.ts`, `src/collections/Users.ts`, and `src/lib/auth/permissions.ts` implement the flexible roles and live permission lookup.
- `src/collections/MachineDocuments.ts`, `src/lib/machines/documents.ts`, and `src/app/api/machine-documents/[action]/route.ts` implement private document preparation and submission.
- `src/collections/MachineMedia.ts`, `src/collections/Machines.ts`, and `src/lib/machines/media-review.ts` enforce photo review, audit history and serial-policy invalidation.
- `tests/machine-access.test.mjs`, `tests/machine-documents.test.mjs`, and `tests/machine-media.test.mjs` cover synthetic authorization and workflow cases.

## Decisions Made

- The owner-approved permission-based workflow is recorded as implementation policy: no role-name authorization, no separate approval button, and no Administrator publication path.
- Review history stores `approved_by`/`approved_at` and publication remains separate for the next plan. Each photo approval is bound to the exact derivative digest and current serial-policy revision.
- A Sol security review required deep prior-history prefix checks, narrowly allowed transition fields/events, before-delete denial, and machine/media row locking with fresh state comparisons. Those controls were added within this plan.

## Deviations from Plan

### Security-driven fixes

**1. Enforced history immutability and serialized policy-aware photo review.**
- **Found during:** Task 3
- **Issue:** The initial media update guard checked history length but did not prove earlier events were unchanged, did not deny Local API deletion in a hook, and did not serialize review against serial-policy changes.
- **Fix:** Added deep prefix comparison for both review and audit histories, strict transition field/event validation, server-authored event checks, beforeDelete denial, persisted serial-policy revisions, and machine/media row locks with same-transaction reloads.
- **Files modified:** `src/collections/MachineMedia.ts`, `src/collections/Machines.ts`, `src/lib/machines/media-review.ts`, `src/lib/machines/media-process.ts`, `src/lib/machines/media.ts`, `src/payload-types.ts`, `tests/machine-media.test.mjs`.
- **Verification:** 31 focused tests, TypeScript check and synthetic Webpack build passed. Live PostgreSQL locking remains part of the approved service verification gate.
- **Committed in:** `484778b`.

**2. Synchronized generated Payload types manually.**
- **Found during:** Task 1 and Task 2
- **Issue:** `payload generate:types` could not start because the local Node/tsx process returned `uv_os_get_passwd returned ENOMEM`.
- **Fix:** Updated the generated type declarations for the new collections and role relationship; `npm run typecheck` passed.
- **Files modified:** `src/payload-types.ts`.
- **Verification:** `npm run typecheck` and the production build passed.
- **Committed in:** `77d4548`.

---

**Total deviations:** 2 security/build correctness adjustments; no production or infrastructure changes.
**Impact on plan:** Plan 03-02 is implemented locally. Exact live storage behavior and database transaction behavior remain unverified until the already-planned approved service gate. Owner Publish and Preview as Public remain Plan 03-03 work.

## Checks and Limitations

- `node --test tests/machine-access.test.mjs tests/machine-documents.test.mjs tests/machine-media.test.mjs` — passed, 31/31.
- `npm run typecheck` — passed.
- `npm run build -- --webpack` — passed with synthetic local-only environment variables and a refused loopback database port.
- `git diff --check` — passed.
- One initial synthetic build attempt used the wrong bucket variable name and stopped during page collection; the corrected run passed.
- The transaction/row-lock implementation was checked by code and synthetic tests only. No database or storage endpoint was started or contacted, and no migration was applied.
- Owner publication, Preview as Public, live object/file/optimizer/cache denial and direct GCS denial remain for Plans 03-03/03-04.

## User Setup Required

Configure `HGR_MACHINE_DOCUMENT_MIME_TYPES` only after accepted document formats are confirmed. Keep `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` unset/false until the approved storage-handler check succeeds.

## Next Phase Readiness

Plan 03-02 is complete. Plan 03-03 can implement the single permission-based Owner Publish action and Preview as Public using these persisted role, private document and revision-bound review foundations. Continue Phase 3 only; do not begin Phase 4 automatically.

---
*Phase: 03-photography-media-processing-and-jpj-protection*
*Completed: 2026-10-02*

## Self-Check: PASSED

- The focused tests, typecheck, synthetic production build and diff whitespace check passed.
- All six plan commits exist in Git history.
- `plan_head_before`, `plan_head_after` and the six-commit count were measured from the persisted plan ledger before the summary metadata commit.
