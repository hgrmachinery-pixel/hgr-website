---
phase: 07-measurement-privacy-security-and-recovery
plan: 01
subsystem: measurement
tags: [analytics, consent, privacy, enquiries, inventory]
dependency-graph:
  requires: [existing-enquiry-server-action, public-inventory-routes]
  provides: [bounded-analytics-event-contract, consent-gated-runtime-loader, intent-tracking]
  affects: [site-shell, enquiry-form, inventory-pages]
tech-stack:
  added: []
  patterns: [allowlisted-event-projection, runtime-config-gate, consent-aware-loader]
key-files:
  created:
    - src/components/site/TrackedContactLink.tsx
    - tests/phase7-analytics.test.mjs
  modified:
    - src/lib/analytics/events.ts
    - src/components/site/AnalyticsProvider.tsx
    - src/app/(site)/layout.tsx
    - src/app/(site)/contact/actions.ts
    - src/components/site/EnquiryForm.tsx
    - src/app/(site)/machines/[slug]/page.tsx
    - src/app/(site)/[supportingPage]/page.tsx
    - src/app/(site)/used-excavators/page.tsx
decisions:
  - Keep analytics disabled without runtime configuration and explicit consent.
  - Mark only real accepted mail delivery as measurement eligible; local review samples remain ineligible.
  - Leave account setup, tag-container review, consent policy and activation for owner approval.
metrics:
  duration: 1 session; exact start timestamp not captured
  completed: 2026-10-02
  tasks: 3
  files: 10
status: complete
actuals:
  tokens: 9185
  tasks: 3
  commits: 7
plan_head_before: ee908624371beffe13ba8b09da32963a4cb4e9c1
plan_head_after: 55568725b06e1d4d94d17c44c059aa7e2da18d29
requirements-completed: [ANLY-02, ANLY-03, ANLY-04]
requirements-pending: [ANLY-01, ANLY-05, ANLY-06]
---

# Phase 07 Plan 01: Privacy-Safe Measurement Summary

Implemented a fail-closed local measurement path that distinguishes inventory views, contact/viewing intent and real accepted enquiries while excluding personal fields from the bounded event contract.

## What Changed

- Added allowlisted analytics event construction, categorical campaign attribution and consent-aware tag loading controlled by runtime settings.
- Added accepted-enquiry reporting only for eligible server acceptance. The local-review sample remains ineligible; pending duplicate submits and repeated accepted result renders are suppressed at the UI boundary.
- Added separate inventory-list, machine-view, WhatsApp/phone/email, enquiry-start and viewing-intent signals through public routes and a reusable contact link.
- Added deterministic tests for absent/invalid configuration, denied or withdrawn consent, revocation/no replay, sensitive sentinels, local-review exclusion, bounded campaigns and intent separation. Cross-tab consent storage clearing also returns application-event transmission to the unknown/denied state.

## Verification

- `node --test tests/phase7-analytics.test.mjs tests/phase5-enquiries.test.mjs` — passed, 20 tests.
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- `npm run build` — compilation succeeded, then page-data collection stopped at `/api/machine-documents/[action]` because the local environment has no `DATABASE_URL`. No database configuration or service was changed.

## Owner Gates Remaining

No analytics account was activated and no external analytics request was enabled during implementation. Local tests cover the GTM loader request and sanitized application data-layer events only; they do not simulate automatic collection from an executed vendor container. Removing a loader script cannot guarantee that already-executed tag listeners, timers or autonomous collection have stopped. Owner decisions and 07-03 container review are required before activation, including the selected consent policy, account/container configuration and verification of automatic pageview/history/form/outbound collection and sensitive URL/title/referrer handling with browser network evidence. Although analytics and advertising consent choices remain separate in the adapter, the external container's enforcement of those categories is unverified. The implementation reduces duplicate signals at the UI/result transition but does not guarantee exactly-once counting across retries. Accordingly ANLY-01, ANLY-05 and ANLY-06 remain pending; ANLY-02 through ANLY-04 are marked complete for the implemented local behavior.

## Deviations from Plan

**1. Scope alignment — local-review eligibility and banner were retained.** The shared checkout already contained the local-review acceptance branch and banner as dirty changes. The action file is explicitly in this plan; its local sample was marked measurement-ineligible as required. The pre-existing banner was carried with the site-shell task commit because that planned file also contains the provider mount. No unrelated dirty files were staged. The task commit `d2374d1` therefore includes the necessary local-review eligibility adjustment.

**2. File-boundary correction.** The initial implementation placed `TrackedContactLink` in `AnalyticsProvider.tsx`; it was moved to the plan-listed `TrackedContactLink.tsx` and route/test imports updated before closeout (`5556872`).

**3. Post-close-out security review finding.** The subsequent Sol review identified that removing the loader script does not stop autonomous activity from an already-executed vendor tag. Local withdrawal tests therefore cover application-event suppression only; the external tag remains disabled until the account/container and withdrawal behavior are verified under 07-03.

## Commits

- `d2374d1` feat(07-01): trace one accepted enquiry through a safe event contract
- `39a5336` test(07-01): specify consent-gated analytics loading
- `c6bbeeb` feat(07-01): add runtime consent-gated tag loading
- `75e1de0` test(07-01): specify distinct inventory and contact intent events
- `730d128` feat(07-01): track inventory and contact intent safely
- `b10843c` test(07-01): assert sample lead and viewing privacy boundaries
- `5556872` refactor(07-01): separate tracked contact link

## Self-Check: PASSED

The planned event, provider, contact-link, route and test files exist; all seven commits are present in the measured plan range. Unrelated pre-existing dirty files remain unstaged.
