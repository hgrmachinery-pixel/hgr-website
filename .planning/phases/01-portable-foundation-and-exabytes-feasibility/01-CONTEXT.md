# Phase 1: Portable foundation and Exabytes feasibility - Context

**Gathered:** 2026-09-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a reusable local Next.js, Payload CMS, PostgreSQL and external-storage application foundation; prove a minimal end-to-end architecture path using only fake, disposable data; record evidence about what the existing Exabytes account can support without disrupting its current WordPress environment; and document a repeatable portable deployment approach. No paid infrastructure, production changes, or later HGR product features are authorized by this phase context.

The foundation is retained for subsequent phases. Only test records, images and other feasibility data are disposable. If required Exabytes evidence or an already available compatible second host is unavailable, record the precise gap and leave that host-specific verification pending. Host-independent local development can continue.
</domain>

<decisions>
## Implementation Decisions

### Exabytes assessment and safety
- **D-01:** Begin with read-only review of the existing Exabytes account. Do not change the account, its live WordPress site, production hosting, DNS, or other production settings without the owner's explicit approval.
- **D-02:** If Exabytes evidence is missing, do not infer or guess. Record exactly what is missing and ask the owner for the required information or redacted evidence. Keep Exabytes-specific conclusions and decisions pending until adequate evidence is available; local host-independent work may continue.
- **D-03:** Any Exabytes write/change test requires explicit approval for that specific test before it is performed. Purchasing, upgrading, subscribing to, or creating chargeable Exabytes resources requires explicit approval.
- **D-04:** Never request or place passwords, tokens, or other secrets in planning records. Account evidence can be capability descriptions or screenshots with sensitive details removed.

### Representative application test and retained foundation
- **D-05:** Build a minimal end-to-end representative slice covering the approved architecture conceptually: Next.js, Payload CMS, PostgreSQL, external object/media storage, and public application output. The exact implementation is for research and planning to determine.
- **D-06:** Use only clearly fake, disposable test data and images. Do not use real customer data, machinery documentation, JPJ originals, private production documents, or sensitive business data.
- **D-07:** Retain the application structure, framework/CMS foundation, database and storage integration/configuration, environment structure, appropriate development tooling, and deployment approach as the starter foundation for later phases. Remove or keep separate only disposable feasibility records, images, and test data; do not build a throwaway application.

### Portability and external services
- **D-08:** Portability means the same GitHub source can be rebuilt and redeployed on a compatible application host using documented environment configuration, without rewriting or materially redesigning the application. A destination rebuild is expected; a single identical prebuilt artifact across hosts is not required. Keep application-host-specific settings isolated and PostgreSQL and object storage separable from the app host where practical. Avoid Exabytes-specific coupling.
- **D-09:** Perform a real second-host deployment only if a compatible test host/resource is already available. If none is available, document the repeatable process, assumptions, and requirements, and leave deployment verification pending. Ask for explicit approval before creating an account, subscription, paid resource, or potentially chargeable infrastructure. Any portability test uses only fake, disposable data.
- **D-10:** Preserve PostgreSQL; never substitute the existing Exabytes MariaDB. A managed PostgreSQL provider need not be permanently selected before local development unless technically necessary. Google Cloud Storage is the planned object-storage direction, but do not create paid/cloud resources without approval; appropriate local/test substitutes are acceptable if compatible with the approved production architecture.

### Handoff and scope
- **D-11:** Make setup and deployment requirements understandable and maintainable by later Codex/GSD sessions or another developer. Technical deployment and maintenance remain developer/agent tasks. Routine HGR inventory/content management in later phases must be through Payload, without requiring the owner to use VS Code, GitHub, a terminal, or code editing.
- **D-12:** Keep Phase 1 within foundation, representative architecture test, Exabytes feasibility, portability, and documentation. Detailed inventory/admin workflows, photography and JPJ handling, public pages, leads, secondary enquiries, design, SEO, analytics, security/recovery, training and launch belong to their assigned later phases. Do not add CRM, ecommerce, customer accounts, bookings, automatic Mudah sync, blog, or mass SEO-page generation.
- **D-13:** Exabytes unsuitability is a reported compatibility finding, not a reason to redesign the application around Exabytes limitations. Preserve the portable architecture while the owner considers a suitable host.

### the agent's Discretion
- Choose the simplest maintainable local/test implementation that proves the stated architecture path while preserving compatibility with the approved stack and avoiding unapproved paid resources.
- Determine the exact fake record, test image, technical checks, and repeatable deployment instructions during research and planning; keep them clearly separated from real HGR data and production services.
- Treat absent account/host evidence as an explicit pending verification rather than a pass or a guessed result.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/ROADMAP.md` — Phase 1 boundary, success criteria, dependencies, and later phase assignments.
- `.planning/REQUIREMENTS.md` — PORT-01 through PORT-07, approved stack and portability requirements.
- `.planning/PROJECT.md` — Core value, approved architecture, scope, constraints, and timing of unresolved inputs.
- `AGENTS.md` — Repository-wide owner, safety, portability, CMS, privacy, and engineering instructions.

### Approved source reconciliation
- `docs/planning-analysis/RECONCILIATION-REPORT.md` — Approved interpretation of preserved source documents, retained scope, architecture risks, and phase boundaries.

### User-approved Phase 1 clarifications
- The consolidated Phase 1 decisions supplied by the owner during this discussion are captured in full as decisions D-01 through D-13 above; downstream agents should use this context as the durable in-repository record.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None found. No Next.js/Payload application scaffold exists yet.

### Established Patterns
- None found. Application architecture and project conventions will be established in this phase.

### Integration Points
- Create the application foundation in the repository root while preserving the existing `.planning/`, `docs/`, and `.codex/` project material.
- No package manifest, application routes, CMS configuration, database integration, or storage adapter was found during the lightweight codebase scan.

</code_context>

<specifics>
## Specific Ideas

- Representative architecture path: Next.js → Payload CMS → PostgreSQL → external object/media storage → public application output.
- Same GitHub source plus documented environment configuration → rebuild → deploy on a compatible host.
- Local/test substitutes are acceptable where needed, provided they preserve compatibility with the approved production architecture.
- Protect the existing WordPress environment from all initial feasibility assessment changes.
</specifics>

<deferred>
## Deferred Ideas

Detailed HGR inventory and owner workflows, structured photography and responsive processing, protected JPJ originals and approved redactions, public inventory and machine pages, contact/enquiry flows, secondary business pages, visual design, SEO, analytics, privacy/security, backup/recovery, owner training, and launch readiness remain in their assigned roadmap phases. No new deferred ideas were raised.
</deferred>

---

*Phase: 1-portable-foundation-and-exabytes-feasibility*
*Context gathered: 2026-09-30*
