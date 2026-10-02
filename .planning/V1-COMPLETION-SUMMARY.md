# HGR Website V1 Implementation Completion

**Date:** 2026-10-02
**Implementation status:** Phase 8 complete; local V1 implementation and handover artifacts are complete.
**Live acceptance status:** Open. Approved deployment acceptance gates remain.
**Production launch:** Not authorized by this summary.

## Delivered

- Portable Next.js, Payload CMS and PostgreSQL application foundation, with external object storage integration designed for GCS.
- Permanent physical-machine identity, structured specifications, roles and owner workflows.
- Structured machine photography, responsive processing, private masters and protected JPJ document workflows with human review for public copies.
- Public inventory, stable machine pages, status/price behavior, category gallery and manual machine-link copying.
- Enquiry forms and editable supporting pages.
- HGR design, responsive public experience, accessibility foundations and inventory-first SEO controls.
- Privacy-conscious analytics framework that remains disabled by default, security boundaries, and documented backup/recovery procedures.
- Owner-facing instructions and V1 acceptance checklist in [the owner guide](../docs/owner-guide.md) and [acceptance record](../docs/operations/v1-acceptance.md).

## Deferred deployment acceptance items

These items were approved for deferral and were not attempted during Phase 8:

1. **Analytics:** Confirm account ownership/access and identifiers; approve consent behavior, privacy review and tag configuration; inspect actual vendor requests; separately authorize activation. Ads spend/activation remains a separate decision.
2. **Privacy and legal publication:** Confirm actual enquiry recipient/provider, data handling and retention; obtain privacy reviewer and owner approval for policy/terms; authorize publication.
3. **PostgreSQL:** Approve/configure a service, review/apply migrations, verify live Payload/admin/data workflows, and prove live recovery.
4. **Google Cloud Storage:** Approve/configure a bucket, verify photo upload and responsive delivery, and prove public/private media access boundaries.
5. **SMTP and mailbox:** Configure approved sender/credentials through environment variables and verify real receipt and delivery failure behavior.
6. **Phone, WhatsApp and viewing:** Supply approved real numbers and viewing instructions; verify destinations and machine-specific prefilled context.
7. **Exabytes and portability:** Verify an authorized isolated Exabytes build/start/runtime and representative database/storage workload, platform/resource compatibility, and same-source rebuild on a compatible second host. Any production write test still needs exact approval.
8. **Staging:** Verify actual host authentication, cache behavior, separate credentials/test data/tags, and non-indexing.
9. **Backup and restore:** Approve an isolated target/operator and demonstrate a restore from matching database/media capture points with privacy-class checks.
10. **Browser/device/accessibility:** Review actual desktop/mobile rendering, keyboard and accessibility behavior, reduced-motion behavior, and empty/sold/missing-media and error states.
11. **Verified launch content and rights:** HGR verifies machine facts/prices/status, location and business copy, logo and image rights, document redactions, and each item's public-release permission.
12. **Search Console and monitoring:** Verify Search Console ownership and assign operational responsibilities for uptime, errors, lead delivery, indexing, performance and inventory updates.
13. **Production release:** Confirm domain and HTTPS routing, production environment/secrets, sitemap/indexing behavior, rollback/recovery readiness and a named release approver; obtain explicit production launch authorization.

The detailed checklist and spaces for later evidence are maintained in [the V1 acceptance record](../docs/operations/v1-acceptance.md). Completing local implementation does not close these gates or authorize production changes.

## Verification completed in Phase 8

- 123 existing focused tests passed.
- TypeScript type check passed.
- Production build passed using synthetic loopback-only database settings, fake storage identifiers, and public indexing disabled.
- GSD plan index recognized the single Phase 8 plan as ready in Wave 1. Repository consistency validation found no errors and one pre-existing warning about the missing `wave` frontmatter in Phase 3 plan 03-04.
