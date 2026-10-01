---
phase: 03-photography-media-processing-and-jpj-protection
plan: 01
subsystem: media
tags: [Payload, Sharp, GCS, machine-photos, privacy, review]
requires:
  - phase: 02-machine-model-and-payload-owner-workflow
    provides: Machine identity, Payload staff access, gallery and publication workflow
provides:
  - Private machine-photo masters and immutable, revision-bound derivatives
  - Human checklist review and fail-closed public media eligibility
  - Staff-only processing/review routes and recoverable batch uploader
affects: [03-02, 03-03, 03-04, photo-media-delivery]
actuals:
  tokens: 23243
  tasks: 3
  commits: 5
plan_head_before: a6b8766792b5a98d8bcdca68d1ad6d3f2a333b44
plan_head_after: 021998a8eb0461dd091d556feb6b4b84f1b208d3
commits: 5
tech-stack:
  added: []
  patterns:
    - Server-only Sharp transforms are isolated from browser-imported policy helpers
    - A staff-only processing route starts only after the private master upload succeeds
key-files:
  created:
    - src/lib/machines/media-image.ts
    - src/lib/machines/media-process.ts
    - src/lib/machines/media-review.ts
    - src/components/payload/MachinePhotoUploader.tsx
    - src/app/api/machine-media/process/route.ts
    - src/app/api/machine-media/review/route.ts
    - src/app/api/machine-media/limits/route.ts
    - tests/machine-media.test.mjs
  modified:
    - src/collections/MachineMedia.ts
    - src/collections/Machines.ts
    - src/lib/machines/media.ts
    - src/payload.config.ts
    - src/payload-types.ts
    - src/app/(payload)/api/[...slug]/route.ts
    - src/app/(payload)/admin/importMap.js
    - next.config.mjs
    - .env.example
key-decisions:
  - "Keep public media delivery closed unless the installed Payload/GCS handler passes the separately approved live check."
  - "Process original bytes through a same-origin staff endpoint after Payload confirms master storage; do not depend on collection hook ordering."
  - "Bind review to the current derivative revision and server-computed digest, with all checklist answers required."
patterns-established:
  - "Private master and public derivative are separate records; each photo has a stable identity and server sequence."
  - "Review and redaction create append-only audit events and a new revision that starts Needs Review."
  - "Payload file responses use no-store headers at the outer app route, including errors and ranges."
requirements-completed: [ADMN-06, ADMN-09, IMAG-01, IMAG-02, IMAG-03, IMAG-04, IMAG-05, IMAG-06, IMAG-07, IMAG-08, IMAG-09]
coverage:
  - id: D1
    description: "Machine photos receive private masters and distinct processed derivatives tied to stable photo identity and revision."
    requirement: IMAG-01
    verification:
      - kind: unit
        ref: "node --test tests/machine-media.test.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "Public delivery fails closed and requires a ready, current, approved derivative on a published machine."
    requirement: IMAG-09
    verification:
      - kind: unit
        ref: "node --test tests/machine-media.test.mjs — synthetic authorization policy tests"
        status: pass
    human_judgment: true
    rationale: "The live Payload/GCS handler and direct-object denial require the later approved disposable-service check; no storage service was available or accessed."
  - id: D3
    description: "Staff can upload categories in bounded, independently retryable batches and review the processed version."
    requirement: ADMN-06
    verification:
      - kind: unit
        ref: "node --test tests/machine-media.test.mjs — synthetic limits, progress and bounded batch tests"
        status: pass
      - kind: other
        ref: "npm run build -- --webpack with synthetic local-only configuration"
        status: pass
    human_judgment: true
    rationale: "Phone-width browser upload, real byte-progress observation, failure/retry interaction and actual Payload/GCS delivery have not been exercised because no confirmed local service was available."
duration: 1 session
completed: 2026-10-02
status: complete
---

# Phase 3 Plan 01: Private Machine Photo Workflow Summary

**Private photo masters, revision-bound reviewed derivatives, and a recoverable Payload upload queue with public delivery disabled pending live handler verification.**

## Performance

- **Duration:** 1 session
- **Tasks:** 3
- **Files modified or created:** 17
- **Commits:** 5 measured commits from the plan ledger, including the initial RED test commit

## Accomplishments

- Added 12 structured photo categories, stable photo identities/sequences, private master records and separately stored WebP derivatives.
- Added same-origin staff processing and human-review endpoints. Processing checks server authentication, Origin and Fetch Metadata, configured byte limits, actual image format, and a server-computed digest against the stored master. Review binds every checklist decision to the current derivative revision and digest.
- Added responsive transforms, normalized blur regions, a closed-by-default upload limit policy, and a phone-friendly uploader with bounded per-file progress/retries. The review screen displays the processed derivative returned by the server.
- Added current-revision, machine-publication, archive, review and gallery checks for delivery. Public media delivery remains disabled until the later live Payload/GCS authorization check succeeds.

## Task Commits

1. **Task 1: Trace one Payload photo from private master to checked public derivative** - `7052d4a` (RED tests), `c40a9e8` (implementation)
2. **Task 2: Add the full structured photo set and derivative processing controls** - `d7946ce`
3. **Task 3: Make 10–30 image phone batches recoverable** - `4c986c2`, `021998a`

## Important Files

- `src/collections/MachineMedia.ts` - Private master/derivative data, access checks and append-only audit history.
- `src/collections/Machines.ts` - Current photo revision pointers and publication/gallery validation.
- `src/lib/machines/media.ts` and `media-image.ts` - Policy helpers and isolated server-side image transforms.
- `src/lib/machines/media-process.ts` and `media-review.ts` - Authenticated processing and review workflows.
- `src/components/payload/MachinePhotoUploader.tsx` - Per-file upload, progress, retry, redaction and review UI.
- `tests/machine-media.test.mjs` - Synthetic policy, digest, transform, limits and batch tests.

## Decisions Made

- The GCS plugin appends storage hooks after collection hooks, so derivative processing does not run from `afterChange`. After Sol reviewed the boundary, processing was moved to a staff-only endpoint called after the master upload succeeds. It receives the original file bytes and master ID, reloads the private master, verifies the server-computed digest and uses fresh Local API request/file contexts. Retry keeps the master private and idempotent; failures do not delete it.
- A browser-supplied digest is never trusted. A derivative is eligible only when it is the current revision, has completed human review for the exact content digest, belongs to the same published non-archived machine and is selected in its gallery or featured slot.
- The public-delivery environment flag remains unset/false. Synthetic tests establish policy only; they do not prove storage-handler authorization.

## Deviations from Plan

### Security-driven deviations

**1. Replaced the collection `afterChange` processing hook with a protected processing endpoint.**
- **Found during:** Task 1
- **Issue:** The installed GCS plugin appends its file cleanup/storage hooks after collection hooks. Running transforms in the collection hook could occur before master storage completed and could reuse a mutable request context.
- **Fix:** Upload the master first, then POST the exact original browser bytes and master ID to an authenticated, same-origin processing route. Verify stored-master digest on the server; use separate fresh Local API request/file contexts; keep failed masters private and retryable. This path was reviewed by Sol.
- **Files modified:** `src/collections/MachineMedia.ts`, `src/lib/machines/media-process.ts`, `src/app/api/machine-media/process/route.ts`, `src/components/payload/MachinePhotoUploader.tsx`
- **Verification:** Synthetic cross-origin, digest, format, limit, transformation and retry-policy tests; typecheck and production build pass.
- **Committed in:** `c40a9e8`, `4c986c2`, `021998a`

**2. Isolated Sharp transforms from browser-shared policy code.**
- **Found during:** Task 3 build
- **Issue:** Importing Sharp from the shared policy module caused Next.js to bundle Node filesystem/process modules into the Payload admin browser bundle.
- **Fix:** Moved Sharp and Node crypto work to `media-image.ts`; browser policy helpers remain independent.
- **Files modified:** `src/lib/machines/media.ts`, `src/lib/machines/media-image.ts`, `src/lib/machines/media-process.ts`, `src/collections/MachineMedia.ts`
- **Verification:** Webpack production build and TypeScript check pass; all 14 media tests pass.
- **Committed in:** `c40a9e8`, `d7946ce`

**3. Wrapped the outer Payload app route with no-store headers.**
- **Found during:** Task 3 security review
- **Issue:** Collection file-handler headers do not cover all early errors and range responses.
- **Fix:** Set private no-store headers around the outer Payload API route for machine-media file requests.
- **Files modified:** `src/app/(payload)/api/[...slug]/route.ts`
- **Verification:** Synthetic route policy tests, `git diff --check`, and production build.
- **Committed in:** `4c986c2`

**4. Deferred real browser and storage-handler acceptance.**
- **Found during:** Task 3 verification
- **Issue:** No confirmed disposable PostgreSQL/GCS-compatible services were available; the plan prohibits starting services backed by unknown infrastructure.
- **Fix:** Completed synthetic verification only. Leave delivery closed and record the browser progress and live storage checks as deferred to the approved later service gate.
- **Impact:** Does not prevent local plan implementation; actual Payload/GCS file authorization, direct-object denial, and browser upload progress remain unproven.

---

**Total deviations:** 4 documented; 3 security/build corrections and 1 environment-limited acceptance check.
**Impact on plan:** The upload workflow is implemented locally. The revised endpoint removes dependence on uncertain hook ordering. Public delivery remains safely closed pending live handler verification.

## Checks and Limitations

- `node --test tests/machine-media.test.mjs` — passed, 14/14.
- `npm run typecheck` — passed.
- `npm run build -- --webpack` — passed using synthetic local-only environment values and a refused loopback database port; no database or storage service was contacted.
- Plain `npm run build` — Turbopack panicked in its Windows `DiskFileSystem` output writer. The Webpack build completed successfully.
- `payload generate:types` — could not start because the local Node/tsx process failed with `uv_os_get_passwd returned ENOMEM`; the generated types were synchronized manually and the typecheck/build passed.
- Existing `tests/foundation-config.test.mjs` — child processes failed before their assertions with the same `uv_os_get_passwd returned ENOMEM`; no unrelated test harness change was made.
- Phone browser upload/progress/retry acceptance and live Payload/GCS handler/direct-object checks — deferred; no service was accessed or provisioned.

## User Setup Required

Configure `HGR_MACHINE_PHOTO_MAX_FILE_BYTES` and `HGR_MACHINE_PHOTO_MAX_BATCH_BYTES` in the target environment. Keep `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` unset/false until the approved later handler check records success.

## Next Phase Readiness

Plan 03-01 local implementation is complete. Continue with Plan 03-02 as planned. Plan 03-03 must complete the approved live handler verification before public image delivery can be enabled. Browser upload acceptance remains a human verification item. Do not begin Phase 4 automatically.

---
*Phase: 03-photography-media-processing-and-jpj-protection*
*Completed: 2026-10-02*

## Self-Check: PASSED

- Summary file exists at the required plan path.
- All five plan commits are present in Git history.
- Summary commit will be recorded separately from `plan_head_after` and the measured task commit count.
