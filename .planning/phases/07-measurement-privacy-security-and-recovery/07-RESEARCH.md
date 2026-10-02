# Phase 7: Measurement, privacy, security and recovery — Research

**Researched:** 2026-10-02  
**Domain:** GA4/GTM lead measurement, privacy boundaries, Payload authorization, staging protection, and PostgreSQL/GCS recovery  
**Confidence:** MEDIUM overall; HIGH for inspected repository behavior; MEDIUM for external vendor guidance (the verified web-search provider tier); actual accounts, services, staging and backup targets remain unverified.

## User Constraints

No Phase 7 CONTEXT.md exists. The owner explicitly requested continuing Phase 7 after the enquiry UX pass and directed that material data-model or business-workflow changes require a stop for approval. Continue within the approved roadmap and keep account, consent, recipient/retention, privacy reviewer, backup target/operator, and external-service items as explicit gates. This research agent was separately restricted to research only; that subtask boundary is not a project-wide prohibition on local Phase 7 implementation. Do not change architecture, collections, routes, authentication/permissions, deployment or production configuration; do not create paid resources; do not claim live database/GCS verification. [VERIFIED: `.planning/ROADMAP.md:166-179`; current task instruction]

## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| ANLY-01 | HGR can configure GA4, GTM, Search Console and Google Ads conversion measurement through environment/account configuration without exposing credentials in Git. | Use runtime-safe configuration and account-controlled tags; public IDs are not secrets, but all credentials remain private. Confirm exact accounts and authorization before activation. |
| ANLY-02 | Useful inventory/unit, WhatsApp, phone, form and viewing actions can be measured without claiming that a click proves an offline sale. | Define a small event map separating page/unit views, CTA clicks, and accepted form requests; label click intent as an interaction, not an offline conversion. |
| ANLY-03 | Successful form submission is distinguishable from a form start, button click or failed delivery in measurement. | Fire the lead-success event only from the server-returned accepted state; keep form start, click, invalid, unavailable and failed states distinct. |
| ANLY-04 | Where practical and permitted, HGR can distinguish Mudah referral/campaign traffic from other sources while Mudah listings remain independently managed. | Use categorical, non-personal source/medium/campaign URL parameters on HGR links where permitted; do not automate or depend on Mudah. |
| ANLY-05 | Names, phone numbers, emails, free-text messages and private serials do not enter ordinary analytics events, URLs or campaign parameters. | Treat URLs, titles, referrers, UTM values, event names and all parameters as possible leakage paths; allow only bounded non-personal analytics fields. |
| ANLY-06 | Conversion implementation avoids material duplicate counting and follows reviewed tag/consent controls. | One source-of-truth success transition and consent-aware tag firing reduce duplicates; fully reliable retry deduplication may require persistent submission identity and a business workflow decision. |
| SAFE-01 | Public and unauthenticated requests cannot access unpublished machine records, private serial fields or original JPJ/ownership files through pages, APIs, generated media or cached responses. | Reuse published-only reads, explicit public projections, staff-only document/media access and `private, no-store` response handling; verify every route and real cache/storage boundary. |
| SAFE-02 | Uploads and form input are validated, and administrator access follows least privilege appropriate to the two initial accounts. | Preserve server-side input validation, typed per-field errors, current two-role owner/admin model, upload allowlists/limits and direct authorization tests. |
| SAFE-03 | Staging is protected and non-indexable, with test credentials/data and tags handled separately as appropriate. | Indexing opt-in already fails closed in app metadata; crawler controls are not access control. Staging auth, separate tags/data/credentials and deployed cache behavior require target verification. |
| SAFE-04 | Database, structured content, media and deployment configuration have a documented backup and recovery procedure. | Document PostgreSQL and object recovery separately, plus protected environment/configuration recovery and migration/source revision; owner must choose targets, retention and operator. |
| SAFE-05 | Maintainers can demonstrate a restore of representative database and media content before launch. | Make a representative restore test and verify related content plus private/public asset behavior; no live target or restore can be claimed here. |
| SAFE-06 | Reviewed privacy/terms/form and third-party disclosures match actual enquiry, media, analytics, mail and embed behaviour before publication. | Update existing drafts only after confirming actual recipients, providers, logs, storage locations, analytics tags, consent behavior and retention; require designated privacy/legal review before publication. |
| SAFE-07 | No passwords, API keys, database credentials, service-account credentials, private keys or `.env` secrets are committed to Git. | Preserve names-only `.env.example`, existing ignore rules, secret scanning/review and no credentials in source, logs, plans or browser bundles. |

## Summary

The least disruptive Phase 7 approach is to preserve the current Next.js/Payload/PostgreSQL/GCS foundation and add an explicit measurement map and a tested operational recovery runbook around it. Use a small set of consent-reviewed, non-personal events; classify a form lead only after the server returns its accepted state; and describe WhatsApp, phone and viewing actions as contact intent rather than completed sales. The repo already has a server action with distinct `idle`, `invalid`, `unavailable`, `failed`, and `accepted` form states and an SMTP adapter that determines whether the configured recipient accepted a message. [VERIFIED: `src/app/(site)/contact/actions.ts:11-16,58-68` — values quoted: `"idle" | "invalid" | "unavailable" | "failed" | "accepted"`; `src/lib/email/enquiryAdapter.ts:63-70`]

Privacy and data recovery are operational gates, not facts to infer from code. The policy draft itself says actual hosting, logs, cookies, third parties, recipients, retention, and reviewer/contact processes require owner confirmation and must be checked before publication. The roadmap also leaves account access, consent configuration, privacy reviewer, backup targets and responsible operator as TO CONFIRM. No live PostgreSQL, GCS, Google account, staging deployment, or restore test was inspected or performed. [VERIFIED: `.planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md:1-9,27-53`; `.planning/ROADMAP.md:179`]

**Primary recommendation:** Implement low-volume first-party event dispatch from explicit UI/server outcomes into a centrally reviewed GTM/GA4 setup, with strict data allowlisting and the owner-selected consent policy; keep customer messages solely in the enquiry delivery path. In parallel, document a PostgreSQL + object-storage + configuration recovery procedure and require a representative restore on already-approved disposable services before launch. Do not add a lead database/CRM just to get deduplication unless HGR explicitly accepts that workflow and schema change. [CITED: https://support.google.com/analytics/answer/9267735; https://developers.google.com/tag-platform/security/concepts/consent-mode; ASSUMED: best-fit implementation recommendation based on current HGR constraints]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Machine/unit and acquisition event design | Browser / Client | Frontend Server (SSR) | The browser observes rendered routes and interaction intent; server-generated values may safely supply only approved public machine identity/context. |
| Enquiry success measurement | API / Backend | Browser / Client | The server owns validation and delivery outcome; the client reports only the accepted outcome, never raw form values. |
| Tag and consent settings | Browser / Client | API / Backend | GTM tags execute in the browser; the app controls whether/how its tag loader is exposed and provides consent state. Account and policy settings stay under HGR control. |
| Published/draft/private-data authorization | API / Backend | Database / Storage | Payload collection, field, route and media authorization decide what can be read; database and object-store permissions are additional boundaries. |
| Staging protection and indexing | Frontend Server (SSR) | CDN / Static | App policy emits noindex/crawler hints; host-level authentication and edge/cache configuration must stop anonymous reads independently. |
| Database, media and configuration backup/restore | Database / Storage | API / Backend | PostgreSQL, external GCS objects and application configuration are different recovery inputs; the application confirms restored relationships and access paths. |
| Privacy/terms disclosure | Browser / Client | API / Backend | Published wording must describe actual visitor-visible collection and actual backend/provider handling; an owner-designated reviewer approves it. |

## Project Constraints (from AGENTS.md)

- Preserve the approved stack: Next.js, Payload CMS, PostgreSQL and external object storage (GCS planned); keep host/database/storage portable, use environment configuration, and never substitute Exabytes MariaDB. [VERIFIED: `AGENTS.md`, “Approved Architecture” and “Deployment Portability”]
- Do not change architecture, collections, routes, access roles, deployment, production configuration, or create paid resources under this research scope. Never modify production systems, DNS, or create chargeable infrastructure without explicit approval. [VERIFIED: task instruction; `AGENTS.md`, “User and Working Style”, “Git and Change Safety”]
- Keep secrets out of Git and `.env` files out of source control; keep `.env.example` to names only. Use least privilege, validate uploads and user input, and do not expose internal machine data. [VERIFIED: `AGENTS.md`, “Security and Privacy”; `.gitignore:1-17,19-35`; `.env.example:1-33`]
- Keep the website lead-generation only; ecommerce, a CRM and multilingual pages are out of V1. Routine owner operations stay in Payload; the seeded role names are `"Owner"` and `"Website Administrator"`. [VERIFIED: `AGENTS.md`, “Core Business”, “CMS Principle”, “Engineering Principles”; `src/lib/auth/permissions.ts:7-17` — quotes: `name: "Owner"`, `name: "Website Administrator"`]
- Keep original JPJ/ownership documents private; public redacted copies remain separate, human-reviewed, and explicitly approved. Preserve stable machine identity and private serial visibility rules. [VERIFIED: `AGENTS.md`, “Machine Documentation and JPJ Documents”, “Security and Privacy”; `.planning/phases/03-photography-media-processing-and-jpj-protection/03-RESEARCH.md`]
- Follow `MODEL-ROUTING.md`: privacy/security architecture, auth/authorization, private document protection, deployment, destructive actions and high-risk final review escalate to GPT-6.1 Sol. Model selection does not grant owner approval. [VERIFIED: `MODEL-ROUTING.md`, “GPT-6.1 Sol” and “Owner approval and privacy boundaries”]
- For meaningful implementation, project QA expects relevant lint, types, automated tests, production build where practical, responsive/accessibility review, error/empty-state checks and secret review. Do not claim live database/GCS or production behavior from local-only tests. [VERIFIED: `AGENTS.md`, “Quality Assurance”; `.planning/STATE.md`, “Blockers/Concerns”]

## Standard Stack

### Core

| Library / service | Version | Purpose | Why Standard |
|---|---|---|---|
| Next.js | `16.3.7` | App/server rendering, forms, routes and runtime configuration | Already installed and approved; use existing framework and review current official version guidance before implementation. [VERIFIED: `package.json:23` — quote: `"next": "16.3.7"`] |
| Payload CMS + Postgres adapter | `3.90.2` | Authentication, collections, access rules and PostgreSQL content | Existing approved CMS/database foundation and existing role/document rules. [VERIFIED: `package.json:18-25` — quotes: `"@payloadcms/db-postgres": "3.90.2"`, `"payload": "3.90.2"`] |
| `@payloadcms/storage-gcs` | `3.90.2` | Existing private object storage adapter | Already used by media/document collections; keep objects private and validate the adapter/bucket boundary on a permitted disposable target. [VERIFIED: `package.json:21`; `src/payload.config.ts:77-88` — quote: `acl: "Private"`] |
| GA4, GTM, Search Console, Google Ads | Current HGR accounts: TO CONFIRM | Marketing measurement, search verification and Ads conversion reporting | Named in ANLY-01, but account access, identifiers, permissions, consent policy and tag activation remain gates; no service activation is assumed. [VERIFIED: `.planning/REQUIREMENTS.md:136-141`; `.planning/ROADMAP.md:179`]
| PostgreSQL tools (`pg_dump`, `pg_restore`) | Local CLI not found | Logical database backup and representative restore | PostgreSQL’s official docs describe `pg_dump` and `pg_restore`; local commands are currently unavailable, and no service was contacted. [CITED: https://www.postgresql.org/docs/current/app-pgdump.html, https://www.postgresql.org/docs/current/app-pgrestore.html; VERIFIED: current-session PATH probe]

### Supporting

| Library / service | Version | Purpose | When to Use |
|---|---|---|---|
| GA4 recommended `generate_lead` event | Not a package/versioned dependency | Aggregate signal for an accepted request for information | Use only after the server reports the selected success state and after owner consent/tag review. [CITED: https://support.google.com/analytics/answer/9267735] |
| Google Consent Mode via GTM | Current account configuration: TO CONFIRM | Pass visitor consent choices to supported Google tags | Only after the appropriate consent behavior is reviewed and implemented. Basic and advanced modes transmit different pre-consent data. [CITED: https://developers.google.com/tag-platform/security/concepts/consent-mode] |
| PostgreSQL logical archive + GCS object recovery | No new package | Backup and restore data across separate persistence systems | Use the approved provider-native procedure once the owner identifies existing targets, access, retention and operator; verify representative restored machine/document/media links. [CITED: PostgreSQL backup docs above; https://docs.cloud.google.com/storage/docs/soft-delete] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Load Google tags directly in several components | One reviewed GTM integration and named event contract | Centralizes tag changes and consent checks. Direct snippets split policy across pages and can create duplicate sends. [ASSUMED: project-specific recommendation] |
| Record every web lead in a new database collection to deduplicate attempts | Best-effort event on one accepted UI transition, with guarded submission state | Avoids introducing a V1 CRM/data model. Browser/network retry dedupe is weaker; persistent idempotency requires a lead record or equivalent durable token. [ASSUMED: data/workflow tradeoff] |
| Treat robots/noindex as staging privacy | Existing host-level password/auth protection plus app-level non-indexing | Crawler directives do not prevent direct requests. Exact staging host access control remains unverified. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro; `.planning/phases/06-accessible-design-and-inventory-seo/06-RESEARCH.md:168-202`]
| Treat GCS soft delete or versioning as a complete backup | Separate DB backup, object recovery/export, configuration recovery, and restore exercise | Object recovery protects a storage failure class but does not establish database/config consistency or application recovery. Soft delete/version retention may affect charges. [CITED: https://docs.cloud.google.com/storage/docs/soft-delete, https://docs.cloud.google.com/storage/docs/object-versioning] |

**Installation:** None recommended. No new external package is needed for the identified work. Existing tests use Node’s built-in test runner. [VERIFIED: `package.json:9-16` — scripts quote: `"typecheck": "tsc --noEmit"`, `"build": "next build"`; test files under `tests/`]

## Architecture Patterns

### System Architecture Diagram

```text
Public route / machine page
        ├── safe page + public machine projection ──> browser renders
        │                                             ├── approved event map ──> consent-aware GTM/GA4
        │                                             └── WhatsApp/phone/viewing CTA ──> external contact
        └── no raw enquiry fields enter analytics

Enquiry form ──> server validation ──> configured mail adapter
                                      ├── accepted ──> success state ──> one generate_lead event
                                      ├── invalid ──> field errors, no conversion
                                      ├── unavailable/failed ──> retry/help state, no conversion
                                      └── no permanent lead record today

Staff request ──> Payload auth + collection/field/route rules ──> PostgreSQL
                    └── private media/document file gate ──> private GCS object
                            └── explicitly approved derivative only ──> public media path

Approved recovery operator ──> database archive + object recovery/export + protected config
                                └── disposable restore ──> representative relation/access checks
```

This diagram follows the inspected current server action, Payload configuration, public query and protected media/document paths; it does not assert that a live mail, database, storage, analytics or backup service is configured. [VERIFIED: `src/app/(site)/contact/actions.ts:21-69`; `src/payload.config.ts:31-93`; `src/lib/machines/publicQueries.ts:50-101`; `src/collections/MachineDocuments.ts:30-44,242-251`; `.planning/STATE.md`, “Blockers/Concerns”]

### Recommended Project Structure

Keep the existing structure; plan narrowly around `src/app/(site)` for UI/server actions, `src/lib/enquiries` for server outcome semantics, one small analytics client/adapter under `src/lib` or `src/components/site`, existing `src/lib/machines` public authorization/projection helpers, existing Payload collection/auth files, and a new recovery procedure under `docs/operations`. The document path is a recommendation, not an observed existing directory. [VERIFIED: `rg --files src` inventory; ASSUMED: proposed recovery document placement]

### Pattern 1: Allowlisted analytics events

**What:** Define a small event map and explicit parameter allowlist. Send only coarse action type, stable public machine reference/path, and page context; never pass form values, private serials, user-provided referrers, free-text UTMs, email/phone or the complete query string. Do not encode customer details in event names or labels. [CITED: https://support.google.com/analytics/answer/6366371?hl=en]

**When to use:** For inventory/unit views, CTA interactions, form starts, and successful form outcomes. Separate an outbound click from an accepted enquiry and from any offline sale. [CITED: https://support.google.com/analytics/answer/9267735; `.planning/REQUIREMENTS.md:137-141`]

```ts
// Illustrative only: fire after the server returns its accepted state.
// Keep the payload to an approved, non-personal event and public unit reference.
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "generate_lead",
  machine_reference: publicMachineReference,
});
```

`generate_lead` is the GA4 recommended event for a form/information request. The data-layer push shape is Google's documented GTM mechanism. `machine_reference` above is an implementation proposal and should be included only if HGR approves this aggregate dimension; do not pass an internal or sensitive identifier. [CITED: https://support.google.com/analytics/answer/9267735; https://developers.google.com/tag-platform/tag-manager/datalayer; ASSUMED: proposed parameter name]

### Pattern 2: Treat server outcome as conversion authority

**What:** Trigger the success event after `sendEnquiry` returns the accepted branch; never from submit-button click, form start, client-side validation, or a generic HTTP response before the mail adapter finishes. Current accepted means the SMTP transport reports the configured recipient in its accepted list; it does not prove the person received, read, or converted from the email. [VERIFIED: `src/app/(site)/contact/actions.ts:58-68`; `src/lib/email/enquiryAdapter.ts:63-70`]

**When to use:** For ANLY-03 and whenever delivery can be unavailable or fail. Keep form start, contact clicks, invalid submissions, accepted submission, unavailable/failed delivery and offline sale as separate concepts. [VERIFIED: `src/lib/enquiries/submit.ts:55` — quote: `"accepted" | "unavailable" | "failed" | "invalid"`; `src/app/(site)/contact/actions.ts:11-16`]

### Pattern 3: Keep public projection and file access as separate boundaries

**What:** Public routes use the existing published/non-archived query and explicit projection; private document reads remain staff-only; GCS remains private; public images are served only through the verified derivative authorization gate. Private route responses use `private, no-store`. Crawler metadata is not an authorization decision. [VERIFIED: `src/lib/machines/access.ts:18-27`; `src/lib/machines/publicQueries.ts:50-101`; `src/lib/machines/publicProjection.ts:1-100`; `src/payload.config.ts:77-88`; `src/app/(payload)/api/[...slug]/route.ts:13-29`; `src/collections/MachineDocuments.ts:39-44,242-251`; CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro]

**When to use:** Any security audit/test touching page routes, REST/GraphQL/Local API, static file delivery, CDN/browser caches, preview and staging. Ensure trusted server paths that use Payload Local API `overrideAccess: true` remain narrowly scoped and cannot be reached with untrusted caller data. [VERIFIED: `src/collections/Machines.ts:188-194`; `src/app/api/machine-documents/[action]/route.ts:37-50`; CITED: https://payloadcms.com/docs/access-control/overview]

### Pattern 4: Portable configuration at runtime

Next.js documents that `NEXT_PUBLIC_` variables are inlined into the browser bundle at build time, while server environment values can be read during dynamic rendering. To support environment/account configuration without freezing a target’s ID into a promoted build, read the non-secret ID at request/runtime on the server and expose only the validated public tag identifier to the rendered client. Never expose a private key or OAuth credential to client code. [CITED: https://nextjs.org/docs/app/guides/self-hosting; https://nextjs.org/docs/pages/guides/environment-variables]

### Anti-Patterns to Avoid

- **Fire lead conversions on button clicks:** counts attempts, validation errors and delivery failures as successes. Fire only after an accepted server result. [VERIFIED: current accepted/failed server paths cited in Pattern 2]
- **Forward the entire form object, query string, referrer or UTM value to analytics:** a field or campaign string can contain PII; Google expressly prohibits sending recognizable PII. [CITED: https://support.google.com/analytics/answer/6366371?hl=en]
- **Assume a GTM container is inherently safe:** users with container Publish rights can publish tag changes; restrict account permissions and review published changes, tag inventory, consent checks, preview behavior, and network requests. [CITED: https://support.google.com/tagmanager/answer/6107011?hl=en-GB; https://support.google.com/tagmanager/answer/6107163; ASSUMED: operational recommendation]
- **Use robots.txt as staging protection:** it is crawl guidance, while access control must reject unauthenticated reads. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro]
- **Call an email-accepted event a sale or guaranteed delivery:** current code only sees the adapter’s acceptance result; offline outcome is unobserved. [VERIFIED: `src/lib/email/enquiryAdapter.ts:63-70`; `.planning/REQUIREMENTS.md:137`]
- **Treat private GCS ACL, no-store headers, or soft delete as proof of live confidentiality/recovery:** these controls need target-specific anonymous-denial, cache and restore verification. [VERIFIED: `src/payload.config.ts:77-88`; `src/app/(payload)/api/[...slug]/route.ts:13-29`; CITED: https://docs.cloud.google.com/storage/docs/public-access-prevention; https://docs.cloud.google.com/storage/docs/soft-delete]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| GA4 event semantics and campaign dimensions | Arbitrary bespoke event names and source parsing | GA4 recommended events, controlled UTM taxonomy, explicit app event adapter | Google documents recommended events and UTM dimensions; constrained values are easier to review for privacy and duplication. [CITED: https://support.google.com/analytics/answer/9267735; https://support.google.com/analytics/answer/15612152?hl=en] |
| Consent state machinery | A loose custom cookie plus tags that ignore it | Owner-selected CMP/consent design and Google’s documented GTM consent integration | Consent Mode requires obtaining choices, communicating state and ensuring tags honor it. [CITED: https://developers.google.com/tag-platform/security/concepts/consent-mode; https://support.google.com/tagmanager/answer/10718549] |
| Content authorization | Custom parallel read APIs that duplicate Payload rules | Existing Payload access policies and explicit public projection | Avoids divergence across page/API/media paths; Local API overrides require deliberate trusted use. [VERIFIED: `src/lib/machines/publicQueries.ts:50-101`; `src/lib/machines/publicProjection.ts:1-100`; CITED: https://payloadcms.com/docs/access-control/overview] |
| Database dumps and archive extraction | Hand-written SQL export/restore scripts | PostgreSQL `pg_dump` / `pg_restore` or an approved managed-provider equivalent | Officially maintained formats and restore tooling; separate from GCS object recovery. [CITED: https://www.postgresql.org/docs/current/app-pgdump.html; https://www.postgresql.org/docs/current/app-pgrestore.html] |
| Cloud object restore | Copying public URLs as “backup” | Approved Cloud Storage recovery/export procedure using private IAM and a tested restore | Public delivery URLs do not capture all originals, versions, permissions or deleted data. [CITED: https://docs.cloud.google.com/storage/docs/soft-delete; https://docs.cloud.google.com/storage/docs/access-control/best-practices-access-control] |

**Key insight:** Trustworthiness depends on preserving meaning and scope across systems: the analytics event must reflect a real server outcome without exposing the enquiry, while recovery must restore PostgreSQL metadata and matching external objects without making private originals public. No single tag setting, crawler rule, database dump or bucket feature proves that combined behavior. [VERIFIED: repository flow citations above; CITED: official sources above]

## Common Pitfalls

### Pitfall 1: PII leaks through apparently harmless campaign data

**What goes wrong:** Email addresses, names or free text can appear in a landing URL, page title, referrer or UTM parameter and be collected automatically by analytics. **Why:** Analytics records route and campaign dimensions, not just explicitly named custom parameters. **How to avoid:** Define a controlled non-personal campaign vocabulary, validate it before analytics dispatch, suppress query strings/referrer paths where they are not needed, and test captured requests using synthetic PII sentinels. **Warning signs:** full query strings, free-form `utm_term`, customer values in labels, or email/phone-like strings in DebugView/network requests. [CITED: https://support.google.com/analytics/answer/6366371?hl=en; https://support.google.com/analytics/answer/15612152?hl=en]

### Pitfall 2: Failed or repeated form requests inflate leads

**What goes wrong:** A click trigger counts failed mail delivery as a lead, or repeat submissions/retries inflate accepted request counts. **Why:** browser actions happen before server delivery status; email APIs and browser responses can be retried. **How to avoid:** Trigger only after the existing accepted state, block duplicate submission while pending, dispatch once per rendered success transition, and label the metric “accepted enquiry” rather than “sale.” Define the tolerance for browser retry duplication. **Warning signs:** event counts match clicks but exceed accepted states, or event count changes after page refresh/resubmission. [VERIFIED: `src/app/(site)/contact/actions.ts:58-68`; `src/lib/email/enquiryAdapter.ts:63-70`; ASSUMED: recommended UI guard]

### Pitfall 3: A code gate is mistaken for an environment boundary

**What goes wrong:** Staging content or private assets can be fetched directly or retained by a CDN even when the page is noindex. **Why:** robots metadata guides crawlers and route headers do not prove reverse-proxy behavior. **How to avoid:** require staging HTTP/app authentication; test anonymous page, Payload API, media/document file, preview, CDN and cache requests on the chosen target; inspect `Cache-Control` at the edge. **Warning signs:** noindex-only staging, publicly reachable origin, browser cache showing prior response, or a public object URL for originals. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro; VERIFIED: `src/app/(payload)/api/[...slug]/route.ts:13-29`; deployment unknowns: `.planning/STATE.md`, “Blockers/Concerns”]

### Pitfall 4: Backup completeness is confused with a successful database dump

**What goes wrong:** Database rows restore, but their photo/document objects or application configuration are missing; alternatively, soft-delete retention expires before recovery. **Why:** media is an external persistence service; database dump and object-store recovery are separate operations. **How to avoid:** include PostgreSQL, all object classes, migration/source revision, protected configuration recovery, operator steps, and restore assertions in one runbook. Keep private originals private in the restore target. **Warning signs:** a runbook lists only `pg_dump`, assumes URLs remain valid, lacks permissions/secret recovery steps, or has no measured restore rehearsal. [VERIFIED: `src/payload.config.ts:70-88`; CITED: PostgreSQL and Cloud Storage references under Don't Hand-Roll]

### Pitfall 5: Server runtime ID gets accidentally baked into the build

**What goes wrong:** Analytics points at one environment after the app is promoted. **Why:** Next.js inlines `NEXT_PUBLIC_` variables at build time. **How to avoid:** use a validated, server-rendered runtime configuration for a public GTM/GA identifier, or intentionally rebuild per environment with documented separate values. **Warning signs:** direct `NEXT_PUBLIC_` reference for a value expected to vary after build. [CITED: https://nextjs.org/docs/app/guides/self-hosting; https://nextjs.org/docs/pages/guides/environment-variables]

## Runtime State Inventory

Not applicable: Phase 7 is a measurement/security/recovery phase, not a rename, refactor or migration of existing identifiers. [VERIFIED: `.planning/ROADMAP.md:166-179`]

## Environment Availability

| Dependency | Required By | Available | Version / status | Fallback |
|---|---|---|---|---|
| Node.js / npm | Local source/test/build workflow | ✓ | Node `v24.21.0`; npm `11.19.0` | — |
| PostgreSQL client/backup tools (`psql`, `pg_dump`, `pg_restore`) | SAFE-04/05 restore rehearsal | ✗ in current PATH | Not found by current-session `Get-Command` probe | Use an already-approved environment/provider procedure only after target/operator are confirmed; no target verified here. |
| Google Cloud CLI (`gcloud`) | Optional object backup/restore operations | ✗ in current PATH | Not found by current-session `Get-Command` probe | Use approved provider-native console/API procedure or a maintainer-provided reviewed tool; no installation or cloud access attempted. |
| PostgreSQL database and GCS-compatible storage | Restore rehearsal | Not verified | Owner/state record says no disposable PostgreSQL/GCS service was available; no live probing performed. | Keep live restore as pending; do not create or pay for resources. |
| GA4, GTM, Search Console, Google Ads accounts | ANLY-01 and event validation | TO CONFIRM | No account/permission/ID inspected | Draft the event contract and synthetic tests locally; activation waits for owner access, consent and privacy review. |
| Staging host and edge/cache controls | SAFE-03 and SAFE-01 | Not verified | No staging deployment or cache was inspected | Code-only tests can check response policy; target verification remains required before launch. |
| Enquiry recipient/SMTP | Conversion outcome and privacy disclosure | TO CONFIRM | `.env.example` contains variable names, no values | Injected adapter tests; do not claim delivery or disclose an assumed recipient/provider. |

**Missing dependencies with no fallback:** No disposable restore target is confirmed; SAFE-05 live restore proof cannot be completed until an existing authorized disposable target is made available.  
**Missing dependencies with fallback:** Local CLI backup tools may be supplied by an already approved target/provider later; no remote backup/restore result is established by this report. [VERIFIED: current PATH probe; `.planning/STATE.md`, “Blockers/Concerns”; `.planning/ROADMAP.md:179`]

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation` is `true`). [VERIFIED: `.planning/config.json:20-25` — quote: `"nyquist_validation": true`]

### Test Framework

| Property | Value |
|---|---|
| Framework | Existing tests are Node.js built-in test-runner `.mjs` files; no test package is required. |
| Config file | None observed; `package.json` has no test script. [VERIFIED: `package.json:9-16`] |
| Quick run command | `node --test tests/phase5-enquiries.test.mjs tests/machine-access.test.mjs tests/machine-documents.test.mjs` |
| Full suite command | `node --test tests/*.test.mjs` (subject to the known sandbox `tsx` child-process ENOMEM limitation recorded in STATE). |

Commands are recommended for planning only and were not run in this research task. The existing test tree includes enquiry, machine access, document, media, and SEO test modules. [VERIFIED: `tests/` inventory; `.planning/STATE.md`, “Blockers/Concerns”]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| ANLY-01 | Missing/invalid runtime public tag ID does not load tags; separate environment IDs are not frozen unexpectedly. | unit/build + account manual | `node --test tests/phase7-analytics.test.mjs` | ❌ Wave 0 |
| ANLY-02 | Safe unit view and CTA events include no private fields; clicks are labeled as intent. | unit/browser manual | `node --test tests/phase7-analytics.test.mjs` | ❌ Wave 0 |
| ANLY-03 | Only server-accepted form shows success event; starts, invalid, unavailable and failed outcomes do not. | unit/integration | `node --test tests/phase7-analytics.test.mjs tests/phase5-enquiries.test.mjs` | ❌ Phase 5 only exists |
| ANLY-04 | Approved Mudah campaign values are distinguishable; arbitrary/personal campaign values are rejected or omitted. | unit/manual link QA | `node --test tests/phase7-analytics.test.mjs` | ❌ Wave 0 |
| ANLY-05 | Synthetic name/email/phone/message/serial sentinel never occurs in analytics request URL, event payload, title or parameter. | unit/browser network | `node --test tests/phase7-analytics.test.mjs` | ❌ Wave 0 |
| ANLY-06 | Repeated click/submit while pending emits at most one success event; consent state gates/revokes tags per chosen policy. | unit/browser/Tag Assistant manual | `node --test tests/phase7-analytics.test.mjs` | ❌ Wave 0 |
| SAFE-01 | Anonymous page/API/media/document/cache paths reject drafts, private serial and originals; only allowed derivatives pass. | authorization/integration/manual target | `node --test tests/machine-access.test.mjs tests/machine-documents.test.mjs tests/machine-media.test.mjs` | ✅ Existing local coverage; add missing route/cache cases if gaps appear |
| SAFE-02 | Forged input/upload types/size and role permissions are denied server-side. | unit/integration | `node --test tests/phase5-enquiries.test.mjs tests/machine-access.test.mjs tests/machine-documents.test.mjs tests/machine-media.test.mjs` | ✅ Existing coverage; no claim of full adversarial review |
| SAFE-03 | Anonymous staging page/API access is denied, crawler output stays noindex, test IDs/data/tags are separate. | unit + target manual | `node --test tests/phase6-seo.test.mjs tests/phase7-staging.test.mjs` | ❌ target-specific test/manual gate |
| SAFE-04 | Runbook covers database, structured content, objects and protected configuration. | document review/manual | — | ❌ create procedure |
| SAFE-05 | Restore representative machine plus public derivative/private original safely and verify reads/access. | disposable integration/manual | Approved provider-specific command only; no exact target command set now | ❌ blocked on target/operator |
| SAFE-06 | Published policy/terms and forms match actual provider, recipient, logs, consent, embeds and retention. | human review | — | ❌ designated reviewer + owner facts required |
| SAFE-07 | Secret scan/review reports no secrets and `.env.example` stays names-only. | repository scan | `git diff --check` plus approved secret scan | ✅ ignore/template foundation exists; add phase check |

### Sampling Rate

- **Per task commit:** Focused built-in Node tests for changed event/access/recovery helper.
- **Per wave merge:** Relevant grouped suite; full `node --test tests/*.test.mjs` when sandbox allows.
- **Phase gate:** Owner-approved privacy/tag review, staging anonymous-denial check, protected-target backup/restore rehearsal, and secret scan before launch claims.

### Wave 0 Gaps

- [ ] `tests/phase7-analytics.test.mjs` — event allowlist, runtime configuration, success-only, PII sentinel, duplicate and consent checks.
- [ ] `tests/phase7-staging.test.mjs` — app access/noindex/cache assertions; deployed-host checks are still manual.
- [ ] `docs/operations/backup-and-restore.md` — targets, responsibilities, retention, credential recovery, object/DB consistency and rehearsal evidence. [ASSUMED: proposed location]
- [ ] Account/consent/privacy review and disposable restore target must be resolved before service-level verification; these cannot be solved by adding local tests.

## Security Domain

Security enforcement is enabled with configured ASVS level 1. [VERIFIED: `.planning/config.json:48-49` — quotes: `"security_enforcement": true`, `"security_asvs_level": 1`]

### Applicable ASVS Categories

Use current OWASP ASVS 5.0 category names rather than the older V2–V6 numbering sometimes shown by legacy summaries. OWASP lists categories for encoding/sanitization, input/business validation, web frontend, APIs, file handling, authentication, session management, authorization, cryptography, secure communication, configuration, data protection, and security logging/error handling. [CITED: https://cornucopia.owasp.org/taxonomy/asvs-5.0]

| ASVS 5.0 Category | Applies | Standard Control |
|---|---|---|
| 01 Encoding and Sanitization | yes | Keep CMS/form content escaped in output; analytics allowlist prevents unsafe content entering tag payloads. |
| 02 Validation and Business Logic | yes | Existing server-side enquiry bounds/field validation and upload validation remain authoritative. |
| 03 Web Frontend Security | yes | Consent-aware tag loading, safe public runtime configuration and no PII in browser events. |
| 04 API and Web Service | yes | Test Payload REST, GraphQL, server actions, preview and media/document routes under anonymous and staff sessions. |
| 05 File Handling | yes | Preserve validated MIME/size, private originals and separate reviewed derivatives; deny direct original reads. |
| 06 Authentication | yes | Keep Payload auth and the approved two initial staff accounts; no new auth system. |
| 07 Session Management | yes | Test cookies/session behavior on the actual HTTPS staging target; current local configuration is not proof of host TLS. |
| 08 Authorization | yes | Preserve owner/admin permissions, public projections and document publication permission at every entry point. |
| 11 Cryptography | yes | Keep secrets in environment/service config and use provider-supported encryption; do not add custom cryptography. |
| 12 Secure Communication | yes | Validate HTTPS/mail/database/storage transport on chosen target; live service state is unverified. |
| 13 Configuration | yes | Separate stage/live IDs and credentials; fail closed if tag/index flags are absent or malformed. |
| 14 Data Protection | yes | Minimize analytics, define actual retention and recipients, keep original JPJ docs private, approve public copies explicitly. |
| 16 Security Logging and Error Handling | yes | Keep analytics free of form/secret values; preserve controlled errors and ensure logs/monitoring do not store raw enquiry bodies. |

### Known Threat Patterns for Next.js / Payload / GCS

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Draft/private collection read via API or server-side Local API override | Information disclosure / elevation | Keep Payload read/field rules and public allowlist; explicitly review every `overrideAccess: true`; test anonymous API endpoints. |
| Original file URL or CDN cache bypasses app gate | Information disclosure | Keep private GCS ACL/IAM, no-store for protected responses, test direct object and edge cache requests. |
| Malicious/oversized uploads and untrusted form fields | Tampering / denial of service | Preserve server validation, MIME/size limits, upload route auth and server-derived machine context; exercise hostile input. |
| Stored XSS or PII forwarded through tags | Tampering / information disclosure | Framework-safe output and constrained event mapping; strip all form/URL payloads before analytics. |
| Staging publicly reachable despite robots/noindex | Information disclosure | Host/app authentication plus non-indexing; robots is supplementary only. |
| Compromised or careless GTM publisher adds data-sharing tag | Information disclosure | Least-privilege Google account roles, change review, consent controls, periodic tag inventory and synthetic network verification. |
| Backup account has broad read/delete privileges or recovery leak | Elevation / denial of service | Separate least-privilege backup/restore identities, encrypt/protect archives, test private-asset access after restore; owner approves operator and target. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | A consent banner/CMP and actual default behavior can be added or configured within the owner-approved policy. | Standard Stack / Architecture | Measurement may remain legally or operationally blocked until reviewed. |
| A2 | Best-effort client-side duplicate suppression after one accepted form state is sufficient for V1. | Pattern 2 / Pitfalls | Network retries or repeated legitimate submissions can still count more than once. |
| A3 | An aggregate public machine reference is acceptable as an analytics dimension. | Pattern 1 | Could violate HGR policy or expose identifiers the owner considers internal. |
| A4 | Existing provider accounts can expose staging and production-specific tag configuration without a new paid product. | Environment Availability | New account/resource/cost decision would be required. |
| A5 | Provider-native recovery can cover media objects and protected deployment configuration in the selected target. | Recovery | Backups may be incomplete or configuration may be unrecoverable. |
| A6 | A new permanent enquiry record is outside current V1 because CRM is explicitly deferred. | Pattern 2 / Open Questions | Strong request-idempotency may require a new collection or durable submission ledger and a changed workflow. |

## Open Questions (RESOLVED)

1. **Tracking and consent:** Which Google accounts/tags are authorized, and does HGR want basic mode (block all Google tags until choice) or advanced mode (denied defaults with cookieless pings)? Google documents materially different behavior; the choice cannot be inferred from current code. [CITED: https://developers.google.com/tag-platform/security/concepts/consent-mode; `.planning/ROADMAP.md:179`]
2. **Enquiry recipient and retention:** Who receives each form, which email provider/hosting logs are involved, what retention/deletion practice is followed, and who owns access/privacy requests? These are explicit owner gates and must feed the legal review. [VERIFIED: `.planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md:27-53`; `.planning/ROADMAP.md:179`]
3. **Privacy reviewer:** Who is qualified/authorized to review final Privacy Policy, Terms and third-party disclosures against current HGR practices and applicable Malaysian requirements? Official Malaysian PDP materials publish the Act/amendments and notice guidance; research does not determine HGR’s legal obligations or approve wording. [CITED: https://www.pdp.gov.my/ppdpv1/en/akta/pdp-act-2010-en/; https://www.pdp.gov.my/ppdpv1/akta/akta-pdppindaan-2024/; https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/01/A-Quick-Guide-to-PRIVACY-NOTICE-1.pdf]
4. **Backup operator/target/retention:** Which already-existing PostgreSQL and object-store target may hold backups, who can read/restore them, how often to back up, and how long to keep them? These affect storage/data model operations and may incur cost; do not choose or provision implicitly. [VERIFIED: `.planning/ROADMAP.md:179`; CITED: https://docs.cloud.google.com/storage/docs/soft-delete]
5. **Duplicate-counting level — RESOLVED for local implementation:** Use best-effort suppression for one accepted state transition; do not add a durable submission key, collection or retry workflow. Exactly-once counting across refresh/network retry is explicitly outside this V1 pass because it would need a durable identity and may create CRM-like data-model/workflow scope. If HGR later requires that guarantee, stop and ask before changing the data model. [VERIFIED: `AGENTS.md`, “Engineering Principles”; `src/app/(site)/contact/actions.ts:21-69`]
6. **Mudah tagging — RESOLVED for local implementation:** Preserve ANLY-04's existing “where practical and permitted” limit. Support optional manually tagged HGR links only through a small allowlist (for example, the `mudah` source category); do not assume every listing permits tags, make tags required, or add publishing/synchronization. Unknown campaign values are omitted. [VERIFIED: `AGENTS.md`, “Mudah”; `.planning/REQUIREMENTS.md:139`]

The remaining account identifiers, consent policy/category mapping and revocation behavior, recipients/providers/logs/retention, privacy reviewer, and backup target/operator are execution gates in Plans 07-03 and 07-04. They do not need to be guessed to implement disabled local scaffolding or write a portable runbook. [VERIFIED: `.planning/ROADMAP.md:179`; Plans 07-03 and 07-04]

## State of the Art

| Old / unsafe approach | Current approach | When Changed | Impact |
|---|---|---|---|
| Load browser-visible Next config with `NEXT_PUBLIC_` and expect host runtime changes | `NEXT_PUBLIC_` values are build-inlined; use server runtime configuration when the value must vary for a promoted build | Current Next.js docs | Do not bake a staging/prod analytics ID into a shared bundle unless rebuilding separately is intentional. [CITED: https://nextjs.org/docs/app/guides/self-hosting] |
| Use hand-written arbitrary Analytics labels | Use GA4 recommended events and documented traffic dimensions | Current GA4 guidance | `generate_lead` models a request/information form, while click intent remains a different event. [CITED: https://support.google.com/analytics/answer/9267735; https://support.google.com/analytics/answer/15612152?hl=en] |
| Treat robots as privacy/security | Protect staging with authentication and enforce app/API/media authorization independently | Current Google Search guidance | Hidden or disallowed content may still be requested directly; crawler settings do not restrict the requester. [CITED: https://developers.google.com/search/docs/crawling-indexing/robots/intro] |
| Rely on one database backup for media recovery | Recover DB and external objects through separate procedures and test their relationship | Current PostgreSQL/GCS documentation | A DB archive alone is not a full app recovery plan. [CITED: PostgreSQL docs; https://docs.cloud.google.com/storage/docs/soft-delete] |

**Deprecated/outdated:** Do not follow older Payload Local API guidance that assumes every current API call skips access control by default without checking the installed version and official docs. Current Payload documentation and the existing in-repo code should govern implementation; explicit `overrideAccess` review remains prudent. [CITED: https://payloadcms.com/docs/local-api/overview; https://payloadcms.com/docs/access-control/overview]

## Sources

### Primary (official docs / source of truth)

- GA4 recommended events — `generate_lead` semantics: https://support.google.com/analytics/answer/9267735
- GTM data-layer event pattern: https://developers.google.com/tag-platform/tag-manager/datalayer
- Google Analytics PII prevention: https://support.google.com/analytics/answer/6366371?hl=en
- Google Consent Mode overview and setup: https://developers.google.com/tag-platform/security/concepts/consent-mode; https://developers.google.com/tag-platform/security/guides/consent
- GA4 traffic source/UTM dimensions: https://support.google.com/analytics/answer/15612152?hl=en; https://support.google.com/analytics/answer/10917952?hl=en-uk
- Next.js runtime and public environment variables: https://nextjs.org/docs/app/guides/self-hosting; https://nextjs.org/docs/pages/guides/environment-variables
- Payload access control: https://payloadcms.com/docs/access-control/overview; https://payloadcms.com/docs/local-api/access-control
- PostgreSQL logical backup and restore: https://www.postgresql.org/docs/current/app-pgdump.html; https://www.postgresql.org/docs/current/app-pgrestore.html
- Google Cloud Storage public access and recovery: https://docs.cloud.google.com/storage/docs/public-access-prevention; https://docs.cloud.google.com/storage/docs/soft-delete; https://docs.cloud.google.com/storage/docs/object-versioning
- OWASP ASVS 5.0 taxonomy: https://cornucopia.owasp.org/taxonomy/asvs-5.0
- Malaysian Personal Data Protection Commissioner, Act/amendment/privacy notice material: https://www.pdp.gov.my/ppdpv1/en/akta/pdp-act-2010-en/; https://www.pdp.gov.my/ppdpv1/akta/akta-pdppindaan-2024/; https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/01/A-Quick-Guide-to-PRIVACY-NOTICE-1.pdf

### In-repository sources

- `AGENTS.md`, `MODEL-ROUTING.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/config.json`
- `.planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md`; `.planning/phases/05-enquiries-and-supporting-pages/05-RESEARCH.md`
- `.planning/phases/03-photography-media-processing-and-jpj-protection/03-RESEARCH.md`; `.planning/phases/06-accessible-design-and-inventory-seo/06-RESEARCH.md`
- `src/payload.config.ts`; `src/collections/{Machines,MachineMedia,MachineDocuments,Users,Roles}.ts`; `src/lib/{auth/permissions,machines/access,machines/publicQueries,machines/publicProjection,enquiries/submit,email/enquiryAdapter}.ts`; `src/app/(site)/contact/actions.ts`; `src/app/(payload)/api/[...slug]/route.ts`; `src/app/api/machine-documents/[action]/route.ts`
- `package.json`, `.env.example`, `.gitignore`, and existing `tests/` inventory

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH for installed packages/current repository configuration; MEDIUM for official service guidance and Google account availability, which is unverified.
- Architecture: HIGH for existing app authorization/dataflow patterns; MEDIUM for event/consent/recovery recommendations pending owner decisions and target verification.
- Pitfalls: MEDIUM for official vendor/standards findings because they were fetched through the web-search provider; MEDIUM for staging/backup outcomes because no live target was inspected.

**Research date:** 2026-10-02  
**Valid until:** 2026-11-01 for stable app patterns; recheck vendor docs and owner/account/consent/backup decisions before implementation.
