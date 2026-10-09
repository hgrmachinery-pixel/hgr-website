# Production Infrastructure Readiness Audit

**Audit date:** 8 October 2026  
**Scope:** Read-only review of repository configuration and recorded deployment/operations evidence for Neon PostgreSQL, Cloudflare R2, Exabytes SMTP, environment variables, secrets, production configuration, health checks, backups, logging and error handling. No application code was changed, no tests were run, and no external services were contacted.  
**Overall result: NOT READY for production infrastructure.** The repository contains useful provider-neutral configuration and some working adapters, but live service configuration, host acceptance and recovery evidence are absent. Estimates below assume required access and already-approved resources; provisioning and provider setup may add time.

## 1. Neon PostgreSQL

- **Current status:** Payload uses its PostgreSQL adapter, validates that `DATABASE_URL` is PostgreSQL, disables automatic database creation and schema push, and points to committed migrations. This is provider-neutral compatibility, not proof of a Neon deployment. Deployment and database acceptance are recorded as pending in [portable redeployment guidance](docs/deployment/portable-redeploy.md) and [V1 acceptance](docs/operations/v1-acceptance.md).
- **Ready / Not Ready:** **Not Ready** for Neon production. Application-side PostgreSQL configuration is present; Neon connection and workload are unverified.
- **Missing items:** Approved Neon project/database and protected connection setting; provider-required TLS/pooling configuration; least-privilege role; migration application evidence; live Payload admin/read/write and persistence checks; backup and restore evidence.
- **Risks:** Connection limits or pooling behavior may differ from local PostgreSQL; migration or network/TLS configuration can prevent startup or writes. A configured URL alone does not establish recoverability.
- **Recommendations:** Use a dedicated least-privilege application role and Neon-recommended connection mode for the chosen runtime. Validate migrations and synthetic admin/data operations on an isolated approved database, then prove persistence and recovery. Do not use Exabytes MariaDB.
- **Estimated implementation effort:** **0.5–1 engineering day** to configure and verify an existing approved database; service setup/access is additional.

## 2. Cloudflare R2

- **Current status:** An S3-compatible adapter can route the `inventory-media` collection to R2 when `INVENTORY_MEDIA_STORAGE=r2`. Other media collections still use GCS, which remains mandatory in the Payload configuration. R2-only configuration is therefore insufficient for the current application. No live object upload/read or access-boundary evidence is recorded.
- **Ready / Not Ready:** **Not Ready.** Partial R2 integration exists; production storage and delivery are unverified.
- **Missing items:** Approved R2 bucket and credentials in protected settings; confirmation of which media classes will use each provider; real upload/read/delete-permission and persistence checks; proof of private originals and approved public-derivative delivery; backup/versioning and recovery procedure for each object class.
- **Risks:** The split GCS/R2 dependency can cause startup failures or incomplete migration if only one provider is configured. Database recovery without matching media objects can leave broken listings. Private documents or originals could be exposed if bucket policy or app delivery is misconfigured.
- **Recommendations:** Decide the intended provider mapping for public machine photos, derivatives, private originals and approved documents. Confirm bucket privacy and least-privilege permissions. Exercise each class with synthetic content and record matching database/object recovery evidence before launch.
- **Estimated implementation effort:** **0.5–1 day** to verify the current split integration; **1–3 days** if approved scope moves remaining GCS classes to R2, plus privacy review.

## 3. Exabytes SMTP

- **Current status:** Website enquiries call an opt-in Nodemailer adapter that accepts SMTP settings from environment variables, supports TLS on ports 465/587, applies timeouts and reports success only when the configured recipient accepts the message. No live Exabytes SMTP settings, mailbox receipt or rejection test is evidenced. Payload account/recovery email is separate and remains on a no-delivery adapter.
- **Ready / Not Ready:** **Not Ready.** Enquiry SMTP implementation exists; Exabytes SMTP service and Payload recovery email are not operationally verified/configured.
- **Missing items:** Approved sender/mailbox, host and credentials through protected settings, enablement flag and recipient; Exabytes outbound SMTP support and account-specific connectivity; synthetic receipt, recipient rejection, timeout and customer-facing failure verification. Decide whether Payload password recovery email is required for launch and configure/test it separately if so.
- **Risks:** Leads may not reach HGR, be filtered or go to the wrong recipient. SMTP acceptance is not proof of inbox delivery. Payload account recovery remains unavailable with the no-delivery adapter.
- **Recommendations:** Verify one synthetic enquiry end-to-end in an isolated environment, including receipt and failure paths, then document the approved operational mailbox. Keep credentials out of reports and Git. Resolve recovery-email needs before depending on self-service account recovery.
- **Estimated implementation effort:** **0.5–1 engineering day** for enquiry SMTP configuration and delivery/failure proof; account recovery integration is additional scoped work.

## 4. Environment variables

- **Current status:** `.env.example` lists names without values; `.gitignore` excludes `.env*` other than the example. Required database, secret and server URL settings are validated during Payload configuration loading. Deployment guidance describes protected environment injection. The local `.env.local` presence was checked without reading secret values; only a recipient setting was populated. This says nothing about production settings.
- **Ready / Not Ready:** **Not Ready** for production configuration; local naming and basic validation are in place.
- **Missing items:** A reviewed production variable inventory covering required and optional values, environment-specific values for build/migration/runtime, secure injection and separation between staging and production, and a safe way to confirm values are set without displaying them. Current R2 secret names are not covered by the existing secret-hygiene test’s listed checks.
- **Risks:** Missing or mismatched configuration can prevent startup or silently disable storage/mail. Build-time and runtime values can diverge; accidental exposure can compromise services.
- **Recommendations:** Maintain a deployment checklist by environment that records variable names and presence only. Add R2 credentials to automated secret-name hygiene coverage and document which settings must be available during build, migration and runtime. Keep secrets out of `NEXT_PUBLIC_*` variables.
- **Estimated implementation effort:** **0.5 day** after deployment access is available; host secret-setting work is additional.

## 5. Secrets management

- **Current status:** Repository ignore rules exclude environment files, private key formats and service credential files. The example file contains names only. Payload secret length is checked. No production secret store, custodian, access review, rotation plan or recovery process is evidenced.
- **Ready / Not Ready:** **Not Ready.** Repository hygiene safeguards exist; operational secrets management is unproven.
- **Missing items:** Protected hosting secret storage, least-privilege Neon/R2/SMTP credentials, named authorized operators, rotation/revocation procedure and secure recovery access. Expanded coverage for R2 keys in the secret-hygiene checks.
- **Risks:** Credentials may be exposed through deployment logs, broad-access settings, screenshots or reports; long-lived credentials may remain usable after staff/access changes.
- **Recommendations:** Store values only in the approved host/provider secret facility or securely mounted files. Limit access by role, never print values during checks, and document who can rotate/revoke them. Confirm backup/recovery references secrets without copying secret values into Git or operations docs.
- **Estimated implementation effort:** **0.5–1 day** for access and rotation procedures once the host and providers are selected; provider configuration is additional.

## 6. Production configuration

- **Current status:** The app has a portable Node start command, explicit PostgreSQL migrations, configurable `SERVER_URL`, and indexing defaults that require production mode plus an explicit enable flag and valid origin. Exabytes feasibility notes contain owner-reported runtime details, but the actual application slot, HTTPS route, process limits, dependency connectivity, Sharp compatibility, authentication/cache controls and workload have not been proven. Code accepts an HTTP `SERVER_URL` even for production.
- **Ready / Not Ready:** **Not Ready.** Runbooks and configuration exist; no host deployment has passed acceptance.
- **Missing items:** Confirmed isolated application slot, HTTPS routing, runtime/process/restart/resource limits, environment injection, PostgreSQL/R2/GCS connectivity, CMS access, staging authentication/cache behavior, migration and restart proof, and a release/rollback procedure. Confirm production origin is HTTPS.
- **Risks:** Host limitations may prevent the Node process or image processing from running reliably. Public indexing, HTTPS, authentication or cache policy may be wrong. Local success can be mistaken for Exabytes acceptance.
- **Recommendations:** Complete the approved synthetic workload only on a verified isolated slot and existing approved services. Record exact source revision, runtime, service connectivity, limits, startup, CMS, upload, restart and cleanup evidence. Verify production HTTPS and indexing configuration separately; keep production changes behind their own approval.
- **Estimated implementation effort:** **2–5+ engineering days**, dependent on access, existing services and host compatibility.

## 7. Health checks and monitoring

- **Current status:** No dedicated health/readiness route or monitoring bootstrap was found in the reviewed routes/scripts. The operations checklist explicitly leaves availability/error ownership and review schedule unassigned. A normal page response would not prove database or storage readiness.
- **Ready / Not Ready:** **Not Ready.**
- **Missing items:** Non-sensitive liveness/readiness signals; external availability monitoring; alert destination and escalation owner; checks for database, storage and enquiry delivery; a documented review cadence.
- **Risks:** Outages or failed dependencies may go unnoticed, and homepage fallbacks can make partial failures look like a healthy service.
- **Recommendations:** Define a small health signal that does not reveal credentials or internal endpoints, and decide which dependencies should affect readiness. Assign an operator and alert path, then verify behavior during an approved staging outage simulation.
- **Estimated implementation effort:** **0.5–1 engineering day** for basic checks and monitoring setup, excluding vendor/account decisions.

## 8. Backup readiness

- **Current status:** A detailed provider-neutral backup/restore procedure exists, but explicitly says it is not evidence that backups exist or that a restore succeeded. Schedule, retention, encryption, location, operator and recovery objectives remain to be confirmed. No matched Neon/database plus object-storage restore rehearsal is recorded.
- **Ready / Not Ready:** **Not Ready.**
- **Missing items:** Automated backup configuration and artifact evidence; approved schedule/retention/encryption/location; operator and least-privilege backup access; recovery time/point objectives; matched database and each object class capture; isolated restore and verification.
- **Risks:** Database snapshots alone will not restore media; mismatched capture points can leave missing or incorrect objects. A written procedure without a tested restore does not demonstrate recoverability.
- **Recommendations:** Approve a recovery target and policy, then perform a synthetic isolated rehearsal that restores database and all media classes from a consistent capture. Record checksums/manifest and results without private URLs or secrets. Confirm provider-native Neon/R2 options meet the approved policy rather than assuming they do.
- **Estimated implementation effort:** **1–2 engineering days** for configuration/runbook adaptation and rehearsal, excluding resource setup/access and owner decisions.

## 9. Logging

- **Current status:** A machine-photo processing failure uses Payload’s logger; SMTP transport debug logging is disabled. No central log destination, retention, redaction policy, monitoring integration or alerting is evidenced. Several content/storage failure paths return fallbacks without an operational diagnostic.
- **Ready / Not Ready:** **Not Ready.**
- **Missing items:** Structured operational events for database/storage/mail failures; production log retention/access policy; privacy-safe redaction for personal enquiry fields, tokens and private URLs; central review and alert ownership.
- **Risks:** Silent dependency failures can lose enquiries or media availability. Unfiltered logs can expose personal information or credentials, while missing logs delay diagnosis.
- **Recommendations:** Define a minimal event schema with request/correlation identifier, subsystem, outcome and safe error class. Never log secret values, enquiry bodies or private document URLs. Verify access, retention and redaction in the chosen host’s logging facility.
- **Estimated implementation effort:** **0.5–1 engineering day** for useful application diagnostics and operational policy, plus host setup.

## 10. Error handling

- **Current status:** Enquiry validation and delivery distinguish invalid, unavailable and failed outcomes; SMTP failures are caught without exposing transport details. Media processing has a logged retryable error. Some data paths return fallback/empty values. The public error boundary still displays “Foundation test” and “local test services,” and operational diagnostics are inconsistent.
- **Ready / Not Ready:** **Not Ready** for production operations.
- **Missing items:** Production-appropriate global/user-facing error wording; consistent safe error reporting across database, storage and media operations; tested behavior for unavailable dependencies/timeouts; operational correlation between user-visible failure and logs.
- **Risks:** Customers may see development-oriented copy; failures hidden behind fallback responses may appear successful; uncaught paths can become generic errors without useful support evidence.
- **Recommendations:** Replace development-only boundary wording with clear production support guidance; preserve detailed, redacted server diagnostics; review fallbacks to ensure they do not claim success when data is unavailable. Exercise dependency failures in staging and confirm both customer message and operator signal.
- **Estimated implementation effort:** **0.5–1 engineering day** for consistent error behavior and failure-path verification.

## Cross-cutting documentation gaps

Existing readiness documents contain statements that are now stale relative to current code: the enquiry SMTP adapter is implemented and used, although live delivery remains pending; SMTP variables are described as unused in some deployment text; and older storage guidance describes GCS only despite partial R2 support. The current live-service and launch gaps remain valid. Reconcile those documents before using them as deployment instructions.

## Audit conclusion

**Production infrastructure readiness: NOT READY.** The highest-priority blockers are establishing an approved isolated PostgreSQL/object-storage deployment, proving Exabytes runtime and mail delivery, implementing assigned health/monitoring, and completing a matched database/media restore rehearsal. This report is an audit only: it makes no application changes, provisions nothing, and does not authorize deployment or production modification.
