---
phase: 06-accessible-design-and-inventory-seo
plan: 04
subsystem: ui
tags: [accessibility, enquiries, validation, react, typescript]
requires:
  - phase: 05-enquiries-and-supporting-pages
    provides: Existing enquiry validation, server action, form and delivery adapter contract
provides:
  - Safe field-keyed server validation errors for enquiry forms
  - Error summary navigation and inline accessible field associations
affects: [enquiries, public-accessibility]
actuals:
  tokens: 3293
  tasks: 2
  commits: 4
plan_head_before: cd4e5291c2487742aac6d9a64e3ecae2719458ef
plan_head_after: 98c3b0ec7dbb4d7f0153088654653f73b7b4c255
tech-stack:
  added: []
  patterns: [Typed allow-listed field error maps, error summary links and matching aria-describedby references]
key-files:
  created: [tests/phase6-accessibility.test.mjs]
  modified: [src/lib/enquiries/submit.ts, src/app/(site)/contact/actions.ts, src/components/site/EnquiryForm.tsx]
key-decisions:
  - Keep the existing safe general error strings while adding a separate typed field-error map.
  - Keep delivery adapter statuses and messages unchanged; associate only server validation failures with fields.
patterns-established:
  - "Field validation: map fixed server-side messages to stable typed input keys, never visitor-submitted values."
  - "Accessible errors: link a role-alert summary to field IDs and append inline error IDs to existing descriptions."
requirements-completed: [UX-03]
coverage:
  - id: D1
    description: Invalid enquiry fields return fixed, field-keyed errors while optional empty email and delivery outcomes retain existing behavior.
    requirement: UX-03
    verification:
      - kind: unit
        ref: tests/phase6-accessibility.test.mjs#general enquiry validation returns safe field-keyed errors
        status: pass
      - kind: unit
        ref: tests/phase6-accessibility.test.mjs#optional empty email is accepted and valid submissions keep adapter outcomes
        status: pass
    human_judgment: false
  - id: D2
    description: Enquiry validation errors are announced, linked to their fields, and programmatically associated with current controls.
    requirement: UX-03
    verification:
      - kind: unit
        ref: tests/phase6-accessibility.test.mjs#enquiry errors are associated with current controls and summarized
        status: pass
    human_judgment: false
metrics:
  duration: 10min
  completed: 2026-10-02
status: complete
---

# Phase 6 Plan 4: Accessible enquiry validation Summary

**General and machine enquiry validation now returns safe field-keyed errors, and the form announces errors with links and inline descriptions tied to each affected control.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-10-02T03:47:00Z
- **Completed:** 2026-10-02T03:56:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Validation now identifies missing and malformed fields with fixed, field-keyed messages; optional blank Email remains valid.
- The contact action forwards the typed errors without changing delivery outcomes or exposing submitted values.
- The enquiry form provides an announced summary, links to invalid fields, inline messages, `aria-invalid`, and error references that preserve existing hints.

## Task Commits

Each task used separate RED and GREEN commits:

1. **Task 1: Return field-keyed enquiry validation errors** — `65f8206` (RED), `19c9f37` (GREEN)
2. **Task 2: Associate errors with their enquiry fields** — `a7f9d88` (RED), `98c3b0e` (GREEN)

## Files Created/Modified

- `src/lib/enquiries/submit.ts` — Typed validation error keys; existing delivery result behavior retained.
- `src/app/(site)/contact/actions.ts` — Carries field errors through the server action state.
- `src/components/site/EnquiryForm.tsx` — Accessible summary, field links and inline error associations.
- `tests/phase6-accessibility.test.mjs` — Synthetic checks for validation and accessible error associations.

## Decisions Made

- Kept existing general error strings for non-field cases and added a separate typed map for field validation.
- Kept all delivery adapter statuses and user-facing messages unchanged.

## Deviations from Plan

None — plan executed as written. No SMTP, phone, WhatsApp, production, infrastructure, or legal-publication work was performed.

## Issues Encountered

- The repository sandbox initially blocked Git metadata writes. The required commits were made after requesting the narrow elevated Git operation; all changes remain on the existing branch.
- The RED evidence checker requires TAP output. Both tasks passed the explicit intentional-RED evidence gate before their GREEN commits.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Field-level enquiry errors are available for the remaining Phase 6 work. Plans 06-02, 06-03, and 06-05 remain unstarted as instructed.

## Verification

- `node --test tests/phase6-accessibility.test.mjs tests/phase5-pages.test.mjs` — passed (9 tests).
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- No live SMTP, mailbox, PostgreSQL, browser/device, or deployment verification was performed.

## Self-Check: PASSED

- All four implementation/test files exist.
- RED and GREEN commits `65f8206`, `19c9f37`, `a7f9d88`, and `98c3b0e` exist.
- Four plan commits are measured from `plan_head_before` through `plan_head_after`.

---
*Phase: 06-accessible-design-and-inventory-seo*
*Completed: 2026-10-02*
