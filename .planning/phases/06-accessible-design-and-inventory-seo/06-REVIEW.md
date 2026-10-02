---
phase: 06-accessible-design-and-inventory-seo
reviewed: 2026-10-02T06:01:36Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/lib/siteMetadata.ts
  - src/app/robots.ts
  - src/app/sitemap.ts
  - src/app/(site)/machines/[slug]/page.tsx
  - src/app/(site)/layout.tsx
  - src/app/(site)/page.tsx
  - src/app/(site)/used-excavators/page.tsx
  - src/app/(site)/[supportingPage]/page.tsx
  - src/lib/machines/publicInventory.ts
  - src/components/site/MachineCard.tsx
  - src/components/site/MachineGallery.tsx
  - src/lib/enquiries/submit.ts
  - src/app/(site)/contact/actions.ts
  - src/components/site/EnquiryForm.tsx
  - tests/phase6-brand.test.mjs
  - tests/phase6-hero.test.mjs
  - tests/phase6-media.test.mjs
  - tests/phase6-seo.test.mjs
  - tests/phase6-accessibility.test.mjs
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-10-02T06:01:36Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Reviewed the Phase 6 SEO/crawler routes, public image projection and rendering, accessible enquiry errors, homepage, and shared responsive/accessibility styles against plans 06-01 through 06-05. One responsive-image correctness issue remains: the generated `srcSet` advertises maximum derivative widths even when the actual derivative is smaller.

## Warnings

### WR-01: `srcSet` width descriptors can misstate actual derivative dimensions

**File:** `src/lib/machines/publicInventory.ts:127-132`
**Issue:** `publicImageSrcSet` assigns fixed `320w`, `640w`, and `1280w` descriptors based only on the derivative name. Payload's image sizes configure those values as maximum widths with `fit: "inside"`, so a small uploaded master can produce a derivative narrower than its configured maximum. The browser trusts the descriptor as the resource's intrinsic width and can choose an undersized image for the displayed slot, causing avoidable blur; if actual dimensions differ materially, candidate selection is incorrect. The current tests assert the hard-coded descriptors rather than comparing them with projected derivative dimensions.
**Fix:** Project each derivative's actual `width` from Payload's `sizes.*.width` metadata and build each descriptor from that value. Omit candidates without a valid positive actual width; add a test where a derivative is smaller than the configured maximum.

---

_Reviewed: 2026-10-02T06:01:36Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
