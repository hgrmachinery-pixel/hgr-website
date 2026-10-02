# V1 Acceptance and Launch Gates

**Record date:** 2026-10-02
**Status:** Local implementation handover prepared; live owner acceptance and deployment gates remain open.
**Launch status:** Not authorized by this record.

This record keeps checks of the current local implementation separate from checks requiring HGR staff, real approved content, or deployment services. An automated test does not prove a production service works. Do not place passwords, account identifiers, private documents, customer data, or other secrets in this checklist.

## Local implementation evidence

These existing focused suites cover representative code behavior with synthetic data. Their prior passing results are recorded in the Phase 5, 6, and 7 artifacts; rerun them in the final Phase 8 verification before relying on the current checkout.

| Behavior | Existing local coverage | Status |
|---|---|---|
| Inventory identity, public projection, status and route behavior | `tests/machine-model.test.mjs`, `tests/public-inventory.test.mjs` | Implemented; local evidence only |
| Photo processing, review and private/public document controls | `tests/machine-media.test.mjs`, `tests/machine-documents.test.mjs`, `tests/machine-access.test.mjs`, `tests/phase3-migration.test.mjs` | Implemented; live database/storage evidence remains open |
| Enquiries, supporting pages and field error accessibility | `tests/phase5-enquiries.test.mjs`, `tests/phase5-pages.test.mjs`, `tests/phase6-accessibility.test.mjs` | Implemented; live mail delivery remains open |
| Responsive layout contracts, static hero fallback and inventory SEO | `tests/phase6-brand.test.mjs`, `tests/phase6-hero.test.mjs`, `tests/phase6-media.test.mjs`, `tests/phase6-seo.test.mjs` | Implemented; actual browser/device review remains open |
| Analytics event privacy defaults, security boundaries and staging policy | `tests/phase7-analytics.test.mjs`, `tests/phase7-security.test.mjs`, `tests/phase7-staging.test.mjs`, `tests/phase7-secrets.test.mjs` | Local preparation implemented; all account and deployment evidence remains open |

## HGR owner acceptance

Complete with an HGR owner/admin using an approved, isolated environment and representative approved data. Record the date, participant role, evidence reference (no secret data), and result.

| Acceptance check | Result / date / evidence |
|---|---|
| Staff can add and edit one physical machine, distinguish duplicates, preview, publish, reserve, mark sold, and retain its URL. | ☐ Not run |
| Staff can upload, categorize, reorder, select a featured photo, review errors, and complete a normal update by phone. | ☐ Not run |
| Staff can update ordinary page/contact content without code or developer tools. | ☐ Not run |
| Invalid or missing facts, duplicate records, empty and sold stock, missing optional media, long content, and slow/failing actions behave acceptably. | ☐ Not run |
| Owner has checked public facts, image rights, document redactions and launch copy. | ☐ Not run |
| Representative desktop/mobile browser, keyboard, accessibility and reduced-motion checks are complete. | ☐ Not run |

## Deferred deployment acceptance gates

The owner has explicitly approved these as deferred deployment acceptance items. Keep them open until separately authorized work completes and evidence is recorded. Phase 8 did not access the services or perform these checks.

| Gate | Required evidence before launch | Status |
|---|---|---|
| Analytics and privacy approval | HGR-owned analytics/Search Console/Ads account access, consent behavior, privacy review, reviewed tag configuration and network evidence; activation separately authorized. Ads spend is a separate decision. | ☐ Deferred |
| Legal/privacy review and publication | Confirm actual enquiry recipients, providers, data handling and retention; reviewer/owner approval of privacy/terms text; publication approval. | ☐ Deferred |
| PostgreSQL | Approved service/configuration, reviewed migration, live Payload/admin/data verification and recovery procedure. | ☐ Deferred |
| Google Cloud Storage | Approved bucket/configuration, upload and responsive media delivery, and public/private access verification. Private originals must remain private. | ☐ Deferred |
| SMTP and mailbox | Approved sender/credentials supplied only through environment configuration; real receipt and delivery failure behavior verified. | ☐ Deferred |
| Phone, WhatsApp and viewing | HGR supplies and approves real contact numbers and viewing instructions; click destinations and machine-specific context verified. | ☐ Deferred |
| Exabytes and portability | Authorized isolated runtime workload, build/start, upload/database connectivity, process/resource and platform compatibility checks; compatible second-host redeployment proof. No production write test without its exact approval. | ☐ Deferred |
| Staging protection | Target-level authentication, cache behavior, credentials/test-data separation, tags and indexing controls verified on the actual staging host. | ☐ Deferred |
| Backup and restore | Approved isolated target/operator; matched database and media capture revisions; representative restore and privacy-class checks. | ☐ Deferred |
| Browser/device acceptance | Actual desktop/mobile browser, responsive, accessibility, reduced-motion, empty/sold/missing-media and error-state review. | ☐ Deferred |
| Verified content and rights | HGR verifies each machine fact, price/visibility, location, business claims, photos, logo/launch assets and document redactions/permissions. | ☐ Deferred |
| Search Console and monitoring | Site ownership verification; monitoring responsibilities and actual uptime/error/lead delivery/indexing/performance procedures assigned. | ☐ Deferred |
| Production release | Domain and HTTPS routing, production environment/secrets, indexing/sitemap behavior, rollback/recovery readiness and named release approver confirmed; explicit production launch approval recorded. | ☐ Deferred |

## Initial monitoring checklist

Before launch, assign a responsible HGR person and an appropriate review schedule for each item. This is a starter checklist, not evidence that monitoring is configured or operating.

| What to review | Responsible person | Review schedule | Evidence / escalation path |
|---|---|---|---|
| Site availability and server errors | TO CONFIRM | TO CONFIRM | TO CONFIRM |
| Enquiry delivery and customer follow-up | TO CONFIRM | TO CONFIRM | TO CONFIRM |
| Search indexing and sitemap health | TO CONFIRM | TO CONFIRM | TO CONFIRM |
| Page performance and broken public media | TO CONFIRM | TO CONFIRM | TO CONFIRM |
| Inventory accuracy, status and owner updates | TO CONFIRM | TO CONFIRM | TO CONFIRM |

## Evidence references

- [Phase 1 deferred verification](../../.planning/phases/01-portable-foundation-and-exabytes-feasibility/deferred-items.md)
- [Phase 5 summary](../../.planning/phases/05-enquiries-and-supporting-pages/05-01-SUMMARY.md)
- [Phase 6 verification](../../.planning/phases/06-accessible-design-and-inventory-seo/06-VERIFICATION.md)
- [Phase 7 measurement/privacy summary](../../.planning/phases/07-measurement-privacy-security-and-recovery/07-03-SUMMARY.md)
- [Phase 7 staging/recovery summary](../../.planning/phases/07-measurement-privacy-security-and-recovery/07-04-SUMMARY.md)
- [Backup and restore procedure](backup-and-restore.md)
- [Owner guide](../owner-guide.md)
