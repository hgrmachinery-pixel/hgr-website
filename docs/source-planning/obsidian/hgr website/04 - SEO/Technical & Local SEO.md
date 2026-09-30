# HGR Technical and Local SEO Requirements

## Scope and source authority

Framework-independent V1 acceptance requirements. Sources: [[00 - Project/HGR Project]], [[00 - Project/Business Requirements]], [[00 - Project/Project Roadmap]], [[02 - Website Specification/Sitemap]], [[02 - Website Specification/Admin System]] and the public-page specifications.

GA4, GTM, Search Console and Google Ads measurement are established. Their detailed configuration and all unselected infrastructure remain [DEFERRED]. No provider or framework is chosen here.

## Crawlability and indexability

Published public content, specifications and machine links must be accessible to search engines without requiring interaction with search fields or galleries. Test rendered content with the eventual architecture.

Separate crawl control from indexing control. robots.txt is not access control and does not reliably keep a URL out of search. A crawler must be able to read a noindex directive for it to take effect. Protect private admin/draft content with access controls. See [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

Staging must be access-restricted and excluded from indexing. Public previews must not expose private drafts. At launch verify production pages intended for search have no accidental staging noindex or crawl blocks. Do not remove protection from admin routes.

## Sitemap and URL identity

Maintain an XML sitemap of intended indexable, canonical public URLs. Exclude drafts, admin, errors, redirect sources and unwanted parameter variants. Keep useful published sold pages eligible. Use genuine modification dates where supplied; updates should follow normal publishing without owner XML editing.

Require one preferred HTTPS hostname and self-referencing canonicals for intended canonical public pages. The exact host form, slash/case conventions and implementation remain [DEFERRED]. Internal links, canonicals, sitemap and social URLs must agree.

Give distinct content its own stable canonical URL. Use permanent redirects for genuine URL replacements; avoid chains and irrelevant mass redirects. Inventory status changes do not require redirects. Never reuse an old sold-machine URL for a later physical unit of the same model. Confirm whether old website URLs need migration from an actual URL inventory [TO CONFIRM].

Missing pages should return an appropriate 404 response with helpful inventory/contact navigation; do not serve an error message with a success status or redirect every unknown URL to home.

## Search, filters and pagination

Plan an explicit parameter policy before implementation [DEFERRED]. Identify search, sort, filter, campaign and pagination parameters separately. V1 UX prioritises Status, Brand and Search; Year/Price only if justified. Filter combinations are not automatically SEO landing pages. Permitted Mudah campaign parameters must not create duplicate indexable machine URLs; preserve the underlying canonical identity. Exclude noncanonical combinations from sitemap and avoid limitless linked combinations.

Do not assume canonical tags alone control crawling or that every filtered subset is identical to the unfiltered page. Choose appropriate crawl/index controls after testing the implementation. Preserve crawlable access to all real inventory.

If pagination is selected, use distinct discoverable page URLs and self-consistent canonicals. Load More must not hide later machines from discovery. No infinite scroll in V1. See [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

## Performance, mobile and images

Prioritise fast access to inventory and contact. Monitor LCP, INP and CLS using representative pages and actual-user data when available. Current good-experience targets are LCP at or below 2.5 seconds, INP at or below 200 ms and CLS at or below 0.1 at the 75th percentile; these are quality targets, not ranking guarantees. See [Web Vitals guidance](https://web.dev/articles/vitals).

Test mobile, tablet and desktop; do not merely shrink a desktop layout. Reserve image space, serve responsive derivatives, prioritise the main visible image and lazy-load below-the-fold assets where appropriate. Target around 200 KB or below for generated images where practical without sacrificing machine detail; this is not an absolute original-upload cap.

Hero motion must preserve immediate navigation and CTA access, with reduced-motion, mobile and static fallbacks. Defer heavy YouTube/maps loading where practical without hiding essential information. Storage, CDN and animation implementation are [DEFERRED].

## Metadata and sharing

Provide page-specific title, description, canonical and appropriate robots directives. Generate sensible machine defaults in admin; omit unavailable facts. Open Graph/social sharing should identify HGR and the actual unit with a suitable image. Test real share previews, including sold status and hidden prices; cached previews may need refreshing after updates.

## Structured data

Evaluate Organization and an accurate LocalBusiness type using verified business details. [TO CONFIRM] exact address, phone, hours, map/profile and any published service area. Do not invent coordinates, branches, ratings or company credentials.

Evaluate Product or other appropriate machinery markup at the individual-unit level. Exact schema and eligibility are [DEFERRED]. Structured facts must match visible content. Hidden pricing must not leak through schema or use a fake zero-price offer. Sold status must not retain an active-availability claim. Do not invent reviews or prices to qualify for a rich result. Optional internal-only Serial Number must not leak into schema, metadata, analytics or public page payloads. Only intentionally public serial information may appear where appropriate; the owner is never required to publish it. See [Google Product snippet documentation](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

Breadcrumb markup, if used, must match the visible hierarchy. Validate selected markup before launch. Schema validity and search-feature eligibility are separate; a rich result is not guaranteed.

## Search Console and measurement

[TO CONFIRM] owner-controlled access to domain, Search Console, GA4, GTM and Google Ads accounts. Verify the production property, submit the sitemap and inspect representative public URLs after launch.

Track machine views, WhatsApp clicks, phone clicks, form starts and successful submissions; Arrange a Viewing actions, video and other interactions where practical. Include non-personal machine identity and page/enquiry type where useful. Do not send customer names, phone numbers, emails or free-text messages in event parameters or tracked URLs.

[DEFERRED] naming, data-layer design, tag activation/consent configuration, key-event selection, Ads import/direct-tag approach and deduplication. Test that a submission fires on success once, errors do not count as success and clicks are not reported as completed sales. Confirm cross-tool definitions and avoid counting the same action twice as a primary Ads conversion.

Mudah acquisition analysis is required where practical and permitted: identify referred/campaign visitors, landing pages, machine views, WhatsApp/phone clicks, form submissions and Arrange a Viewing actions. Compare Google Organic, Google Ads, Mudah, Direct and other referrals. Preserve referral/campaign context through conversions where technically appropriate, without promising complete attribution.

Conceptual campaign values only: source mudah, medium marketplace, campaign used_machinery. Exact UTM names, non-personal marketplace/listing identifiers, retention, GA4/GTM handling and attribution logic remain [DEFERRED]. Do not include customer details or internal serial numbers in URLs. Tracking is not automatic Mudah publishing/synchronisation.

Website events do not prove an offline sale came from Mudah or another source. [FUTURE] Appropriate manual/offline conversion attribution would be needed to connect completed sales.

Review [[03 - Content/Legal Content]] before activating tracking or third-party embeds. Do not treat analytics installation as completed.

## Local business consistency

Use HGR Equipment Resources, the verified Klang location and actual contact details consistently on About, Contact, footer, schema and the verified Google Business Profile. Do not create fictitious branches or nationwide service claims. Use the real business name consistently across the website, Google Business Profile and relevant listings; do not append search keywords unless genuinely part of the real-world name.

[TO CONFIRM] profile ownership/link, exact map pin and opening/visiting hours. Customer viewing/inspection at the Klang yard is confirmed, preferably by appointment arranged through WhatsApp/contact. Confirm machine location before visiting; no scheduling system is required. Link or embed only the verified location. Verify directions work on mobile. Sales geography does not define rental or Machinery Services coverage.

## Sold machines and publishing

Keep sold pages accessible with historical details and available alternatives. Synchronise visible status, metadata and applicable schema. Draft/Published is separate from Available/Reserved/Sold. Test publishing, unpublishing and changing price visibility across public pages and search-related outputs.

## Future multilingual support

English is V1. [FUTURE] Actual Bahasa Malaysia pages and Chinese where justified should use separate language URLs/content and appropriate hreflang. Exact locale URL structure, content relationships and implementation remain [DEFERRED] for Phase 2; no unused translations or mixed-language keyword stuffing in V1. Evaluate hreflang only when genuine translated equivalents exist, with consistent reciprocal relationships and per-language canonical rules. Do not add speculative hreflang to nonexistent translations.

## Launch acceptance checklist

- [ ] Production HTTPS and canonical host work; redirects avoid chains.
- [ ] Core pages and published units render useful crawlable content.
- [ ] Draft/admin/staging access is protected; production indexing controls are correct.
- [ ] Sitemap contains only intended canonical public URLs.
- [ ] Real 404 behaviour and existing-URL migration requirements are reviewed.
- [ ] Filter/search/pagination policy is tested with representative URLs.
- [ ] Titles, canonical tags, schema and social previews reflect real data.
- [ ] Mobile browsing, performance and hero fallback are tested.
- [ ] Verified business profile/contact/map data are consistent.
- [ ] GA4/GTM/Ads events, Mudah referral/campaign journeys, viewing actions and form delivery are validated without personal data or private-serial leakage.
- [ ] Search Console ownership and sitemap submission are completed.
- [ ] No placeholder, test, hidden-price leakage or unconfirmed service claim is public.

These are future implementation checks, not completed launch tasks. Follow the Roadmap's first 14 days of monitoring after launch and review failures before scope expansion.
