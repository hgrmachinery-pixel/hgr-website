---
phase: 05-enquiries-and-supporting-pages
plan: 01
subsystem: enquiries-and-site-content
tags: [nextjs, payload, forms, contact, supporting-pages]
requires:
  - phase: 04-public-used-excavator-inventory
    provides: Published-only machine lookup, canonical inventory pages and site shell
provides:
  - Server-validated enquiry forms for machine, general, rental, service and lubricant requests
  - Fixed published-only supporting page routes, navigation and 404 recovery
  - Environment-configured, opt-in SMTP enquiry delivery with fixed recipient and safe failure behavior
  - Internal Privacy Policy and Website Terms review drafts, unpublished
affects: [deployment-verification]
tech-stack:
  added: [nodemailer@10.0.13]
  patterns: [server-bound machine enquiry context, injectable opt-in SMTP adapter, allow-listed published page reads]
key-files:
  created:
    - src/app/(site)/[supportingPage]/page.tsx
    - src/app/(site)/contact/actions.ts
    - src/app/not-found.tsx
    - src/components/site/EnquiryForm.tsx
    - src/lib/email/enquiryAdapter.ts
    - src/lib/enquiries/submit.ts
    - src/lib/siteContent.ts
    - tests/phase5-enquiries.test.mjs
    - tests/phase5-pages.test.mjs
    - .planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md
    - .planning/phases/05-enquiries-and-supporting-pages/WEBSITE-TERMS-DRAFT.md
  modified:
    - src/collections/Pages.ts
    - src/app/(site)/machines/[slug]/page.tsx
    - src/app/(site)/siteHeader.tsx
    - src/app/(site)/layout.tsx
    - src/app/(site)/site.css
key-decisions:
  - "Bind enquiry type and machine slug into the server action; re-resolve machine context with published-only access."
  - "The enquiry receiver is configured through ENQUIRY_TO_EMAIL; opt-in SMTP requires validated environment settings, TLS, and accepted-recipient confirmation."
  - "Keep phone and WhatsApp actions hidden until numbers are configured."
  - "Legal drafts are Owner Review Required and remain internal/unpublished until explicit Owner review and publication."
patterns-established:
  - "Only a positive accepted result from the mail adapter can report enquiry success."
  - "Supporting page lookups use a fixed slug allow-list and ordinary published-only Payload reads."
requirements-completed: [LEAD-03, LEAD-04, LEAD-05, LEAD-06, SITE-01, SITE-02, SITE-03, SITE-04]
coverage:
  - id: D1
    description: Machine and general enquiries are validated, bounded, honeypot-protected and only report accepted delivery after adapter acceptance.
    requirement: LEAD-03
    verification:
      - kind: unit
        ref: tests/phase5-enquiries.test.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: Rental, service and lubricant enquiry forms enforce their required fields and preserve optional request details.
    requirement: LEAD-04
    verification:
      - kind: unit
        ref: tests/phase5-enquiries.test.mjs
        status: pass
    human_judgment: false
  - id: D3
    description: Published supporting pages use a fixed allow-list, navigation routes to the requested sections, and unknown paths offer recovery.
    requirement: SITE-01
    verification:
      - kind: unit
        ref: tests/phase5-pages.test.mjs
        status: pass
    human_judgment: false
  - id: D4
    description: Privacy Policy and Website Terms drafts are recorded internally as Owner Review Required and are not published automatically.
    requirement: SITE-06
    verification: []
    human_judgment: true
    rationale: Owner-requested drafts are prepared in the planning folder. Explicit Owner review and publication are still required; routes remain unavailable.
metrics:
  duration: 1 session
  completed: 2026-10-02
status: implementation-complete-owner-review-pending
commits: 0
plan_head_before: fadd88226e0f3de3a54c6acfc9d2845b999e918d
plan_head_after: fadd88226e0f3de3a54c6acfc9d2845b999e918d
actuals:
  tokens: 6500
  tasks: 3
  commits: 0
---

# Phase 5 Plan 1: Enquiries and Supporting Pages Summary

**Phase 5 local implementation is complete: machine enquiries use server-verified inventory context, validated lead forms, editable supporting routes, and safe legal review drafts.**

## Accomplishments

- Added bounded, server-side validation for general, machine, rental, machinery service and lubricant enquiries, including a honeypot and optional machine viewing preference.
- Bound enquiry type and machine slug to the server action and resolve the machine again through published-only inventory access. Personal form values are not placed in URLs or ordinary logs.
- Added portable Nodemailer SMTP delivery controlled entirely by environment settings. It is disabled by default, uses a single configured recipient, enforces TLS, sends plain text only, and reports success only when that recipient is accepted. Live SMTP settings have not been supplied or tested.
- Added allow-listed, published-only supporting pages, all six main navigation destinations, footer routes and a helpful not-found page.
- Kept phone/WhatsApp actions hidden because no numbers were approved. The approved enquiry inbox is set through the ignored local `ENQUIRY_TO_EMAIL` setting. Legal pages remain unavailable without explicit Owner review and publication.
- Restricted legal page changes/publication/deletion to the persisted Owner role. Owner publication is the explicit approval action.

## Files Created or Modified

- `src/lib/enquiries/submit.ts` — typed validation, field limits, honeypot handling, safe context and adapter result mapping.
- `src/lib/email/enquiryAdapter.ts` — environment-configured, opt-in Nodemailer SMTP adapter with fixed recipient, TLS, plain text and fail-closed behavior.
- `src/app/(site)/contact/actions.ts` and `src/components/site/EnquiryForm.tsx` — server action and accessible enquiry forms.
- `src/lib/siteContent.ts` and `src/app/(site)/[supportingPage]/page.tsx` — allow-listed published content and optional configured contact details.
- `src/app/(site)/machines/[slug]/page.tsx` — machine-specific contact links and enquiry form.
- `src/app/(site)/siteHeader.tsx`, `src/app/(site)/layout.tsx`, `src/app/(site)/site.css`, `src/app/not-found.tsx` — navigation, footer, responsive styles and recovery route.
- `src/collections/Pages.ts` — Owner-only guard for legal page changes and publication.
- `tests/phase5-enquiries.test.mjs`, `tests/phase5-pages.test.mjs` — synthetic behavior checks.

## Decisions and Deviations

- Added the pinned Nodemailer dependency. No database fields, migrations or external service calls were added.
- Per the task instruction, no files were staged and no commits were created because the shared checkout contained uncommitted Phase 4 work. Existing Phase 4 changes were preserved.
- PostgreSQL, GCS, media delivery, browser verification and deployment checks remain deferred to the deployment verification milestone.

## Owner-Dependent Items

- **LEAD-01 and LEAD-02 remain pending configuration:** no public phone or WhatsApp number was approved, so those direct actions are omitted until configured.
- **LEAD-07 implementation complete; live delivery pending:** the recipient is environment-configured as `sales@hgrmachinery.com` locally. SMTP host, port, credentials and sender settings remain blank; sending remains disabled and no real mail was sent.
- **LEAD-08 and LEAD-09 remain pending full contact setup:** the forms validate and capture viewing preference, but no direct fallback number or verified machine/yard location wording is configured.
- **SITE-05 remains pending verified public facts:** yard/location details were not supplied and are omitted.
- **SITE-06 drafts ready:** both drafts are marked Owner Review Required and include Owner To Confirm items. Neither is seeded or published; explicit Owner review remains necessary.
- Phone/WhatsApp values and verified public location details remain unset and are therefore omitted from the public pages.

## Known Stubs

- `src/lib/email/enquiryAdapter.ts`: SMTP sending remains disabled until complete valid settings and `ENQUIRY_EMAIL_ENABLED=true` are configured. No live SMTP verification was performed.

## Verification

See [05-01-VERIFICATION.md](./05-01-VERIFICATION.md). Focused synthetic tests, TypeScript, production build with synthetic settings, and whitespace checks passed. No external service was contacted.

## Self-Check: PASSED

- Summary, task status and verification files are present.
- The focused test suite, type check and synthetic production build passed.
- No plan commits were made, as explicitly instructed; plan head before and after is the same.
- Phase 5 remains in progress. No Phase 6 work or progress update was made.

## Threat Flags

- `T-05-05`: Mitigated by persisted Owner-only hooks for legal-page create/update/publish/rename/delete across published and draft versions. No separate approval audit record was added; Owner publication is the explicit approval action.

---
*Phase: 05-enquiries-and-supporting-pages*
*Plan status: local implementation complete; Owner legal review and live SMTP verification pending*
