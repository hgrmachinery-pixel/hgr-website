# Phase 5: Enquiries and supporting pages — Research

**Researched:** 2026-10-02
**Confidence:** High for the local code paths; actual mail delivery needs owner configuration and later service verification.

## Existing patterns

- `Pages` already supports staff-managed title, slug, SEO fields, rich-text body, drafts, and published-only public reads. Use these fields instead of adding a new content model.
- `SiteContact` already stores optional phone, WhatsApp, email, and yard location; staff alone can update it. Do not show missing values as invented claims.
- Payload currently uses `noDeliveryEmailAdapter`, which always rejects delivery. There is no mail transport or provider configured. Keep the no-delivery result explicit and test accepted/rejected paths with injected test adapters; live mailbox receipt is owner/service dependent.
- The site uses Next App Router under `src/app/(site)`, and machine pages use public query/projection helpers. Resolve machine context server-side from the stable route slug.
- Payload schema changes require explicit migrations, but Phase 5 can reuse current page/contact fields and avoid a migration.

## Implementation guidance

1. Add a bounded, server-side enquiry contract shared by general, rental, services, lubricants, and machine forms. Keep PII out of URLs and ordinary logs, validate required fields per enquiry kind, and use a low-friction honeypot.
2. Bind machine identity and page URL on the server from the currently published machine; do not trust submitted identity fields.
3. Keep all contact CTAs conditional on configured values. WhatsApp messages should identify the machine and include its canonical page URL. Yard-viewing copy should ask customers to confirm that machine's location before travel.
4. Use published Payload page content through fixed route slugs. Keep privacy and terms routes unavailable until HGR supplies/reviews accurate wording; do not invent legal copy.
5. Complete local synthetic tests, typecheck, and build. Do not contact email, PostgreSQL, GCS, browser, or deployment services in this phase.

## Owner inputs that remain unresolved

Receiving mailbox and provider, sender settings, phone/WhatsApp values, verified yard and per-machine location wording, optional business claims, and reviewed Privacy Policy/Website Terms. Local implementation can proceed with these unset. Actual LEAD-07 receipt and SITE-06 completion remain pending until their inputs are approved.

---
*Phase: 05-enquiries-and-supporting-pages*
