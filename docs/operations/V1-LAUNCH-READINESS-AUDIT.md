# V1 LAUNCH READINESS AUDIT

**Audit date:** 4 October 2026  
**Scope:** Read-only review of the current repository implementation, owner guide, V1 acceptance record, and recorded verification evidence. No application code or frozen product documentation was changed.  
**Overall conclusion:** The local product implementation is substantial, but live acceptance and deployment readiness are explicitly incomplete. Do not launch until the critical items below are closed.

## CRITICAL

### C1. Website enquiries are not configured to reach HGR

**Perspective:** Owner Operations / Customer Experience  
**Problem:** The active Payload email adapter is a no-delivery adapter that returns `accepted: false`. A separate SMTP adapter exists, but no evidence shows that it is enabled with an approved mailbox or that real delivery and failure handling have been verified.  
**Impact:** A customer can submit an enquiry and HGR may never receive it. This breaks a primary conversion path and risks lost sales leads.  
**Recommendation:** Configure an HGR-approved recipient and sender through deployment environment settings; verify successful delivery, failure behavior, and the customer-facing response before launch.  
**Estimated implementation effort:** 0.5–1 day, plus mailbox/provider access and verification.  
**Owner:** Engineering / Product

### C2. No live deployment or service acceptance evidence; launch is not operationally proven

**Perspective:** Engineering / Owner Operations  
**Problem:** The completion record says production launch is not authorized and lists PostgreSQL migration/admin workflows, GCS upload and privacy boundaries, Exabytes runtime and portability, staging protection, backup/restore, domain/HTTPS, and release/rollback checks as open. Phase 8 only verified a synthetic local build; it did not exercise those services.  
**Impact:** The site may fail to start, save inventory, serve images safely, or recover data in the actual hosting setup. Private media safety and operational recovery are not established in the deployed environment.  
**Recommendation:** Close and record the applicable deployment acceptance gates in the V1 acceptance record using an isolated authorized environment. Verify the actual hosting plan supports the app and required services before scheduling release. Keep production writes and launch authorization as separate explicit approvals.  
**Estimated implementation effort:** 2–5+ days, dependent on hosting and service setup and access.  
**Owner:** Engineering / Product

### C3. Real contact routes and public release content are not verified

**Perspective:** Owner Operations / Customer Experience  
**Problem:** Recorded acceptance says approved phone/WhatsApp details and viewing instructions, verified machine facts/prices/status, business copy, photo rights, document redactions, and publication permissions are still outstanding. The editable Site Contact fields do not include opening hours, and contact details are not evidenced as approved/live.  
**Impact:** Visitors may reach incorrect or inert contact destinations, receive misleading stock information, or be unable to arrange a yard viewing. Unreviewed assets or claims can damage trust and create privacy/rights exposure.  
**Recommendation:** Have HGR approve the actual inventory, every public asset and claim, contact destinations, and viewing instructions; then test each public contact action against the approved details. Treat opening hours as unpublished until confirmed and available for accurate display.  
**Estimated implementation effort:** 0.5–2 days of owner review and content entry; any missing CMS field work is additional.  
**Owner:** Product / Content

## HIGH

### H1. Routine inventory management is not fully owner-independent

**Perspective:** Owner Operations  
**Problem:** Creating, editing, publishing, and changing stock status are supported, and stable machine IDs and route history protect identity. However, machine duplication is explicitly disabled, hard deletion is denied, and the owner guide directs errors and upload failures to a technical maintainer. Archive and sold status exist, but the guide does not establish a simple repeatable correction/retirement path for common mistakes.  
**Impact:** Adding similar machines requires repeated manual entry; mistakes and replaced records can accumulate. Normal operations may depend on developer help. Deletion denial is appropriate for URL/history safety, but an owner-facing retention/archive process should be clear.  
**Recommendation:** During owner acceptance, walk through create, edit, reserve, sold, archive, correction, preview, publish and recovery from a failed save. Document the supported safe procedure for duplicate-entry mistakes and retirement.  
**Estimated implementation effort:** 0.5–1 day for acceptance/documentation; any CMS workflow changes are additional.  
**Owner:** Product / Engineering

### H2. Photo maintenance after upload may be difficult for a nontechnical owner

**Perspective:** Owner Operations  
**Problem:** Structured upload, preview, category selection, review, focal points, and gallery ordering are represented in the data model/workflows. The custom uploader makes new uploads possible, but the acceptance record has not verified the complete routine workflow on the actual admin interface or a phone. The upload queue’s visible controls focus on processing/review; simple existing-photo reorder/removal is not demonstrated in the owner guide.  
**Impact:** Owners may struggle to refresh a machine gallery, remove an incorrect image, or keep the best photos first without staff assistance. Photo evidence also carries unnecessary admin effort when each item enters a privacy-review flow.  
**Recommendation:** Complete the owner acceptance test for upload by category, preview, approve, select featured image, reorder, remove/replace, and handle a failed upload on desktop and phone. Update the owner guide with the exact supported steps and limitations.  
**Estimated implementation effort:** 0.5–1 day acceptance and guide updates; interface changes, if required, are additional.  
**Owner:** Product / Engineering

### H3. Image processing and image SEO need deployed proof

**Perspective:** SEO / Engineering  
**Problem:** The repository implements responsive derivatives and public image controls, but real GCS upload/delivery has not been verified. Machine-page featured imagery uses a responsive `srcSet`; several UX states, visual loading behavior, and actual transfer sizes have no browser/device acceptance evidence.  
**Impact:** Large or missing images can slow the inventory journey, weaken image search visibility, or make inspection evidence unavailable. Local unit/build evidence does not establish delivered image performance.  
**Recommendation:** On the approved staging host, verify generated sizes, modern output where supported, alt text, focal crop, cache behavior, and actual mobile transfer sizes with representative approved photos. Record performance and broken-media checks before release.  
**Estimated implementation effort:** 0.5–1.5 days.  
**Owner:** Engineering / Content

### H4. Staging non-indexing and analytics/privacy setup remain unverified

**Perspective:** SEO / Engineering  
**Problem:** Code defaults public indexing off unless production, an explicit enable flag, and a valid public origin are configured. Sitemap output is empty when indexing is off. But the acceptance record has not verified the actual staging host, authentication, cache behavior, tag requests, or Search Console setup.  
**Impact:** A staging copy could be indexed or expose test pages; conversely, a production misconfiguration could suppress indexing. Measurement and privacy behavior may not match HGR’s approval.  
**Recommendation:** Verify robots/meta directives and sitemap on the actual staging and production candidates, including CDN/cache behavior. Approve consent/privacy behavior and inspect actual analytics requests before separately enabling tags.  
**Estimated implementation effort:** 0.5–1 day, excluding account access and legal review.  
**Owner:** Engineering / Product

### H5. Legal/privacy publication and enquiry data handling are not approved

**Perspective:** Engineering / Owner Operations  
**Problem:** Privacy and terms pages are managed in CMS with owner-only publication safeguards, but the acceptance record says actual enquiry recipients, data handling, retention, reviewer/owner approval, and publication are open.  
**Impact:** Visitors may submit personal details without accurate, approved information about how HGR handles them.  
**Recommendation:** Confirm the receiving mailbox/provider, access and retention process; have the designated reviewer and owner approve the actual privacy/terms wording before publishing and accepting real leads.  
**Estimated implementation effort:** 1–3 days, dependent on review turnaround.  
**Owner:** Product / Content

### H6. Customer and device acceptance has not been performed

**Perspective:** Customer Experience / Engineering  
**Problem:** The local implementation has accessibility and responsive checks recorded, but actual browser/device checks remain open for mobile, keyboard use, reduced motion, empty inventory, sold machines, missing media, and error states. The first-time visitor journey has therefore not been accepted against the live rendering and real content.  
**Impact:** Layout, navigation, form, contrast, motion, or failure-state friction could block customers, particularly on mobile. Trust in photos/specifications and the path to arranging an inspection remain unproven with real inventory.  
**Recommendation:** Run the acceptance checklist on representative desktop and mobile browsers using approved content. Walk from landing page through inventory, inspection, WhatsApp/call/form, and viewing request, including empty/sold/error cases; record and resolve material defects.  
**Estimated implementation effort:** 1–2 days for review and fixes, depending on findings.  
**Owner:** Product / Engineering / Content

## MEDIUM

### M1. Supporting page content and business settings have limited CMS coverage

**Perspective:** Owner Operations / SEO  
**Problem:** Supporting-page body/title/SEO fields and phone, WhatsApp, email, and yard location are editable. Opening hours and explicit hero content are not present in the Site Contact global. The homepage is assembled from application components and inventory rather than owner-editable hero fields.  
**Impact:** Owners can update ordinary copy and core contact details, but cannot independently maintain all requested business settings or homepage messaging from CMS. Routine copy changes to fixed homepage elements may require a developer.  
**Recommendation:** Confirm that the frozen V1 operating model accepts these fixed elements and that no owner-managed opening hours are required at launch. Use only verified copy and keep missing details absent.  
**Estimated implementation effort:** 0.5 day to confirm/document; adding CMS controls would be additional scoped work.  
**Owner:** Product / Content

### M2. Brochures are not evidenced as a supported owner media workflow

**Perspective:** Owner Operations  
**Problem:** Machine video URLs and a private/public reviewed document workflow exist. No clear brochure-specific field, category, upload instructions, or public brochure display workflow was confirmed in the audited owner guide/schema.  
**Impact:** If brochures are part of launch inventory, owners may not know how to publish them safely or visitors may not find them.  
**Recommendation:** Confirm whether brochures are required for V1. If not, mark them out of scope in the operating guide; if required, assess a simple safe workflow after launch prioritization.  
**Estimated implementation effort:** 0.5 day to clarify; implementation effort depends on the confirmed need.  
**Owner:** Product / Engineering

### M3. Search Console and operational monitoring have no assigned owner

**Perspective:** SEO / Owner Operations  
**Problem:** Search Console ownership, sitemap health, uptime/error monitoring, enquiry follow-up, inventory accuracy, and review cadence are listed as open with responsible person and schedule marked “TO CONFIRM.”  
**Impact:** Indexing issues, missed enquiries, broken media, or stale stock may persist without anyone noticing. This limits long-term search performance and lead response.  
**Recommendation:** Assign a named HGR owner and a practical weekly/monthly review schedule for leads, stock, sitemap/indexing, uptime/errors, and performance. Verify Search Console ownership and sitemap submission once production access is approved.  
**Estimated implementation effort:** 0.5 day plus ongoing operations.  
**Owner:** Product

### M4. Current SEO foundations are strong, but long-term content depth depends on verified inventory

**Perspective:** SEO  
**Problem:** The implementation provides canonical metadata, machine-specific titles/descriptions and Open Graph data, a generated sitemap, index controls, stable machine URLs with redirects, breadcrumbs, related machines, and conservative Product structured data. However, the shared inventory metadata is generic, product claims rely on accurate staff-entered facts, and there is no evidence of Search Console baseline or real-page snippet review. No indexable filter pages is appropriate for V1.  
**Impact:** Technical indexing is reasonably prepared, but weak/duplicated machine descriptions or incomplete year/model/origin data reduce useful long-tail relevance and click confidence. Incorrectly stale availability or price structured data can misrepresent inventory.  
**Recommendation:** At launch, use unique factual descriptions and complete verified fields for each physical unit; check live title/description/canonical/schema output and sold/reserved behavior. Review Search Console impressions and coverage after launch before considering additional content work.  
**Estimated implementation effort:** 1–3 hours per initial inventory batch for content QA; ongoing owner review.  
**Owner:** Content / Product

## LOW

### L1. Routine inventory maintenance has no demonstrated phone-first admin acceptance

**Perspective:** Owner Operations  
**Problem:** The custom media uploader is responsive in construction, but the acceptance record does not confirm the full Payload editing flow on a phone.  
**Impact:** Small controls and long machine forms may slow quick stock updates when staff are away from a computer.  
**Recommendation:** Include a real phone walkthrough in the owner acceptance check and use desktop for workflows that prove cumbersome. Capture only actionable friction.  
**Estimated implementation effort:** 1–2 hours.  
**Owner:** Product / Engineering

### L2. Gallery category navigation and evidence-to-spec links need real-content usability review

**Perspective:** Customer Experience  
**Problem:** The machine page includes a unified gallery, category navigation, and inspection-oriented content, but no owner/customer acceptance record confirms whether categories and evidence links are intuitive with real images.  
**Impact:** Customers may miss useful inspection evidence or have difficulty locating a specific view.  
**Recommendation:** During device acceptance, ask a first-time reviewer to find the hour meter, cabin, undercarriage, and serial/chassis views without coaching.  
**Estimated implementation effort:** 1–2 hours.  
**Owner:** Product / Content

## SEO and customer journey review summary

- **Homepage and navigation:** Product-first route and primary Used Excavators journey are present. Supporting routes and no-Home-nav structure are implemented. Real contact trust signals, content accuracy, mobile behavior, and the first screen still need owner/device acceptance.
- **Inventory and machine pages:** Available/reserved/sold status handling, distinct physical-unit identity, legacy slug redirects, inspection CTAs, category gallery, video, related available inventory, and machine-specific WhatsApp/enquiry context are implemented. Live inventory, lead destinations, image delivery, and detailed interactions are unverified.
- **Metadata, canonical, Open Graph, sitemap, robots:** Strong code-level coverage exists. Actual host flags/origin and deployed outputs must be checked; staging controls have not been verified on the target host.
- **Structured data and breadcrumbs:** Machine Product data reflects the visible machine, with price offer only for available stock with public price; breadcrumbs are visible on machine pages. Avoid adding claims unsupported by visible content.
- **Internal links and discoverability:** Homepage-to-inventory, related-machine links, category navigation, and manual machine-link copying support discovery. No automatic Mudah sync is present, consistent with V1 scope.
- **Future scalability:** Unique permanent references, PostgreSQL, GCS adapter, environment-driven origin/storage configuration, and separated private/public media support growth. Host portability and real volume/performance remain unproven; fixed excavator category and owner workflow simplifications should be revisited only through Product Council direction.

## VERSION 1 LAUNCH SCORE

**Owner Operations**  
5/10

**SEO**  
6/10

**Customer Experience**  
5/10

**Engineering**  
6/10

**Overall Launch Readiness**  
3/10

### If HGR launched tomorrow, would you recommend launch?

**NO**

The local implementation is feature-complete enough for a controlled acceptance process, but a launch tomorrow would put enquiry delivery, live database and media behavior, privacy boundaries, verified contacts/content, recovery, hosting, and customer/device acceptance at risk. The project’s own V1 acceptance record confirms these deployment and owner gates are still open. Close the critical items and complete the real-environment acceptance gates before launch.

## Evidence reviewed

- `docs/owner-guide.md`
- `docs/operations/v1-acceptance.md`
- `.planning/V1-COMPLETION-SUMMARY.md`
- `.planning/phases/08-owner-acceptance-and-launch-readiness/08-01-SUMMARY.md`
- `src/payload.config.ts`, `src/lib/email/noDeliveryAdapter.ts`, `src/lib/email/enquiryAdapter.ts`
- `src/collections/Machines.ts`, `src/collections/MachineMedia.ts`, `src/collections/MachineDocuments.ts`, `src/globals/SiteContact.ts`
- `src/lib/siteMetadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, public site routes and components
