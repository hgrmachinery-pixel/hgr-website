---
gsd_state_version: "1.0"
milestone: V1
milestone_name: versus deferred scope
current_phase: 6
current_phase_name: Accessible design and inventory SEO
status: Phase 5 implementation complete; legal/contact/mail and infrastructure verification deferred to deployment
stopped_at: Phase 5 checkpoint; Phase 6 planning authorized
last_updated: "2026-10-02T10:45:00.000Z"
last_activity: 2026-10-02
last_activity_desc: Phase 5 checkpoint committed. Phase 6 UI contract and implementation planning started; deferred Phase 5 legal/contact/mail configuration remains off.
state_head: fadd88226e0f3de3a54c6acfc9d2845b999e918d
progress:
  total_phases: 8
  completed_phases: 0
  total_plans: 13
  completed_plans: 12
---

Total Phases: 5

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-30)

**Core value:** HGR can independently publish accurate used-excavator listings that lead customers to a direct enquiry and an arranged viewing.
**Current focus:** Phase 6 accessible design and inventory SEO. PostgreSQL, GCS, media delivery, browser verification and deployment checks are intentionally deferred to the deployment verification milestone.

## Current Position

Phase: 6 (Accessible design and inventory SEO) — PLANNING
Plan: UI contract and executable plan in progress
Total Plans in Phase: 1
Status: Phase 5 implementation checkpoint complete; Phase 6 planning active
Last Activity: 2026-10-02 — Phase 5 checkpoint committed; Phase 6 planning started
Last Activity Description: Implementation checkpoint commit 831c052 contains completed Phase 4/5 work. Legal/contact/mail configuration remains deferred. Phase 6 is active.

Progress: Phase 1–4 external verification remains pending. Phase 5 implementation is complete; legal publication, SMTP setup, phone/WhatsApp numbers and infrastructure/browser/deployment acceptance remain deferred configuration work. Phase 6 is being planned and will proceed to implementation.

## Performance Metrics

- Plans with completed permitted work: 10
- Execution: Phase 3 Plan 03-02 focused authorization/document/photo tests (31) pass; typecheck, synthetic Webpack production build and diff check pass. Database/GCS and migration checks remain pending; the full historical suite still has sandbox `tsx` child-process failures (`uv_os_get_passwd returned ENOMEM`).

**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 13min | 3 tasks | 10 files |
| Phase 01 P02 | 18min | 2 tasks | 21 files |
| Phase 01 P03 | 6min | 2 tasks | 2 files |
| Phase 01 P04 | 14min | 3 tasks | 9 files |
| Phase 04 P01 | 1 session | 5 tasks | public routes, query helpers, UI and validation artifacts |
| Phase 02 P01 | 1 session | 2 tasks | 5 files |
| Phase 02 P02 | 1 session | 3 tasks | 8 files |
| Phase 02 P03 | 1 session | 3 tasks | 10 files |
| Phase 03 P01 | 1 session | 3 tasks | 17 files |
| Phase 03 P02 | 1 session | 3 tasks | 24 files |
| Phase 3 P3 | 25min | 2 tasks | 13 files |
| Phase 3 P4 | 25min | 1 tasks | 10 files |
| Phase 05 P01 | 1 session | 3 tasks | 13 files |

## Accumulated Context

### Decisions

Current decisions are recorded in PROJECT.md. Read the approved [reconciliation](../docs/planning-analysis/RECONCILIATION-REPORT.md) before planning; the older Obsidian technology-selection and optional-photo-category text is superseded.

- 2026-09-30: Portability means moving to a compatible application host without rewrite/material redesign; destination rebuild/redeployment is allowed.
- 2026-09-30: Watermarks, structured photos, protected JPJ originals/approved public redactions and all retained V1 admin/lead/operations scope remain active.
- 2026-09-30: Yard-location facts are verified before public launch; accessible brand-button treatment is handled during design.
- [Phase 01]: Approved exact package tuple locked; compatible PG helper overrides and approved-version deduplication retained.
- [Phase 01]: Retain explicit generated schema migration and separate guarded disposable smoke settings; database/external-storage integration remains pending without local services.
- [Phase 01]: Document same-source rebuild with separate local and destination proof; local smoke stays loopback-only and mail names stay reserved.
- [Phase 02]: HGR machine references use a permanent PostgreSQL sequence; route history remains bound to its physical machine.
- [Phase 02]: Official Payload Lexical `@payloadcms/richtext-lexical@3.90.2` is approved and aligned with the installed Payload packages.
- [Phase 02]: A unique server-assigned staff role limits setup to one owner and one website administrator; both use Payload auth.
- [Phase 02]: Short-lived preview tokens are machine-bound, but preview reads still require an authenticated staff session.
- [Phase 03]: Approve Public Documents is a persisted named permission; Owner initially receives it and Administrators do not.
- [Phase 03]: Photo approvals bind to the exact derivative and current serial-visibility policy revision; all policy changes invalidate machine photo reviews.
- [Phase 3]: Asset event writes share the protected transition transaction; database trigger and live service verification remain in Plan 03-04.
- [Phase 3]: Current Approve Public Documents permission gates one Publish action; authenticated Preview streams the exact latest redacted revision privately with no-store headers.
- [Phase 3]: Roles and staff accounts use fresh persisted Owner authority independent of Approve Public Documents; transaction mutations serialize Owner bootstrap and retention.
- [Phase 3]: Phase 3 migration rejects unknown legacy roles and existing photos that require invented identifiers, digests, reviews or actors; rollback refuses populated/nonrepresentable history under locks.
- [Phase 3]: Keep the migration unapplied and public media delivery denied until exact approved disposable PostgreSQL/GCS targets pass live checks.

### Pending Todos

- Plan 01-01 package checkpoint was explicitly approved. Plan 01-02 implementation and Plan 01-03 setup/redeployment documents are complete. Plan 01-04 report is complete and summarized. Owner reports Exabytes Business Hosting eBiz 12 Plus with Node 22.23.3, npm, production mode, `/httpdocs` app root, configurable startup file, custom environment variables and File Manager. Official Next.js/Payload/Sharp requirements and audited lockfile engines accept Node 22.23.3; project engines now allow `>=22.23.3 <23 || >=24 <25`. Node 22 build/runtime and Exabytes platform/Sharp binary compatibility remain untested. Owner approved the exact synthetic test but confirms no Exabytes PostgreSQL or object-storage services exist; do not provision resources. No isolated app slot is confirmed. `npm run smoke:foundation` exited at its disposable-local-service guard; local PostgreSQL/GCS services are unavailable, so integration remains pending. Owner confirms no second host. PORT-04/05/06 and Phase 1 remain incomplete. Owner has now authorized local work in subsequent phases while infrastructure verification remains pending.
- Exact installed tuple: next 16.3.7; react/react-dom 19.3.0; payload/@payloadcms/next/@payloadcms/db-postgres/@payloadcms/storage-gcs 3.90.2; sharp 0.35.5; typescript 5.9.3; @types/node 24.19.0; @types/react/@types/react-dom 19.3.0; graphql 16.14.2 (required Payload peer).
- Review and full metadata retained outside application source in the local temporary directory: `C:/Users/thamk/AppData/Local/Temp/hgr-phase-1-package-review-2026-09-30.md` and companion `hgr-phase-1-package-metadata-2026-09-30.json`. Re-query exact metadata if those temporary files are no longer available.
- Clean npm ci and TypeScript checks passed. All 376 deduplicated installed Windows instances use approved name/version pairs. See docs/development/dependency-review.md. The resumed approved local runtime passed the production build and all three foundation configuration/access/Sharp tests plus eight smoke-boundary tests. Historical native-policy failures did not recur; no OS policy was changed.
- Phase-specific TO CONFIRM items remain recorded in ROADMAP.md.
- Phase 2 package approval is recorded; no additional direct package versions changed. The lexical editor adds 103 supporting packages, including Lexical, React integration, and Markdown/HTML conversion support.

### Blockers/Concerns

- No unresolved owner business decision blocks the start of local development.
- The package checkpoint is cleared; no additional direct packages were installed.
- Docker is absent from PATH; no disposable local PostgreSQL/GCS-compatible endpoints have been demonstrated. Later integration verification remains pending until services are available.
- Actual Exabytes workload has not been tested. The exact synthetic test is approved but cannot proceed without existing isolated PostgreSQL and object-storage services; provisioning is not authorized. Do not use the reported `/httpdocs` production-mode root without confirmed isolation. Node 22.23.3 meets documented package runtime minimums, but actual Node 22 build/start and target platform remain unverified.
- No PostgreSQL/storage/email service or production access has been confirmed or provisioned by these planning files.
- Plan 01-02 integration prerequisite: confirmed disposable loopback PostgreSQL and compatible GCS endpoints are unavailable. Generated migration remains unapplied. Restricted-sandbox Node userInfo is unavailable; official generators and build succeeded with approved local escalation.
- Phase 2 has no available approved disposable PostgreSQL service; the reviewed migration was not applied, and live two-account Admin/account-race checks remain pending. Media upload/storage and password-reset delivery also need their later approved services.
- `npm audit` reports 21 dependency findings (2 low, 18 moderate, 1 high), including a high-severity issue in Payload's separate `undici@7.29.0` dependency. Do not downgrade the aligned Payload packages. Track a scoped security review before deployment; no override was applied.
- Full `node --test` remains blocked by the sandbox's `tsx` child-process `uv_os_get_passwd returned ENOMEM` issue in existing foundation config tests; Phase 2-focused and smoke tests pass.
- Phase 3 live migration and Payload/GCS verification remain pending because no exact existing isolated disposable PostgreSQL or GCS-compatible targets are available and approved; migration unapplied, public delivery disabled.

## Deferred Items

BM/Chinese, other machinery divisions, full lubricant catalogue/admin, ecommerce, CRM, accounts, rental booking, automatic Mudah sync, blog and large SEO landing-page systems are outside V1; see REQUIREMENTS.md.

## Session Continuity

Last session: 2026-10-02T01:44:20.340Z
Stopped at: Phase 5 local implementation complete; LEAD-07 and SITE-06 owner inputs pending
Resume file: .planning/phases/05-enquiries-and-supporting-pages/05-01-PLAN.md
