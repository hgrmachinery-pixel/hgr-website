# Phase 3: Photography, media processing and JPJ protection - Context

**Gathered:** 2026-10-01  
**Status:** Ready for planning

<domain>
## Phase Boundary

Give HGR staff a practical category-based machine photo workflow with featured-image selection, ordering, preview and factual alt text; preserve unwatermarked originals and generate responsive, consistently named, configurable public derivatives; and manage JPJ/ownership document originals and separately redacted copies with strict staff-only access and human approval before public display. Protect readable private serials in both structured data and photographs. Keep code and service configuration portable, and use only synthetic local data until approved disposable database/storage services are available.

</domain>

<decisions>
## Implementation Decisions

These are conservative planning defaults for the user's instruction to continue autonomously. They are not approval to provision external services or publish real documents. Operational facts that remain unknown are explicit plan checkpoints.

### Photo storage and public delivery
- **D-01:** Keep unwatermarked source photos staff-only and create separate public derivative records. Public file delivery must check that the derivative belongs to the physical machine, is ready and approved for use, and is referenced by a Published, non-archived machine. Never make a master publicly readable merely to deliver its derivatives. This follows approved private-master/public-derivative requirements and Sol's Phase 3 privacy review.
- **D-02:** Preserve all 12 existing photography categories. A machine may publish with only its required suitable featured/general image; no other category is mandatory. Reordering changes gallery order without changing a photo's stable identity or generated storage name.
- **D-03:** Retain originals and make watermark treatment centrally configurable for No Watermark, HGR Logo, and HGR Logo + domain, including placement, size, opacity and margin. Do not invent or generate HGR artwork; keep watermark artwork/default settings unapproved until the owner supplies or approves them.
- **D-04:** Treat current upload caps and real batch performance as unverified. Keep limits configurable; do not impose a 200 KB owner-upload target. Use representative synthetic batches and recoverable per-file errors in local validation; record actual size limits, retention/regeneration policy and storage performance for confirmation with approved services.

### JPJ and serial privacy
- **D-05:** Keep document originals, private previews and pending redacted copies staff-only. Store a redacted copy separately and do not expose it until a human reviewer has approved that specific file revision and explicit owner approval for public display is recorded. Replacing the copy invalidates approval. Keep document availability approval separate from file-display approval. A human review must consider visible content and embedded text/metadata; automated redaction alone is insufficient.
- **D-06:** Do not grant approval authority to a role by assumption. Implement server-enforced approval state and an authorized human review action, with the approver role/person recorded as TO CONFIRM before real documents or services are used. Keep document display disabled by default.
- **D-07:** Keep private serial values out of public projections unless independently enabled. Require human review of any image where a plate may be readable, across all photo categories. A photo replacement or serial-visibility change must invalidate affected review state.

### the agent's Discretion
- Select the simplest Payload/Next.js implementation that satisfies these boundaries, existing portability requirements and current approved dependency tuple.
- Prefer manual upload of an already redacted derivative for this phase; do not introduce AI redaction or a new paid service.
- Keep unknown artwork, upload-limit, retention, approver and document-format details as explicit TO CONFIRM items, with safe-deny behavior until resolved.

</decisions>

<canonical_refs>
## Canonical References

### Project rules and approved scope
- `AGENTS.md` — owner approval, privacy, storage, photo, document, engineering and QA boundaries.
- `MODEL-ROUTING.md` — Luna default and Sol escalation requirements.
- `.planning/PROJECT.md` — approved architecture, privacy constraints and open inputs by timing.
- `.planning/REQUIREMENTS.md` — ADMN-06, ADMN-09, IMAG-01 through IMAG-09, and JPJD-01 through JPJD-07.
- `.planning/ROADMAP.md` — Phase 3 goal, dependencies, success criteria and TO CONFIRM items.
- `docs/planning-analysis/RECONCILIATION-REPORT.md` — approved reconciliation of historical planning sources.

### Prior phase decisions and patterns
- `.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-CONTEXT.md` — portable foundation and external-service approval boundaries.
- `.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-04-SUMMARY.md` — actual host findings and pending database/storage verification.
- `.planning/phases/02-machine-model-and-payload-owner-workflow/02-CONTEXT.md` — stable machine identities, required publish fields and owner workflow decisions.
- `.planning/phases/02-machine-model-and-payload-owner-workflow/02-PATTERNS.md` — Payload collection, access, migration and testing patterns.
- `.planning/phases/02-machine-model-and-payload-owner-workflow/02-VERIFICATION.md` — local evidence and deferred live checks.

### Existing implementation points
- `src/collections/MachineMedia.ts` — current staff-only machine image uploads and generated-name hook.
- `src/collections/Machines.ts` — machine identity, publication checks, featured image and gallery relationships.
- `src/collections/Users.ts` — owner and website-administrator roles; do not expand authority without review.
- `src/payload.config.ts` — PostgreSQL, private GCS adapter, shared upload limit and explicit migrations.
- `src/lib/machines/access.ts` — staff and public access helpers.
- `src/lib/machines/media.ts` — current machine image filename helper.
- `docs/development/dependency-review.md` — approved dependency versions and runtime constraints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/collections/MachineMedia.ts` is already staff-only, stores outside the app host, and has a generated filename hook; it must remain the private master boundary.
- `src/collections/Machines.ts` provides the permanent HGR identity and published/archive state needed to authorize public derivatives.
- `src/lib/machines/access.ts` provides reusable staff and public access helpers.
- `src/payload.config.ts` already configures Sharp, private GCS storage and explicit PostgreSQL migrations.

### Established Patterns
- Keep Payload access checks enabled for media and use explicit server-side allow rules. Public page filtering alone does not protect direct file/API requests.
- Keep schema changes in generated, reviewed migrations; database push is disabled.
- Use synthetic data and the explicit disposable-service boundary. PostgreSQL and compatible storage have not been provided or provisioned.

### Integration Points
- Machine featured/gallery relationships and publication validation must move from source-media eligibility to ready, machine-owned public derivative eligibility.
- Public API/file routes, machine page projections, admin document states and storage access must all enforce the same publication/approval rules.
- Any route or shared-cache behavior added for documents must deny private originals and pending copies at direct URL, API, optimizer and cache layers.

</code_context>

<specifics>
## Specific Ideas

- Keep the 12 named photography categories and present them as one ordered public gallery, not 12 separate public page sections.
- Use HGR machine identity + category + stable sequence for public derivative filenames; never trust the uploader's filename.
- Show ordinary visitors only responsive public derivatives, never multi-megabyte source originals.
- Unknown operator preferences remain TO CONFIRM; no real JPJ/ownership files or public derivative are to be used during local work.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 03-photography-media-processing-and-jpj-protection*  
*Context gathered: 2026-10-01*
