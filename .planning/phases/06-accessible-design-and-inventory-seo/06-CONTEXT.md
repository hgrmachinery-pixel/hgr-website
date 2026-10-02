# Phase 6: Accessible design and inventory SEO — Context

**Gathered:** 2026-10-02
**Status:** Ready to plan and implement using the approved project design and SEO requirements.

## Phase boundary

Apply HGR's established brand to public routes, strengthen accessible responsive interactions, add the progressive homepage hero treatment, and complete inventory-first SEO. Do not introduce multilingual routes, ecommerce, analytics/tag integrations (Phase 7), new paid tools, or production/deployment work. PostgreSQL, GCS/media delivery, browser/device verification, and deployment checks remain deferred to the deployment verification milestone.

## Decisions

- **D-01:** Use HGR's approved palette and Inter type: orange `#F86C00`, hover `#E85F00`, accent `#F89800`, text `#171717`, secondary text `#5F6368`, white/light backgrounds, and dark feature surfaces `#151515`/`#222222`.
- **D-02:** Keep the public site mobile-first, product-led, practical/premium, and focused on Available excavators, useful machine details, and enquiry paths. Preserve Phase 5's decision that phone and WhatsApp remain hidden until numbers are configured.
- **D-03:** Keep the approved HGR logo as the home link, with no Home menu item. Use semantic landmarks, clear visible focus, keyboard operation, readable contrast, useful text alternatives, and touch-sized actions.
- **D-04:** Any hero movement is optional polish. Static content is the baseline; it must respect `prefers-reduced-motion`, remain accessible without animation, and have a simplified/static small-screen fallback. Use real HGR machinery media only when a verified approved asset already exists; do not fabricate imagery or claims.
- **D-05:** SEO is inventory-first and factual. Generate metadata/canonical URLs from the configured public origin, retain unique machine slugs, keep sold machine pages accessible, and only emit structured data from visible verified facts.
- **D-06:** Sitemap includes only public canonical pages and published machine records. Robots controls must keep admin/private/API and non-production staging out of indexing. No indexable filters/facets.
- **D-07:** Do not add keyword-volume, ranking, review, price, availability, or local-business facts that are not verified.
- **D-08:** Use the existing Next.js App Router and CSS approach; prefer native browser capabilities and existing components over adding design or animation dependencies.
- **D-09:** Do not run live PostgreSQL/GCS/media/browser/deployment verification in this phase. Validate locally with focused tests, TypeScript, and build using synthetic settings.

## Safe implementation defaults

- Where a specific real-machine hero asset, sharing image, exact page copy, or verified business detail is absent, implement a useful no-image/no-claim fallback and leave explicit configuration/content for the Owner. The missing asset does not block the remaining design and SEO work.
- Treat all existing machine inventory as potentially empty, partial, sold-only, or missing optional images; public layouts and generated metadata must remain useful and accurate in those cases.

---
*Phase: 06-accessible-design-and-inventory-seo*
