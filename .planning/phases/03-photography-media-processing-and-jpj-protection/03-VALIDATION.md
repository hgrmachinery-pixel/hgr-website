---
phase: "03"
slug: "photography-media-processing-and-jpj-protection"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-01"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (`node:test`) |
| Config file | None; repository tests use `tests/*.test.mjs` |
| Quick run command | `node --test tests/machine-media.test.mjs tests/machine-documents.test.mjs` |
| Full suite command | `node --test` |
| Estimated runtime | Under 30 seconds for focused tests; full suite time to confirm |

## Sampling Rate

- **After every task commit:** Run focused media/document tests and `npm run typecheck`.
- **After every plan wave:** Run focused tests, `npm run typecheck`, `npm run build`, and `git diff --check`.
- **Before `$gsd-verify-work`:** Run the full test suite; report the existing sandbox `tsx`/`uv_os_get_passwd returned ENOMEM` failure if it recurs.
- **Max feedback latency:** 30 seconds for focused tests.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ADMN-06; IMAG-04/06 | T-03-01 | Private master and pending media always deny; public delivery defaults disabled until the installed Payload/GCS handler passes the approved live record-access/direct-object check | synthetic policy denial; live adapter check gated in Plan 03-04-01 | `node --test tests/machine-media.test.mjs` | Created in first TDD action | pending |
| 03-01-02 | 01 | 1 | IMAG-01/02/03/05/07/08 | T-03-01/02 | All categories, stable ordering/alt/focal metadata, immutable master, responsive transforms and approved watermark configuration | unit | `node --test tests/machine-media.test.mjs` | Created in 03-01-01 | pending |
| 03-01-03 | 01 | 1 | ADMN-09; IMAG-09 | T-03-02 | Native XHR upload events advance bytes-sent progress before response; unmeasurable progress remains indeterminate and incomplete until server success | XHR event unit/queue plus real-browser acceptance | `node --test tests/machine-media.test.mjs` | Created in 03-01-01 | pending |
| 03-02-01 | 02 | 2 | JPJD-01/02/03/05 | T-03-03 | Persisted flexible Roles grant named permissions; each protected request reloads current DB assignments and ignores body/stale-token claims | synthetic permission/access | `node --test tests/machine-access.test.mjs` | Created in first TDD action | pending |
| 03-02-02 | 02 | 2 | JPJD-01/02/03/05/06 | T-03-04/05 | Originals, private previews and pending copies deny anonymous record/API/static/direct-object access; effective persisted+incoming state protects review/publication fields | unit/config/API | `node --test tests/machine-documents.test.mjs` | Created in first TDD action | pending |
| 03-02-03 | 02 | 2 | JPJD-03/04/07 | T-03-05/08 | Admin can prepare and submit but cannot publish through UI/API; D-10 full photo checklist, new revision review, uncertainty escalation and all-photo invalidation are enforced | unit | `node --test tests/machine-documents.test.mjs tests/machine-media.test.mjs` | Created in 03-02-02 / 03-01-01 | pending |
| 03-03-01 | 03 | 3 | ADMN-06; JPJD-01/04/05 | T-03-10 | Server-stamped asset events bind entity/revision/digest/type/actor/time; Payload access and hooks deny update/delete; failed writes share request transaction | audit synthetic | `node --test tests/asset-audit.test.mjs tests/machine-documents.test.mjs` | Created in first TDD action | pending |
| 03-03-02 | 03 | 3 | JPJD-04/05/06 | T-03-09/11 | One current-permission Publish locks and validates exact revision/digest, sets separate approval/publication fields and events atomically; Preview checks wrapper+bytes and is app-streamed private/no-store for success/denial/range | route/transition/cache | `node --test tests/machine-access.test.mjs tests/machine-documents.test.mjs && npm run typecheck` | Extended in this task | pending |
| 03-04-01 | 04 | 4 | ADMN-06; IMAG-01/04/06/09; JPJD-01/02/04/06 | T-03-06/07/10/11 | Reviewed migration adds roles/assets/audit trigger but stays unapplied by default; live approved disposable service check denies anonymous direct/API access to originals, previews and pending redactions/photos; only current approved copy/eligible photo passes Payload; absent proof delivery stays disabled | migration/service readiness checkpoint | `node --test tests/asset-audit.test.mjs tests/machine-media.test.mjs tests/machine-documents.test.mjs && npm run typecheck && git diff --check HEAD` | Created in Plans 01–03 | pending |

All custom same-origin POST actions for submission, review and publication require explicit CSRF/origin validation independent of Payload's Admin CSRF configuration. Phase 3 role refactoring also updates existing access, preview and bootstrap mappings; authorization tests cover former role assumptions. Owner document review evidence is created only through the narrow revision-bound Publish workflow. The migration rollback must preserve populated audit history and fail closed before any destructive drop. Both photo and document delivery remain closed until successful approved live verification.

## Test Scaffolds

- `tests/machine-media.test.mjs` begins with the failing photo tracer cases in Task 03-01-01; later photo tasks extend it.
- `tests/machine-access.test.mjs` starts with current-database Roles and permission-resolution cases in Task 03-02-01.
- `tests/machine-documents.test.mjs` begins with failing private-access cases in Task 03-02-02; later document transition tasks extend it.
- `tests/asset-audit.test.mjs` begins with failing append-only event and server-stamping cases in Task 03-03-01.
- Existing Node test infrastructure covers this phase; no test framework installation is planned. No separate Wave 0 service or provisioning task is authorized.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Payload Admin upload, preview, measured upload progress, retry and editing from representative phones | ADMN-09 | Browser/device interaction and target-host resource behavior are not faithfully covered by unit tests | At phone width, upload a sufficiently large synthetic image with browser network throttling; observe request bytes increasing in the network panel and UI progress advancing before response completion. Confirm the indeterminate fallback and that 100% appears only after server success; use approved devices and synthetic 10–30-image batches. |
| Installed Payload/GCS handler, private JPJ/ownership documents, direct object, API, optimizer and shared-cache authorization | IMAG-09, JPJD-02/04/06 | No approved disposable PostgreSQL/GCS-compatible services are available; mocks cannot establish installed-adapter behavior | Plan 03-04-01 is the blocking readiness checkpoint: confirm the exact already-existing isolated disposable target, exact operation approval and Sol's ACL/UBLA review before access. Against only that target, verify anonymous API/file/direct-object denial for private originals, private previews and pending redacted copies; allow only the exact current human-reviewed redacted revision after successful Publish through the Payload route; and verify private photo masters/pending derivatives deny, direct GCS URLs remain absent, and unpublish/replacement/cache changes deny stale paths. If no suitable target or any check fails, keep `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` false, keep public derivative delivery disabled, and record live compatibility pending. Never provision or use an unknown service. |
| Human document and serial-photo review | JPJD-04/07 | Approval requires an informed human inspection of visible content and embedded metadata | Use synthetic fixtures during development. A permitted Owner completes one Publish action after current review; it records approval and publication as distinct fields and events. Availability remains separate. |
| GCS ACL and Uniform Bucket-Level Access compatibility | JPJD-01/02 | Depends on the selected bucket policy and actual service | Before any storage check/setup, Sol reviews whether the installed adapter's private ACL operation is compatible. Only an explicitly approved already-existing isolated target may be tested; no provisioning. |

## Validation Sign-Off

- [ ] All tasks have focused automated verification or an explicit Wave 0 dependency.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification.
- [ ] Each test file is created by the first TDD task that uses it.
- [ ] No watch-mode flags.
- [ ] Feedback latency under 30 seconds for focused tests.
- [ ] `nyquist_compliant: true` set after required tests and approved-service checks are complete.

**Approval:** pending
