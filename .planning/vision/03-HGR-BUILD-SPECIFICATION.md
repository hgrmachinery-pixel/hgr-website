# 03 — HGR Build Specification

## Purpose and Authority

This document defines engineering expectations for implementing the approved HGR vision. It does not contain application code or grant approval for changes to production systems, paid services, or unresolved business facts. The constitution and existing approved project requirements remain authoritative where implementation detail is not specified here.

## Component Hierarchy

Implement public routes around shared site-level responsibilities: accessible header and navigation, main content, footer, inventory presentation, individual machine detail, and reusable contact actions. The homepage composes a product-focused hero and available-machine selection. The inventory route composes search/filter controls, status-aware results, pagination or equivalent crawlable result navigation, and explicit empty/error states. A machine route composes identity/status, a unified gallery, known specifications, description, optional approved media/document references, and status-appropriate contact paths.

Keep CMS administration responsibilities separate from public presentation. Shared visual and interaction primitives should have consistent behaviour and centralised design tokens. Do not expose technical layout configuration as ordinary editorial content.

## Reusable Component Rules

- Reuse a component when it represents a stable responsibility or interaction used in multiple contexts; avoid abstraction that obscures a single clear use.
- Keep data projection and presentation responsibilities understandable and distinct.
- Components must handle missing optional facts and media deliberately; they must not invent defaults that could be mistaken for machine facts.
- Status must be conveyed in text as well as visual treatment.
- Contact actions must use configured destinations and retain machine context where relevant.
- Gallery and navigation controls must have semantic names, keyboard behaviour, visible focus, and touch-sized targets.
- Keep design values centralised and consistent with the approved HGR tokens and accessible contrast contract.

## CMS Integration Expectations

Payload CMS is the owner-facing system for structured machine inventory and ordinary site content. Routine operations must not require code, a terminal, GitHub, or a redeploy. Editorial workflows distinguish Draft/Published from Available/Reserved/Sold. Every physical machine has a stable unique identity and URL; sold records are retained and their URLs are never reused.

Machine data supports the agreed fields and distinctions, including manufacture year versus registration date, explicit machine origin/registration status, optional price versus Contact for Price, and separately controlled serial visibility. Public projections expose only approved public fields. Unknown facts are omitted.

Machine photography uses structured categories, a selected featured image, ordering, preview, and focal point where supported. High-quality originals are preserved appropriately and responsive derivatives generated for public delivery. Generated names derive from machine identity/category rather than uploader filenames. Private JPJ/ownership originals are stored separately from public media. Any public redacted derivative is separate, human-reviewed, and explicitly approved before access. Routine editorial controls should make state and errors understandable and recoverable.

The application remains based on Next.js, Payload, PostgreSQL, and external object storage, with Google Cloud Storage planned as the first media provider. Application host, database, storage, mail, origin, and other environment-specific values remain decoupled through environment configuration. Do not use the existing Exabytes MariaDB for Payload or rely on Exabytes-specific capabilities in application design. Mudah remains independent with manual link sharing only.

## Accessibility Requirements

Target WCAG 2.2 AA for public interactions and content. Use semantic landmarks and headings, meaningful link/control names, visible labels, logical focus order, a persistent visible focus indicator, and keyboard operation for menus, filters, gallery, pagination, and forms. Associate field errors with inputs and announce progress, success, and failure appropriately. Never rely on colour alone for status or selection.

Text and control contrast meet WCAG AA: 4.5:1 for normal text and 3:1 for large text and relevant non-text controls. Retain the approved distinct blue focus outline. Touch targets are at least 44 by 44 pixels. Honour reduced-motion preferences. Content must reflow at narrow widths without clipping or requiring horizontal page scrolling. Images have factual alt text where they convey content; decorative images are appropriately ignored by assistive technology.

## SEO Requirements

Use unique, accurate titles and descriptions based on visible verified content. Provide canonical URLs for intended public routes and stable machine URLs tied to physical identities. Corrected slugs redirect to the same physical unit; URLs are never reassigned. Sold pages remain accessible with truthful status and without current-sale claims or stale offer data.

Publish sitemap entries only for intended public canonical routes and published machine records. Exclude drafts, administrative/API/private-document routes, and staging. Protect or noindex staging. Filter and facet variants must not become indexable landing pages. Structured data is limited to facts accurately shown to visitors; omit hidden prices, unsupported availability, ratings, reviews, locations, and unknown attributes. Support robots controls, Search Console, and a privacy-conscious GA4/GTM/Ads measurement architecture without putting personal data in analytics or URLs. Do not invent keyword volume, ranking, review, or business claims.

## Performance Targets

Performance is a user-facing acceptance requirement. Target Core Web Vitals at the 75th percentile of real visits when sufficient field data exists: LCP no more than 2.5 seconds, INP no more than 200 milliseconds, and CLS no more than 0.1. Before sufficient field data exists, use repeatable representative lab measurements and avoid regressions.

Serve responsive optimised image derivatives rather than large originals to ordinary visitors. Reserve layout space for media, limit unnecessary client-side JavaScript and third-party embeds, and prioritise server-rendered usable content. Optional video and animation must load only when useful and must not block core content or contact actions. Report unavailable media or data with recoverable states.

## Animation Constraints

Homepage excavator motion is optional enhancement. Keep the body/tracks visually anchored; any boom/arm response remains restrained and reverses where practical. Provide static or simplified behaviour for reduced-motion preference, mobile, and constrained devices. Avoid motion as a sole carrier of meaning, input, or navigation. Animation must not delay content, harm scrolling, obscure controls, or reduce performance. The page must remain complete when all animation is disabled.

## Acceptance Criteria

A release candidate is acceptable when:

1. A visitor can reach available excavators from the homepage and open a unique page for each published physical unit.
2. Machine cards and details show genuine approved imagery, known facts, current status, and the correct public price state; unknown facts are omitted.
3. Available, Reserved, Sold, Draft, and Published states remain distinct and produce truthful public output.
4. Sold pages remain accessible and do not invite a visitor to buy or view that unavailable unit as current stock.
5. Categorised images form one usable gallery, with usable keyboard and touch controls and optional fact-to-image evidence links where applicable.
6. Missing optional media and empty inventories have useful states. Data/media/form failures explain the next available action.
7. Machine-specific contact paths retain machine identity and page context; general and machine enquiry forms validate input and report accepted, failed, and in-progress states accurately.
8. Public requests cannot retrieve drafts, private serial data, original sensitive documents, or unapproved derivatives through pages, APIs, caches, or predictable URLs.
9. Owners can complete routine inventory and content work through Payload without developer tools.
10. SEO output contains only intended canonical public records and verified visible facts; staging and non-public content are excluded.
11. Core flows work with keyboard, assistive technology, reduced motion, mobile layouts, and slow or failed optional media.
12. The application can be rebuilt and redeployed on a compatible host without source rewrite or material redesign, using separately configured database and object storage.
13. No secrets are committed; configuration examples contain variable names only.

Launch additionally requires owner confirmation of public business/contact/location claims, inventory facts and image rights, policy/legal copy, production readiness, operational responsibilities, and restore evidence. This specification does not itself authorise a production launch.

## Testing Strategy

For meaningful changes, apply the repository's quality requirements: relevant linting, type checks, automated tests, and a production build where practical. UI changes include representative responsive inspection and accessibility review. Do not use real credentials, production data, or private originals in routine test environments.

Test representative valid and invalid inputs; missing optional fields and images; zero, one, and many machines; duplicate model/year with distinct machine identities; Available, Reserved, Sold, Draft, and Published combinations; long content; corrected slugs; image processing failures; private/public document boundaries; empty/no-result inventory; form delivery success/failure; and slow or unavailable optional services. Verify sitemap, canonical, robots, structured data, staging exclusion, and privacy-safe analytics projections. Verify backup and restore procedures with representative disposable content before launch. Externally hosted, production, and paid-service checks require their own approved access and scope.

## Build Sequence

1. Establish the portable Next.js/Payload/PostgreSQL foundation, environment configuration, and deployment feasibility.
2. Define stable physical-machine identity, structured content, publication/status semantics, and owner workflows.
3. Implement structured media processing and enforce private-original/public-derivative boundaries.
4. Build public inventory and machine pages with status-aware presentation and stable URLs.
5. Add direct enquiry, phone, WhatsApp, and supporting information routes when their details are configured and verified.
6. Complete accessible responsive presentation, inventory SEO, and the optional hero enhancement.
7. Complete analytics/privacy, security, backup/recovery, and operational readiness.
8. Validate owner workflows, representative edge cases, device states, and launch facts before any authorised launch.

Dependencies and phase status are maintained in the project roadmap and requirements; this sequence does not supersede those records.

## Future Extensibility

Keep boundaries clear enough to support a compatible application host, PostgreSQL provider, and object-storage service change through configuration and adapters rather than business-logic rewrite. Preserve physical-machine identity and content history so future inventory growth does not require URL reuse. Structured media categories should accommodate real operational needs without requiring every category to be populated.

Additional languages, other machinery, richer rental/service information, a lubricant catalogue, advanced inventory tools, and expanded reporting may be considered when HGR has verified content and an explicit need. Their possibility does not authorise their inclusion in V1. Ecommerce, CRM, automatic Mudah synchronisation, customer accounts, and online viewing bookings remain outside V1 scope.
