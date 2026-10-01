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
| 03-01-01 | 01 | 1 | IMAG-01/02/03/06/07; ADMN-06 | T-03-01 | Machine-owned category/order/featured relation and stable generated names | unit/config | `node --test tests/machine-media.test.mjs` | No — Wave 0 | pending |
| 03-01-02 | 01 | 1 | IMAG-04/05/08 | T-03-02 | Master remains unchanged; derivatives orient, resize, strip unsafe metadata and apply configured watermark | unit | `node --test tests/machine-media.test.mjs` | No — Wave 0 | pending |
| 03-02-01 | 02 | 2 | JPJD-01/02/03/04/05/06 | T-03-03 | Originals and pending copies deny anonymous direct/API access; only current approved revision can be projected publicly | unit/config/API | `node --test tests/machine-documents.test.mjs` | No — Wave 0 | pending |
| 03-02-02 | 02 | 2 | JPJD-07; ADMN-09; IMAG-09 | T-03-04 | Serial review invalidates on relevant changes; one failed upload does not lose successful batch items | unit/queue | `node --test tests/machine-media.test.mjs tests/machine-documents.test.mjs` | No — Wave 0 | pending |

## Wave 0 Requirements

- [ ] `tests/machine-media.test.mjs` — categories, order, featured eligibility, identity/category/sequence filenames, synthetic Sharp transforms and per-file upload status.
- [ ] `tests/machine-documents.test.mjs` — access boundaries, revision-bound approval, availability approval, cache headers and serial-photo review invalidation.
- [ ] Existing Node test infrastructure covers this phase; no test framework installation is planned.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Payload Admin upload, preview, progress, retry and editing from representative phones | ADMN-09 | Browser/device interaction and target-host resource behavior are not faithfully covered by unit tests | Use synthetic 10–30 image batches on approved devices and approved disposable services; record partial failures and retry behavior. |
| Real object storage, direct file, API, optimizer and shared-cache authorization | IMAG-09, JPJD-02/04/06 | No approved disposable PostgreSQL/GCS-compatible services are available; do not make claims from mocks | When approved services exist, test anonymous denial for masters/pending copies and access for approved derivatives, including unpublish/replacement/cache behavior. |
| Human document and serial-photo review | JPJD-04/07 | Approval requires an informed human inspection of visible content and embedded metadata | Use synthetic fixtures during development; real files require owner-designated reviewer, explicit approval and separate permission before public display. |
| GCS ACL and Uniform Bucket-Level Access compatibility | JPJD-01/02 | Depends on the selected bucket policy and actual service | Before bucket setup, security-review whether the installed adapter's private ACL operation is compatible; use environment-level IAM/public-access prevention if the chosen policy requires it. |

## Validation Sign-Off

- [ ] All tasks have focused automated verification or an explicit Wave 0 dependency.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification.
- [ ] Wave 0 covers all missing test references.
- [ ] No watch-mode flags.
- [ ] Feedback latency under 30 seconds for focused tests.
- [ ] `nyquist_compliant: true` set after required tests and approved-service checks are complete.

**Approval:** pending
