# HGR Production Infrastructure Vault

Operational reference for the HGR website. This document records configuration locations, known decisions and status only. It must never contain credential values, passwords, tokens, private keys, or private connection strings. Environment variable status below means only whether a non-empty value was present in this workstation's `.env.local` at the time checked; it does not establish that production has the same setting.

**Last reviewed:** 8 October 2026  
**Production readiness:** Pending account-specific verification and deployment acceptance.

## Project Information

| Item | Record |
|---|---|
| Business | HGR Equipment Resources, Malaysia; used heavy machinery, primarily excavators. |
| Production domain | `hgrmachinery.com` (approved project domain; DNS record status pending verification). |
| Application | Next.js with Payload CMS; TypeScript. |
| Source repository | GitHub: `hgrmachinery-pixel/hgr-website`. |
| Approved database | Neon PostgreSQL; do not use Exabytes MariaDB for Payload. |
| Approved object storage | Cloudflare R2, private bucket, accessed through the Payload S3-compatible adapter. |
| Initial deployment target | Existing Exabytes hosting for testing, subject to Node.js compatibility; no successful account-specific production test is recorded. |
| Portability | Application host must remain replaceable without a source rewrite; PostgreSQL and R2 are separate services. |

## Neon PostgreSQL

| Item | Record |
|---|---|
| Provider | Neon PostgreSQL. |
| Connection configuration | `DATABASE_URL`, supplied through environment configuration. Never record its value here. |
| Application database adapter | Payload PostgreSQL adapter (`@payloadcms/db-postgres`). Schema changes use committed Payload migrations; automatic schema push and database creation are disabled. |
| Database/project/branch/region | Pending: record in the provider console or approved secret manager, not in this document. |
| Connection verification | Pending: confirm production host can connect and migrations have completed against the intended Neon database. A prior local migration request concerned an empty database, so no content-copy migration was expected; completion evidence is not recorded here. |
| Access | Use a least-privilege database role and provider connection settings appropriate to the host. Store the connection string only in protected environment settings. |

## Cloudflare R2

| Item | Record |
|---|---|
| Provider | Cloudflare R2 using its S3-compatible API. |
| Collections | `machine-media`, `inventory-media`, `machine-documents`. `inventory-media` uses the existing R2 reader as well as the Payload S3 adapter. |
| Bucket | Private bucket configured by `R2_BUCKET`; actual bucket name/location: pending. |
| Endpoint | `R2_ENDPOINT` is a full HTTPS S3 API URL. Payload validates it and passes its origin to the AWS S3 adapter. The inventory reader passes the configured URL directly to AWS SDK `S3Client`. |
| Object prefixes | `machine-media/`, `inventory-media/`, and `machine-documents/`. |
| Credentials | `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`, injected through protected environment settings. Never put values in this file or source control. |
| Bucket policy | Keep bucket private; do not attach a public domain. Cloudflare R2 does not support S3 object ACL headers, so adapter ACL configuration is omitted. Downloads must remain behind Payload/application authorization. |
| Sensitive documents | Machine document originals and redacted copies are staff-only under current code. An “approved” document is not thereby publicly served. Never expose private originals. |
| Public photos | Existing approved-derivative and publication controls apply. Keep public delivery verification disabled until R2 delivery has passed acceptance checks. |
| Connectivity | Pending. The previous check ran inside the restricted Codex workspace, where outbound network access was disabled; its DNS `ENOTFOUND` result did not establish whether R2 was correctly configured. |
| GCS | Not required for production. GCS adapter and variables are retained only for guarded local foundation smoke fixtures. No object-copy work is planned while production storage is empty. |

## SMTP

| Item | Record |
|---|---|
| Provider | Exabytes SMTP is the requested mail service; account/host details and successful test are pending. |
| Configuration names | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`. Enquiry delivery also uses `ENQUIRY_TO_EMAIL` and explicit `ENQUIRY_EMAIL_ENABLED=true`. |
| Current implementation | Website enquiry email can be enabled with complete valid settings and explicit enablement. Payload account-recovery email remains disabled; environment settings alone do not enable it. |
| Sender authentication / TLS / port | Pending confirmation from the Exabytes mail account configuration. Store any credentials only in protected host settings. |
| Test delivery | Pending: test through an approved test recipient before enabling production enquiry delivery. |

## Payload CMS

| Item | Record |
|---|---|
| Admin | Payload Admin is served by the Next.js application; staff use CMS screens for routine inventory/content management. |
| Secret | `PAYLOAD_SECRET` is required and must be a protected, unpredictable value of at least 32 characters. Presence is not proof of production correctness. |
| Migrations | Apply committed Payload migrations explicitly to the intended PostgreSQL database. Do not use schema push or regenerate migrations on the host. Migration completion evidence: pending. |
| Storage | Payload S3 adapter uses R2 for the three collections listed above; local upload storage is disabled. |
| Foundation fixture | `foundation-fixtures` is excluded from production runtime. It is retained only for guarded disposable local smoke tests. |
| Access controls | Machine documents are staff-only; machine media delivery is governed by approval/publication checks; inventory derivative reads require owner/review/publication checks. Preserve these controls. |
| Preview | `PREVIEW_SECRET` is required during build and runtime because the preview route validates it at module load. The checked local `.env.local` did not contain it at the time of this historical inspection. Production value status: pending. |

## Deployment

| Item | Record |
|---|---|
| Initial target | Existing Exabytes hosting environment for testing. Account-specific Node.js support, process lifecycle, HTTPS proxy, resource limits, and actual deployment evidence are pending. |
| Runtime | Compatible full Node.js server; project supports the Node versions specified by `package.json`. Verify the selected host's OS/architecture supports Sharp. |
| Build/start | Rebuild from GitHub source and lockfile; inject required environment for build, migration, and runtime; run `npm ci`, `npm run typecheck`, `npm run build`, then `npm run start` under an approved process manager. |
| Configuration | Keep app host replaceable. Do not depend on Exabytes-specific filesystem paths or database features. Use protected environment/secret settings. |
| Deployment verification | Pending: production build on chosen host, migration, startup, `/admin`, application API, PostgreSQL connectivity, R2 round-trip, restart persistence, logs, and recovery exercise. |
| Approval boundary | No deploy, production change, paid resource, or Exabytes write test is authorized by this reference. Obtain explicit approval for the specific action. |

## DNS

| Item | Record |
|---|---|
| Domain | `hgrmachinery.com`. |
| DNS provider / account owner | Pending. |
| Registrar | Pending. |
| Current nameservers and records | Pending: verify in the authoritative provider console. Do not infer or copy records from local configuration. |
| Application origin / TLS | Pending: confirm production origin and certificate after an approved deployment. `SERVER_URL` supplies the application origin. |
| Change control | DNS changes require explicit owner approval. No DNS changes are made by this document. |

## Environment Variables (presence only, never secrets)

The following presence check reads this workstation's `.env.local` only. It does not show values and does not confirm that production settings match. Checked 8 October 2026.

| Variable | Local `.env.local` value present? | Production value configured/verified? | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | Pending | Neon PostgreSQL connection; value must remain secret. |
| `PAYLOAD_SECRET` | Yes | Pending | Required Payload secret; never disclose. |
| `SERVER_URL` | Yes | Pending | Application HTTP(S) origin. |
| `PREVIEW_SECRET` | Yes | Pending | Separate random secret of at least 32 characters; required during build and runtime. Changing it invalidates outstanding preview links. |
| `R2_ENDPOINT` | Yes | Pending | Full HTTPS Cloudflare S3 API endpoint; endpoint reachability not verified from restricted workspace. |
| `R2_BUCKET` | Yes | Pending | Shared private bucket name. |
| `R2_ACCESS_KEY_ID` | Yes | Pending | Sensitive access credential. |
| `R2_SECRET_ACCESS_KEY` | Yes | Pending | Secret credential. |
| `SMTP_HOST` | No | Pending | Exabytes SMTP configuration. |
| `SMTP_PORT` | No | Pending | Exabytes SMTP configuration. |
| `SMTP_USER` | No | Pending | Exabytes SMTP account. |
| `SMTP_PASSWORD` | No | Pending | Secret credential. |
| `MAIL_FROM_NAME` | No | Pending | Approved sender display name. |
| `MAIL_FROM_ADDRESS` | No | Pending | Approved sender address. |
| `ENQUIRY_TO_EMAIL` | Yes | Pending | Presence only; verify approved recipient and production setting. |
| `ENQUIRY_EMAIL_ENABLED` | No | Pending | Delivery requires explicit `true` and complete valid mail settings. |

Never store environment values in this file. Production values belong in the selected host's protected environment/secret settings. Do not commit `.env.local` or place secrets in `NEXT_PUBLIC_*` variables.

## Backup Strategy

| Component | Strategy / status |
|---|---|
| Neon PostgreSQL | Pending: select and document the Neon backup/PITR retention, restore procedure, recovery point objective (RPO), and recovery time objective (RTO). Verify an actual restore to a separate safe target. |
| Cloudflare R2 | Pending: decide object versioning/retention and an independent recovery/copy strategy appropriate to private originals and derivatives. Verify object restore and access controls. |
| Application configuration | Source and migrations are in GitHub. Secrets are not; maintain secure, access-controlled recovery for protected environment settings. |
| Combined recovery | Database and object storage must be backed up/recovered as separate services while preserving their relationship. No successful coordinated recovery test is recorded. |
| Backup owner / schedule / alerting | Pending. |

## Disaster Recovery

1. **Declare incident and assign owner:** pending contact/role and escalation path.
2. **Protect evidence and access:** restrict compromised credentials; rotate through the provider/host secret manager without recording values here.
3. **Restore the application:** rebuild the approved source revision from GitHub and lockfile on a compatible Node.js host, then inject protected configuration.
4. **Restore PostgreSQL:** use the approved Neon recovery point into the intended database; verify schema migrations and application connectivity before serving traffic.
5. **Restore R2 objects:** recover objects using the approved R2 recovery method; keep the bucket private and validate staff-only document access and approved derivative behavior.
6. **Verify:** check startup, health endpoints if configured, database read/write, media download, authorization boundaries, enquiry delivery (if enabled), and restart persistence.
7. **Return to service:** owner approval and DNS/release change authorization are required where applicable.

RPO, RTO, incident contacts, provider support references, restore instructions, and most recent drill: **Pending**.

## Production Checklist

- [ ] Confirm production domain ownership, DNS records, HTTPS certificate, and approved application origin.
- [ ] Confirm compatible deployment host, Node.js runtime, process restart behavior, request limits, temporary storage, and Sharp support.
- [ ] Confirm production environment names are configured in protected settings; record presence only in operational records.
- [ ] Verify Neon target identity, least-privilege database access, connectivity, and committed migrations.
- [ ] Verify R2 endpoint, private bucket, least-privilege credentials, upload/download, persistence after restart, and recovery; never use ACL headers or expose a public bucket domain.
- [ ] Verify private machine-document originals and copies are inaccessible anonymously; approved derivatives follow the intended authorization rules.
- [ ] Confirm `foundation-fixtures` is absent from production runtime and all GCS settings are absent from production configuration.
- [ ] Configure and test Exabytes SMTP with an approved recipient before enabling enquiry delivery; keep Payload account-recovery email state explicit.
- [ ] Confirm health checks, structured logging, alerting, and safe error reporting; provider-specific implementation/status remains pending.
- [ ] Set backup retention, RPO/RTO, ownership, alerting, and complete a restore drill for database and objects.
- [ ] Run typecheck and production build for the deployment revision; complete account-specific smoke/acceptance checks.
- [ ] Obtain owner approval for deployment, DNS changes, paid resources, or production writes before performing those actions.
