# HGR source snapshot import report

Created: 2026-09-27T03:10:17.338Z

## Scope and verification

- Copied 31 Markdown files (388529 bytes), retaining all source-relative paths.
- All 31 destination SHA-256 hashes match the source bytes; the sources were re-read and matched after copying.
- No original vault files were written, moved or deleted.
- No application scaffold, GSD requirements, roadmap, research, or ingestion was generated/run.
- No source files were rewritten or redacted. No credential indicators were found by the screening performed.
- No standalone private customer/machinery documents were found in the enumerated loose files. ZIP contents were not inspected or imported.

## Exact copied inventory

See SOURCE-INDEX.md for all 31 paths and SNAPSHOT-AUDIT.json for verification details.

## Exact exclusions

- `Logo/hgr tight crop canvas.png` — Brand image; outside this Markdown planning snapshot and not linked as an attachment in the documents
- `Logo/hgr transparant canvas.png` — Brand image; outside this Markdown planning snapshot and not linked as an attachment in the documents
- `hgr website/.obsidian/app.json` — Obsidian settings; explicitly excluded
- `hgr website/.obsidian/appearance.json` — Obsidian settings; explicitly excluded
- `hgr website/.obsidian/core-plugins.json` — Obsidian settings; explicitly excluded
- `hgr website/.obsidian/graph.json` — Obsidian settings; explicitly excluded
- `hgr website/.obsidian/workspace.json` — Obsidian settings; explicitly excluded
- `hgr website/HGR-Planning-Documentation-FINAL-AUDIT.zip` — Archive; excluded to avoid importing duplicate or unreviewed contents
- `hgr website/HGR-Planning-Documentation.zip` — Archive; excluded to avoid importing duplicate or unreviewed contents

## Missing and unresolved references

- Parsed wiki-link occurrences: 122.
- Unresolved local-reference occurrences: 0.
- None in the parsed wiki links and local Markdown links.
- External websites were not fetched or checked for availability.
- No explicit local image/attachment links were found in the parsed Markdown. The excluded logos remain in the original folder.
- Asset requirements describe future content needs; this snapshot is not an audit that all launch assets exist.

## Source authority and known differences

Current user instructions and repository AGENTS.md govern the future interpretation of these preserved sources. Do not let ADR classification automatically override those instructions.

1. `hgr website/07 - Decisions/Technical Architecture Decisions.md`, Purpose and T01–T05, still says architecture is unfinalised. `Decision Log.md` D27 also records it as unfinalised. Current instructions approve Next.js + Payload CMS + PostgreSQL + external object storage, with initial application hosting tests on Exabytes and portability. Preserve the old text as historical source; do not reopen the approved stack selection.
2. `hgr website/07 - Decisions/Decision Log.md`, D52, and `Technical Architecture Decisions.md`, DECIDED, describe photo categorisation as optional. Current instructions require structured categories, while not every category must be mandatory. Carry the current requirement forward; retain the original wording here.
3. Current instructions explicitly require private JPJ originals and separately reviewed/approved public redacted derivatives. Carry these instructions alongside the vault during later ingestion; document presence/completeness has not been established by this snapshot audit.

These are observed differences, not a complete cross-document requirements/conflict analysis. No missing requirement has been inferred.

## Existing unresolved markers

The following source files contain TO CONFIRM, TO BE DECIDED or [DEFERRED] markers. Counts are text occurrences, not counts of distinct open decisions; some may be superseded by current instructions.

- `hgr website/00 - Project/Business Requirements.md`: 4 occurrences.
- `hgr website/00 - Project/HGR Project.md`: 5 occurrences.
- `hgr website/00 - Project/Project Roadmap.md`: 1 occurrences.
- `hgr website/02 - Website Specification/About.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Admin System.md`: 3 occurrences.
- `hgr website/02 - Website Specification/Contact.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Homepage.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Individual Machine.md`: 1 occurrences.
- `hgr website/02 - Website Specification/Lubricants.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Machinery Services.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Rental.md`: 2 occurrences.
- `hgr website/02 - Website Specification/Sitemap.md`: 3 occurrences.
- `hgr website/02 - Website Specification/Used Excavators.md`: 1 occurrences.
- `hgr website/03 - Content/Company Information.md`: 86 occurrences.
- `hgr website/03 - Content/Content Requirements.md`: 4 occurrences.
- `hgr website/03 - Content/Legal Content.md`: 15 occurrences.
- `hgr website/03 - Content/Website Copy.md`: 22 occurrences.
- `hgr website/04 - SEO/Keyword Strategy.md`: 1 occurrences.
- `hgr website/04 - SEO/On-Page SEO.md`: 5 occurrences.
- `hgr website/04 - SEO/SEO Strategy.md`: 7 occurrences.
- `hgr website/04 - SEO/Technical & Local SEO.md`: 12 occurrences.
- `hgr website/05 - Assets/Asset Requirements.md`: 21 occurrences.
- `hgr website/05 - Assets/Brand Assets.md`: 8 occurrences.
- `hgr website/05 - Assets/Photography & Video.md`: 5 occurrences.
- `hgr website/06 - References/Technical References.md`: 18 occurrences.
- `hgr website/06 - References/Website References.md`: 7 occurrences.
- `hgr website/07 - Decisions/Decision Log.md`: 6 occurrences.
- `hgr website/07 - Decisions/Deferred & Future Decisions.md`: 17 occurrences.
- `hgr website/07 - Decisions/Technical Architecture Decisions.md`: 27 occurrences.

## Prepared import

`IMPORT-MANIFEST.yaml` lists all 31 source documents with repository-relative paths and provisional ADR/PRD/SPEC/DOC classifications. No numerical precedence overrides are assigned. It is prepared for gsd-ingest-docs but has not been executed. Review source conflicts against current instructions before any requirements or roadmap generation.
