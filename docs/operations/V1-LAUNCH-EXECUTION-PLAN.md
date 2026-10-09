# V1 LAUNCH EXECUTION PLAN

**Source:** [V1 Launch Readiness Audit](V1-LAUNCH-READINESS-AUDIT.md)  
**Purpose:** Close the minimum necessary work before launch while preserving the frozen product direction. This is a plan only; it does not authorize code changes, deployment changes, purchases, or production release.

## Planning assumptions

- Phase A contains all issues that can lose leads, make the service unsafe/unavailable, publish unapproved information, or prevent a reliable launch.
- Phase B contains recommended owner-readiness and quality work that can be completed efficiently during the same staging acceptance window.
- Phase C contains improvements that can wait until after launch or be deferred if not required by the frozen V1 scope.
- Existing code-level capabilities should be verified before proposing implementation. Any discovered defect needs separate scoped authorization; this plan does not implement fixes.
- Effort estimates are active work time, excluding external access, provider setup, and review turnaround. Some tasks can run in parallel once their dependencies are met.

## Phase A — Critical Launch Blockers

### A1. Prove a working enquiry route (Audit C1)

- **Reason:** The configured email path currently does not deliver enquiries. A working lead path is essential to the website’s purpose.
- **Estimated effort:** 0.5–1 day, plus mailbox/provider access.
- **Dependencies:** HGR-approved sender and recipient; approved environment for an isolated delivery test. Privacy/data handling decision A2 should be settled before real customer use.
- **Recommended order:** First technical acceptance task after access is available. Verify delivered message contents, recipient, failure behavior, and customer-facing response.

### A2. Approve enquiry privacy, retention, and legal wording (Audit H5)

- **Reason:** The site collects contact details. HGR needs an approved explanation of handling and retention before accepting real enquiries.
- **Estimated effort:** 1–3 days, mostly reviewer/owner turnaround.
- **Dependencies:** Confirm the recipient/provider in A1; designated reviewer and owner.
- **Recommended order:** Start immediately and run in parallel with deployment preparation. Publish only after the exact wording is reviewed and approved.

### A3. Approve public contacts, inventory, media, claims, and viewing instructions (Audit C3)

- **Reason:** Customers need accurate contact destinations and stock details, and public media/copy needs release approval.
- **Estimated effort:** 0.5–2 days of owner review and entry.
- **Dependencies:** HGR access to the current inventory and approved source information; A1 contact route for verifying the lead journey.
- **Recommended order:** Begin in parallel with A2. Test phone, WhatsApp, viewing details, prices/status, and machine-specific links after A1 is working. Do not publish unverified opening hours or claims.

### A4. Establish and verify the real isolated hosting stack and operational recovery (Audit C2)

- **Reason:** A local build does not prove that the intended hosting environment can run the app, database, or media safely. Restore and rollback readiness are required to protect business data.
- **Estimated effort:** 2–5+ days, depending on hosting/service setup and access.
- **Dependencies:** Authorized isolated environment and credentials; hosting compatibility/access; approved PostgreSQL and GCS configuration. No production write testing is implied.
- **Recommended order:** Begin early because it is the longest dependency chain. Prove migration, admin/data workflow, media upload/delivery, public/private separation, and a representative backup/restore before release.

### A5. Verify staging protection, indexing controls, privacy behavior, and analytics defaults (Audit H4)

- **Reason:** Staging must not be indexed or expose test data; production indexing and optional measurement must be intentional and approved.
- **Estimated effort:** 0.5–1 day, excluding account/legal access.
- **Dependencies:** A4 staging host and configuration; A2 privacy approval for analytics behavior; Search Console account access only if verification is performed now.
- **Recommended order:** After staging exists, alongside A4 acceptance. Verify actual host responses/cache behavior. Keep analytics disabled unless separately approved and verified.

### A6. Complete minimum real-browser and device acceptance (Audit H6)

- **Reason:** Major navigation, inspection, conversion, accessibility, and error-state failures must be caught before customers encounter them.
- **Estimated effort:** 1–2 days including resolution/verification of material defects.
- **Dependencies:** A3 approved real content; A4 working isolated deployment; A1 tested enquiry route. Changes discovered are not covered for implementation by this plan.
- **Recommended order:** After A1–A5 have a testable staging site. Test a complete customer journey on desktop and mobile, plus keyboard/reduced-motion, sold/empty/missing-media, and error cases.

### A7. Verify real image processing, delivery, privacy, and mobile performance (Audit H3)

- **Reason:** Inspection depends on reliable photos, and local code does not prove real storage/delivery or reasonable mobile transfer size.
- **Estimated effort:** 0.5–1.5 days.
- **Dependencies:** A4 configured storage and approved representative images; A6 device/browser setup can be shared.
- **Recommended order:** During A4/A6 staging acceptance. Confirm derivatives, focal display, alt text, access boundaries, caching, and representative mobile transfer size.

### A8. Resolve launch scope for brochures (Audit M2)

- **Reason:** Avoid delaying launch for a workflow that may not be part of frozen V1, while preventing an assumed requirement from being missed.
- **Estimated effort:** About 0.5 day to clarify; further work only if Product Council confirms a V1 need.
- **Dependencies:** Product/owner confirmation of whether brochures are part of launch inventory.
- **Recommended order:** Decide early with A3 content review. If not required, record it as deferred and proceed. If required, treat the missing workflow as a launch blocker and re-estimate before proceeding.

## Phase B — Launch Recommended

### B1. Owner acceptance of core machine lifecycle and error recovery (Audit H1)

- **Reason:** Owners need to maintain inventory without routine developer help; permanent IDs and retained URLs make safe correction procedures especially important.
- **Estimated effort:** 0.5–1 day for walkthrough and guide notes.
- **Dependencies:** A4 working admin/database; A3 representative inventory; owner/admin participant.
- **Recommended order:** Run with B2 after the basic system works. Cover create, edit, reserve, sold, archive, preview/publish, mistaken duplicate entry, and failed-save recovery.

### B2. Owner acceptance of photo upload, review, ordering, and replacement (Audit H2)

- **Reason:** Current admin support exists, but the full maintenance loop and ease of correcting/reordering existing photos are not accepted.
- **Estimated effort:** 0.5–1 day for walkthrough and guide notes.
- **Dependencies:** A4/A7 functional storage and derivative processing; approved test photos; owner/admin participant.
- **Recommended order:** Run beside B1 and include desktop and phone. Record whether current controls suffice; any requested code changes need separate authorization.

### B3. Confirm fixed homepage/business settings are acceptable for V1 (Audit M1)

- **Reason:** Opening hours and hero content are not owner-editable. Confirming these fixed choices avoids an accidental launch expectation without expanding frozen scope.
- **Estimated effort:** About 0.5 day for product/owner confirmation and copy review.
- **Dependencies:** Approved V1 copy and business facts from A3.
- **Recommended order:** During A3 content review. Keep unconfirmed facts absent; do not add CMS controls under this plan.

### B4. Assign Search Console and ongoing monitoring ownership (Audit M3)

- **Reason:** Someone must notice missed leads, stale stock, indexing problems, outages, and broken images after launch.
- **Estimated effort:** About 0.5 day to assign roles, cadence, and escalation route; ongoing review thereafter.
- **Dependencies:** Named HGR owner; production/ Search Console access for verification tasks.
- **Recommended order:** Assign before release; complete Search Console verification and sitemap check when A4 production candidate is available.

### B5. Quality-check machine SEO content and live metadata (Audit M4)

- **Reason:** Existing technical SEO is well covered, but search usefulness depends on factual, distinct inventory content and correct rendered metadata.
- **Estimated effort:** 1–3 hours per initial inventory batch.
- **Dependencies:** A3 verified machine facts and images; A4 public-origin and indexing configuration.
- **Recommended order:** After inventory approval, before enabling indexing. Verify representative titles, descriptions, canonical, Open Graph, schema, stock status and sitemap entries.

### B6. Review gallery category usability with real inspection evidence (Audit L2)

- **Reason:** Customers should be able to locate evidence such as hour meter, cabin, and undercarriage photos without coaching.
- **Estimated effort:** 1–2 hours.
- **Dependencies:** A3 approved, representative machine galleries; A6 browser/device session.
- **Recommended order:** Fold into A6 to avoid a separate review session.

## Phase C — Post Launch

### C1. Check phone-first CMS maintenance and record any actionable friction (Audit L1)

- **Reason:** Phone-first admin operation is useful, but it is a lower priority than proving the customer site and lead path on common devices.
- **Estimated effort:** 1–2 hours.
- **Dependencies:** Stable live CMS and owner account; B1/B2 baseline workflow accepted.
- **Recommended order:** Review after launch during normal inventory maintenance. Escalate only concrete blockers that materially prevent owner operations.

## Recommended order and numbered checklist

This order minimizes duplicated setup and batches checks that use the same staging system, images, inventory, and participants. A2/A3/A4/A8 can start in parallel; A1 depends on mailbox setup, and end-to-end checks depend on the working staging environment.

1. [ ] **Confirm brochure scope (A8).** Decide whether brochures are needed for frozen V1; defer them if not.
2. [ ] **Start privacy/legal approval (A2).** Confirm recipient/provider, data access/retention, and reviewer/owner for the exact public wording.
3. [ ] **Approve launch facts and contact details (A3).** Verify inventory, prices/status, rights, public copy, contact destinations, and viewing instructions.
4. [ ] **Prepare the authorized isolated host and services (A4).** Confirm runtime compatibility and configure PostgreSQL, GCS, staging protection, and secrets without committing them.
5. [ ] **Configure and prove enquiry delivery (A1).** Use the approved mailbox and test both success and failure paths in isolation.
6. [ ] **Publish approved legal/privacy wording and validate data handling (A2).** Do not accept real leads until this and A1 are complete.
7. [ ] **Verify deployment data and recovery (A4).** Review/apply migration in the isolated environment, exercise admin/inventory, verify private/public media boundaries, and perform a representative restore.
8. [ ] **Verify staging and production-candidate indexing/analytics behavior (A5).** Confirm staging is protected and non-indexed; leave measurement off unless separately approved.
9. [ ] **Verify image processing and delivery (A7).** Test representative approved photos, derivatives, focal/alt presentation, cache, mobile transfer, and privacy boundary.
10. [ ] **Run owner inventory and media acceptance (B1, B2).** Cover normal lifecycle, archive/correction, photo upload/review/featured selection/order/replacement, and failure recovery.
11. [ ] **Confirm homepage/settings scope and brochure decision record (B3, A8).** Do not add unapproved controls or show unverified facts.
12. [ ] **Complete customer/device acceptance (A6, B6).** Walk through homepage → inventory → machine inspection → WhatsApp/call/form → viewing on desktop/mobile; include keyboard, reduced motion, sold/empty/missing-media/error states, and gallery evidence-finding.
13. [ ] **Complete factual SEO content QA (B5).** Check representative live metadata/schema/canonical/OG, sitemap and status handling before indexing is enabled.
14. [ ] **Assign monitoring and Search Console responsibilities (B4).** Name an owner, cadence, and escalation path for leads, stock, availability, images, indexing, and performance.
15. [ ] **Release gate.** Confirm all Phase A evidence is recorded, resolve material acceptance defects through separately authorized work, confirm rollback/recovery and domain/HTTPS, and obtain the explicit production release approval required by the acceptance record.
16. [ ] **After launch, review phone-first admin friction (C1).** Capture only issues that hinder real routine operations and prioritize them through the normal product process.

## Minimum pre-launch work set

The minimum safe pre-launch set is **all Phase A items plus B1–B5 where their checks validate the frozen V1 content and operation without expanding scope**. B6 is included in the Phase A device session. Phase C can wait. If the brochure decision confirms a V1 dependency or acceptance identifies a material defect, resolve and re-estimate it before launch. This plan does not itself approve production activity or release.
