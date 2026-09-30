# HGR Technical References

## Purpose

Structured location for official technical references during Phase 2 and later implementation. The technology stack is not yet decided. Blank categories are intentional and must not be filled with assumed products.

Sources: [[00 - Project/Project Roadmap]], [[07 - Decisions/Technical Architecture Decisions]] and the existing specifications.

Prefer official documentation applicable to the selected version. Tutorials may supplement it, but must not become the authority for security, deployment or product behaviour. Verify URLs and review dates before relying on a reference.

## Reference categories

| Category | Relevant HGR need | Current status |
|---|---|---|
| Framework documentation | Crawlable responsive pages, stable routes, maintainability | [DEFERRED] selection; documentation not assigned |
| CMS/admin documentation | Owner workflow, two accounts, preview and publish | [DEFERRED] implementation |
| Database documentation | Stable machine identity, status and pricing data | [DEFERRED] |
| Hosting documentation | Reliable public site and operations | [DEFERRED] |
| Image/CDN documentation | Original uploads, responsive derivatives and watermarks | [DEFERRED] providers |
| Authentication documentation | Protected admin, sessions and password recovery | [DEFERRED] |
| Email/form documentation | Reliable enquiry delivery and anti-spam | [DEFERRED] provider |
| Analytics documentation | Established GA4/GTM and conversion requirements | Products established; configuration [DEFERRED] |
| Google documentation | Search Console, Ads and verified Business Profile needs | Account/access [TO CONFIRM]; setup [DEFERRED] |
| SEO documentation | Crawling, canonical identity, pagination and schema | Framework-independent references below |
| Accessibility documentation | Keyboard access, contrast, form labels and reduced motion | Applicable implementation references [DEFERRED] |
| Performance documentation | Fast images, galleries and hero fallback | Framework-independent reference below |
| Animation documentation | Realistic scroll interaction with fallbacks | [DEFERRED] method/library |
| Deployment documentation | Safe release, staging and recovery | [DEFERRED] platform and process |

## Framework-independent references checked during planning

These references support requirements; they do not select HGR's stack. Recheck current documentation before implementation.

### Crawl and indexing controls

Technology / Topic: Google Search robots.txt  
Official Documentation: [Introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)  
Purpose: Distinguish crawler control from indexing and access protection.  
Relevant HGR Requirement: Public inventory discoverability and private staging/admin.  
Decision Status: Reference only; implementation [DEFERRED].  
Notes: Do not use robots.txt as authentication or a substitute for an indexing policy.

### Incremental inventory loading

Technology / Topic: Google Search pagination  
Official Documentation: [Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)  
Purpose: Evaluate discoverable inventory when pagination or Load More is selected.  
Relevant HGR Requirement: All published units remain reachable.  
Decision Status: Pagination/Load More decision [DEFERRED].  
Notes: HGR does not require an e-commerce transaction system merely because the reference discusses catalogues.

### Machinery structured data

Technology / Topic: Product snippets  
Official Documentation: [Product snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)  
Purpose: Evaluate applicability and required truthful data.  
Relevant HGR Requirement: Actual-unit descriptions, price visibility and sold status.  
Decision Status: Exact schema and eligibility [DEFERRED].  
Notes: Do not invent price, reviews or availability to obtain a search feature.

### Performance

Technology / Topic: Web Vitals  
Official Documentation: [Web Vitals](https://web.dev/articles/vitals)  
Purpose: Guide performance measurement.  
Relevant HGR Requirement: Fast mobile inventory, galleries and homepage motion.  
Decision Status: Performance priority established; implementation [DEFERRED].  
Notes: Use representative pages and field data when available.

## Template for future references

Technology / Topic:
Official Documentation:
Purpose:
Relevant HGR Requirement:
Decision Status:
Notes:

Include version, review date and any limitation in Notes. Use [DEFERRED] when the related choice is open. Keep actual architecture choices in Technical Architecture Decisions and confirmed decisions in Decision Log; a reference entry alone does not decide a technology.
