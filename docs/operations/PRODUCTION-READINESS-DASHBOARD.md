# HGR Production Readiness Dashboard

**Status date:** 8 October 2026  
**Overall:** **Not ready for production launch.** The V1 local implementation and handover are complete, but live owner/customer acceptance and multiple production service, content, recovery, and deployment gates remain open. Production launch is not authorized.

**Release verification update (9 October 2026):** `npm run typecheck` and `npm run build` pass on the current checkout (build used a temporary uncommitted preview secret). The full Node suite passes: 139 tests, 0 failures. The R2 storage-prefix migration was added to the source after discovering that automatic schema push is disabled; it has **not** been applied to any database. The Plesk guide now includes the Node.js Toolkit/Passenger version gate and protected first-Owner bootstrap. These local checks do not close the host, R2 bucket/object, database migration, backup/restore, customer acceptance, content, privacy, or launch-approval gates below.

This dashboard reflects recorded project evidence plus the Neon migration and local Admin verification completed on 8 October 2026. “Completed” means there is evidence for that specific item; it does not imply that remaining production services have been tested.

## Overall Readiness

| Area | Status | Summary |
|---|---|---|
| Engineering | **Local release checks passed; integration pending** | Current TypeScript, production build and full automated test suite pass; real destination integrations and migration application remain pending. |
| Infrastructure | **Partially verified** | Neon connected, confirmed empty, and received all six Payload migrations; the local `/admin` returned HTTP 200. Cloudflare R2, SMTP, target hosting, DNS/TLS, and recovery have not passed production acceptance. |
| Content | **Pending** | Production machine inventory and owner-approved business/contact/legal content, imagery, rights, and document review are not evidenced as complete. |
| Acceptance | **Open** | Real HGR owner workflows and customer/device/accessibility checks are marked not run or deferred in the acceptance record. |
| Deployment | **Pending; launch not authorized** | No account-specific Exabytes or other-host deployment proof, production HTTPS/DNS verification, staging protection, rollback rehearsal, or named release authorization is recorded. |

## Engineering

### Completed

- V1 local implementation and owner handover artifacts are recorded complete in the project completion summary.
- Implemented the core inventory model, stable machine identity, Payload staff workflows, structured machine media and private document controls, public inventory pages, enquiries and supporting pages, accessibility/SEO foundations, analytics privacy defaults, security boundaries, and recovery procedures.
- The current Payload configuration uses PostgreSQL and the Cloudflare R2 adapter for `machine-media`, `inventory-media`, and `machine-documents`. Production no longer needs GCS settings; the GCS fixture is guarded for local smoke use.
- TypeScript passed after the R2 migration changes.
- On 8 October, all six committed Payload migrations completed successfully on the verified empty Neon database; subsequent catalog inspection found 30 tables and six migration records.
- Local Payload started and `/admin` returned HTTP 200 against that database.

### Remaining

- Rerun and record the production build for the current R2-configured checkout in an environment where Next.js can access/canonicalize the workspace path. The recent local attempt stopped on a Windows permission error, so it did not establish a build result for that checkout.
- Complete the current focused verification suite; the most recent test launch in the restricted workspace did not return results.
- Complete real-service R2 upload/download, responsive derivative, private-original denial, authorized access, restart-persistence, and recovery checks.
- Close any issues found during owner and browser/device acceptance; do not infer live behavior from implementation tests alone.

## Infrastructure

### Completed

- **Neon PostgreSQL:** The configured Neon target was confirmed as database `hgr_production`; read-only preflight found zero public tables before migration. Six migrations applied in batch 1. A read-only follow-up confirmed these 30 tables:

  `_lubricants_v`, `_lubricants_v_rels`, `_machines_v`, `_machines_v_rels`, `_pages_v`, `_spare_parts_v`, `_spare_parts_v_rels`, `asset_audit_events`, `foundation_fixtures`, `inventory_media`, `lubricants`, `lubricants_rels`, `machine_documents`, `machine_media`, `machines`, `machines_rels`, `pages`, `payload_kv`, `payload_locked_documents`, `payload_locked_documents_rels`, `payload_migrations`, `payload_preferences`, `payload_preferences_rels`, `roles`, `roles_permissions`, `site_contact`, `spare_parts`, `spare_parts_rels`, `users`, `users_sessions`.

- Completed migrations: `20260930_235704_foundation`, `20261001_080057_phase2_machines`, `20261001_171946_phase3_media_documents`, `20261002_005506_phase4_youtube_video`, `20261007_000000_inventory_wave_a`, and `20261007_210000_inventory_media_workflow`.
- The `foundation_fixtures` table exists because it is in the historical foundation migration; the collection is excluded from the production Payload runtime. The table was empty before migration and no content migration was required.

### Remaining

- **Cloudflare R2:** Code/configuration is in place, but a real R2 connection and object operations are not verified. The previous DNS failure was produced from a restricted environment with outbound network disabled and does not prove whether the configured endpoint is correct. Verify from an approved network-capable host; keep the bucket private and preserve application authorization.
- **SMTP:** Confirm Exabytes SMTP settings, sender and recipient, then test successful receipt and failure handling with an approved test mailbox. SMTP settings and live delivery are not verified.
- **Hosting:** Confirm the selected host supports the required Node.js server lifecycle, Sharp, process restarts, build, request limits, storage, and connectivity to Neon/R2. Exabytes feasibility and alternate-host portability are pending.
- **DNS/TLS:** Confirm registrar/provider, live records, HTTPS certificate, and application origin. No DNS change or live routing check is recorded.
- **Backup/recovery:** Set retention, ownership, RPO/RTO and alerting for Neon and R2; complete a representative restore that checks privacy boundaries and matching database/object recovery.
- **Operations:** Verify health monitoring, logs, alerting, error reporting, and incident contacts in the chosen deployment environment.

## Content

### Completed

- CMS models and owner workflows exist for machine inventory, supporting content, contact configuration, and media/document review.
- Public pages and SEO rules are implemented to use published/approved data and fail closed where configuration is absent.

### Remaining

- Add and verify launch inventory: machine facts, prices and visibility, availability, descriptions, photos, and public-release permissions for each physical unit.
- Confirm HGR business claims, yard/viewing information, phone and WhatsApp destinations, email recipient, and contact instructions.
- Review logo and photo usage rights, image descriptions, and every document redaction. Private document originals must remain private; publication requires the required human review and owner permission.
- Review and approve privacy/terms content and actual enquiry data handling/retention before publishing and receiving real leads.
- Confirm the owner can complete routine machine and photo workflows using the CMS without developer tools.

## Acceptance

### Completed

- An owner guide and V1 acceptance record are prepared.
- Existing focused implementation tests, historical TypeScript checks, and earlier synthetic builds are recorded in project verification artifacts. These are local implementation evidence, not production acceptance.
- Current live Neon migration status and local Admin route response are verified as stated above.

### Remaining

- Real HGR owner/admin walkthrough: create/edit, publish, preview, reserve/sell/archive, machine link, photo upload/review/reorder/featured selection, content updates, and recovery from common errors.
- Desktop and mobile browser review, keyboard/accessibility and reduced-motion review, and buyer journey acceptance using approved real content.
- Adversarial states: empty and sold inventory, missing media, invalid/missing facts, long content, slow/failing actions, upload failure, and private/public access boundaries.
- Approve analytics/privacy behavior and verify actual vendor requests only after account ownership, consent, and privacy review. Search Console ownership and sitemap checks also remain pending.
- Record participant, date, outcome, and non-sensitive evidence in the acceptance record. Its owner checks are currently “Not run” and deployment gates “Deferred.”

## Deployment

### Completed

- Portable deployment instructions and environment variable names are documented.
- The Neon production database schema is migrated, and local Payload Admin can load against it.
- GCS is not required for production; R2 is the approved object storage configuration.

### Remaining

- Select and verify the target host; complete approved staging deployment and secure staging access/non-indexing checks.
- Inject production settings through protected environment/secret controls. Presence in local `.env.local` is not evidence that production values are configured correctly.
- Pass the current production build, start and restart checks on the chosen host; verify `/admin`, application routes, database use, R2 operations, SMTP (if enabled), logs and health monitoring.
- Verify production domain, HTTPS, canonical origin, robots/sitemap/indexing flags, and rollback procedure.
- Complete database and object-storage backup/restore acceptance, plus an incident/recovery run-through.
- Assign operational owners and schedules for uptime/errors, enquiry delivery, leads, inventory accuracy, indexing, and performance.
- Record a named release approver and obtain explicit production launch authorization after all gates close. This dashboard does not authorize deployment or launch.

## Evidence References

- [V1 completion summary](../../.planning/V1-COMPLETION-SUMMARY.md)
- [Roadmap](../../.planning/ROADMAP.md)
- [V1 acceptance record](v1-acceptance.md)
- [V1 launch readiness audit](V1-LAUNCH-READINESS-AUDIT.md)
- [Infrastructure vault](INFRASTRUCTURE-VAULT.md)
- [Portable deployment procedure](../deployment/portable-redeploy.md)
- [Backup and restore procedure](backup-and-restore.md)
