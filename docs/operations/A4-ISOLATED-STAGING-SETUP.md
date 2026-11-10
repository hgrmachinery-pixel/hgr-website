# HGR isolated staging setup checklist

**Status (10 November 2026):** Owner confirms existing staging resources: Railway service `abundant-presence`, private R2 Standard bucket `hgr-staging-media`, and active bucket-scoped Object Read & Write token. Owner reports the protected R2 variables are configured only in Railway staging. The approved one-object R2 preflight passed from the Railway staging SSH Console using `/proc/1/exe` and the installed AWS SDK: upload/readback SHA-256 matched, exact-key deletion succeeded, the test prefix had zero remaining objects, and cleanup was verified. No credentials were disclosed. This is owner-reported live evidence; this workspace did not connect to Railway or R2. No infrastructure was recreated or modified. The test confirms direct S3-compatible R2 operations only, not Payload uploads, CMS/database state, image processing, frontend display, or the RM5 account-wide billing balance.

## Recommended layout

- The existing Railway staging service `abundant-presence`, with staging-only protected variables. Do not create another service or infer its running revision from the local branch; verify the deployed commit read-only before acceptance.
- The existing staging Neon project/branch/database. Preserve its current data. Verify database identity and migration state read-only before any acceptance writes; do not recreate, reset, branch, or migrate it for this release.
- The existing private `hgr-staging-media` bucket and bucket-scoped Object Read & Write token. Never use the production bucket, key, or credential group.
- Synthetic machine/listing content and generated test images only. No production database copy, real customer enquiries, or private documents.

## Ordered setup and acceptance

1. **Cost gate.** The Owner approved the RM5 ceiling for the direct R2 preflight, and that single-object check is complete. Before the separate Payload acceptance, verify current shared R2 headroom and obtain the explicit write approval listed below. Do not create paid resources.
2. **Verify existing isolated targets read-only.** Confirm the staging Neon identity and migration state, the private `hgr-staging-media` bucket, and staging-only token scope. Record labels and results without secret values. Do not create an empty database, recreate resources, or reset existing data.
3. **Verify the existing Railway staging service.** Use `abundant-presence`; identify its deployed commit and confirm staging-only variables and protected routes. Do not change source selection, variables, service settings, or production. Railway deployment settings are dashboard-managed; the repository has no Railway manifest.
4. **Review staging configuration without changing secrets.** Use protected settings only. Required names and behavior are below. Never copy production values or put secrets in `NEXT_PUBLIC_*` settings.
5. **Validate the approved source revision locally.** Use Linux Node 24 and the committed `package-lock.json`; do not copy `node_modules` or `.next` from another OS. The release candidate build succeeded and generated the repository baseline migration bundle as a build artifact. No database migration was applied.
6. **Do not run database migrations for this photo-workflow release.** The candidate excludes migration files and registry changes. Before any staging write, confirm staging database identity and migration state using read-only inspection. If the required existing schema is missing or a migration is pending, stop and request separate Owner approval; do not run `payload migrate`, schema push, or migration generation as part of this acceptance.
7. **Verify existing access.** The Owner has confirmed Payload Admin login and access to Machines. Before testing, recheck the staging hostname, deployed revision, staff authentication, staging identity banner, and route protections. Do not create a staff account or synthetic machine for this test.
8. **Exercise the simplified photo workflow on the already-existing synthetic machine HGR-000001.** Before editing, record its current publication status, featured image, gallery snapshot, machine-media relationships and matching R2 object keys. Stop if existing content or media is unexpected. Upload one generated, non-sensitive synthetic image to the General / Exterior category. Confirm the original stays private, processing creates a watermarked WebP and responsive sizes, alt text uses the machine facts and category and can be edited, and an ordinary photo reaches Ready for publication without a mandatory checklist. The hidden Gallery Images field is generated only when the Owner explicitly publishes changes; the Featured Image falls back to the first eligible General / Exterior photo. Confirm the new derivative and every size remain inaccessible before publication. Keep every pre-existing media record and bucket key unchanged; the expected new photo records and machine publication snapshot are the only intended database changes.
   - For sensitive-content acceptance, use only synthetic markings. Record a finding or uncertainty through the server review action; verify it remains private across reprocessing and cannot publish until a clear human review of the current redacted revision. For the concurrency test, race review of the current revision against reprocessing. If the review commits first, the new revision must inherit the hold. If processing commits first, the stale review must return 409 and be resubmitted against the current revision before any publish. Verify the machine row lock serializes both operations and that no public response slips through.
   - Leave `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` unset/false until the private-master and denied-before-publication checks pass. For frontend readback, enable that flag only in staging after the Owner's test approval; retain staging Basic Auth and noindex. Verify the published synthetic machine at desktop and mobile sizes, then turn the flag off after acceptance. Do not manually edit Gallery Images or delete records/objects. The direct R2 one-object preflight is already complete and must not be repeated.
9. **Verify index and email safeguards on the deployed staging host.** Keep `HGR_PUBLIC_INDEXING_ENABLED=false` or unset, `HGR_ANALYTICS_ENABLED=false` or unset, and omit the GTM ID. Confirm rendered pages have `noindex`, `/sitemap.xml` is empty, and `/robots.txt` has no staging sitemap. `robots.txt` is not access control: verify the application Basic Auth gate on public pages and every route except the exact healthcheck GET. Confirm the `STAGING — TEST DATA ONLY` banner is visible on both the public site and Payload admin before Owner content workflows. Keep enquiry email disabled and submit only a synthetic enquiry to confirm it is not sent.
10. **Record evidence and preserve the test data.** Record candidate SHA, Railway deployment ID, confirm no migration ran, resource mapping without secrets, HGR-000001 baseline and final state, generated R2 keys, image readback, privacy checks, noindex/sitemap results, and email-disabled outcome. Machine-photo records are retained and deletion is disabled; do not delete their records or R2 objects. Turn off the staging public-media flag after acceptance and keep the synthetic media private. If restoring HGR-000001's original published state would expose the test derivative through the generated snapshot, stop and obtain Owner direction before restoring or re-enabling public delivery. Keep this separate from the later matched database-and-media restore rehearsal.

## Environment variables

| Variable | Staging value/requirement |
|---|---|
| `DATABASE_URL` | Required PostgreSQL URL for the existing staging database. Must not identify production; preserve its data. |
| `PAYLOAD_SECRET` | Required; staging-only unpredictable value, at least 32 characters. |
| `SERVER_URL` | Required HTTPS staging origin, with no path or credentials. Used for CSRF, origin checks, media routes, and canonical host. |
| `R2_ENDPOINT` | Required HTTPS Cloudflare R2 S3 endpoint, without embedded credentials. |
| `R2_BUCKET` | Required separate private staging bucket. |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Required staging-only credentials scoped to the staging bucket; never production credentials. |
| `PREVIEW_SECRET` | Not required for application startup; set a separate unpredictable value of at least 32 characters to enable draft preview in staging. Without it, preview returns 503. |
| `NEXT_PUBLIC_SERVER_URL` | Optional build-time public URL used by the CMS Copy Machine Link control. Set to the staging origin before building so copied links do not point elsewhere. It is not a secret. |
| `HGR_MACHINE_PHOTO_MAX_FILE_BYTES` | Required for photo uploads. Recommended staging value: `5242880` (5 MiB per image), subject to the staging host/proxy request-size limit. |
| `HGR_MACHINE_PHOTO_MAX_BATCH_BYTES` | Required for uploader batch validation. Recommended staging value: `20971520` (20 MiB per selected batch). Current uploader concurrency is one. |
| `HGR_MACHINE_PHOTO_MAX_PIXELS` | Optional; code default is `20000000`. Set explicitly to `20000000` in staging for reproducible checks. |
| `ENQUIRY_EMAIL_ENABLED` | Set explicitly to `false`. Leave `RESEND_API_KEY`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, and `ENQUIRY_TO_EMAIL` unset. The enquiry adapter sends only when the flag is exactly `true` and valid Resend settings exist. Payload CMS account email is separately configured with a no-delivery adapter. |
| `HGR_PUBLIC_INDEXING_ENABLED` | Explicitly `false` or unset. Production mode alone does not enable indexing; it also requires this flag to equal `true` and a valid origin. |
| `HGR_ANALYTICS_ENABLED`, `HGR_GTM_CONTAINER_ID` | Keep analytics disabled and omit the container ID. |
| `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` | Keep unset/false until staging R2 private-master and approved-derivative route checks pass; if set true for public derivative readback, set it only on staging. |
| `HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED` | Keep unset/false unless the separate inventory-media route is tested and verified in staging. |
| `PORT` | Railway-provided process port; do not hard-code a production port. |

Do not add `POSTGRES_URL`, `S3_ENDPOINT`, SMTP variables, or the loopback-only `SMOKE_*`/`HGR_SMOKE_DISPOSABLE` variables for this deployment. They are not the active production adapter names or a substitute for isolated staging settings.

## Cloudflare R2 one-object preflight (completed; do not repeat)

Owner-reported completion is recorded above. The verified run used the existing private staging bucket and synthetic content only; no production bucket or key was used.

### Required resource and permissions

- Use one dedicated private staging bucket in the HGR Cloudflare account, with public access/custom-domain publication disabled and the Standard storage class. Do not create it until the Owner confirms no suitable isolated bucket exists and approves the exact creation and cost ceiling.
- Use a Cloudflare R2 S3 API token with **Object Read & Write**, scoped to this staging bucket only. Do not use Admin Read & Write, account-wide scope, production credentials, or a personal user token if a managed account token is available. This permission covers object read/write/list; the test needs only `PutObject`, `GetObject`/`HeadObject`, and `DeleteObject` on its one key.
- Keep `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in a protected local/staging secret channel. `R2_ENDPOINT` is the HTTPS account endpoint from Cloudflare, without a path or embedded credentials; the application uses S3 region `auto` and path-style addressing. Never put the secret in chat, logs, Git, `.env` committed to the repository, screenshots, or this plan. The secret key is shown only at creation, so deliver it directly into protected settings.

### Historical one-object verification method (completed; do not repeat)

**Completed (Owner-reported, 10 November 2026):** The approved single synthetic object test passed in the existing Railway staging service against `hgr-staging-media`. SHA-256 readback matched; only the generated key was deleted; the test prefix was empty afterward. Credentials were not exposed. No further direct R2 preflight is required.

1. Before the test, the Owner verifies the redacted Cloudflare account/resource identity, bucket name, private access, token scope, staging-only secret mapping, and that no production variables are bound to the test process. Record no secret values.
2. From an approved network-enabled WSL or staging host, use the configured AWS S3 SDK against the R2 endpoint to upload one small generated PNG to a unique key such as `hgr-r2-preflight/<UTC-run-id>/synthetic.png`. Do not use a real machine image or personal/sensitive document.
3. Read the object back with `GetObject` and verify its byte length and SHA-256 against the local synthetic file; verify the content type and key with `HeadObject`. Do not make it public or use a public URL.
4. Delete only that exact unique key with `DeleteObject`; verify `HeadObject` returns not-found. Retain a sanitized log containing run ID, bucket label, key, sizes, hashes, operation results, and timestamps, but no credentials or signed request headers. If cleanup fails, stop and request Owner direction before retrying deletion.
5. Confirm the bucket is empty of this test prefix and revoke/rotate the staging token if it was created only for this check. Do not delete the bucket as part of one-object cleanup.

This direct SDK check verifies endpoint, token scope, and basic object persistence only. It does **not** verify Payload upload hooks, responsive derivative generation, private master authorization, public derivative authorization, restart persistence, or the full staging application. The next acceptance is one synthetic General / Exterior photo uploaded through Payload Admin on the existing HGR-000001 record. Before any write, verify the deployed code revision and read the machine's current publication state, photo relationships, and matching R2 keys; stop if unexpected. Preserve the existing machine and all pre-existing media records and objects. The test should verify the new private master, watermarked responsive derivatives, generated editable alt text, owner-controlled publication, private-before-publish access, and rendered staging listing/detail page. No schema migration or indexing change is part of this test. Obtain separate explicit Owner approval for the photo upload, any publication needed for frontend readback, the staging database/R2 writes, and the non-destructive cleanup plan before running it.

### Cost and Owner approval gate

Cloudflare's current R2 Standard pricing lists 10 GB-month, 1 million Class A requests, and 10 million Class B requests per month in the free tier; egress is free. `PutObject` is Class A, `GetObject`/`HeadObject` are Class B, and `DeleteObject` is free. Usage is account-level and billable quantities are rounded, so an existing account may already consume the included allowance. One small short-lived object should have negligible incremental usage, but charges cannot be guaranteed to be zero. Use the current [Cloudflare R2 pricing page](https://developers.cloudflare.com/r2/pricing/) at approval time.

The Owner previously approved the one-object R2 preflight and RM5 cap; that direct-storage test is complete. The separate Payload acceptance test requires explicit approval before writes. For any future R2 operation, confirm current account usage/cost headroom because the allowance is shared account-wide.

The Owner must explicitly approve, in one decision, before the Payload acceptance test:

1. Permission to upload one synthetic photo to the existing HGR-000001 machine, creating only the related photo metadata and generated objects in the existing staging database and bucket. Do not create another machine.
2. Agreement on the synthetic photo marker and exact baseline comparison. Do not alter the existing record or any existing media object beyond the approved photo relationship/publication steps.
3. Agreement on non-destructive cleanup: leave the new photo unpublished, turn off `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED`, and retain its media record/object privately because deletion is denied. If restoring the original machine state would require removing a relationship or changing an audit-protected record, stop and request Owner direction.
4. Confirmation that staging remains protected from public indexing, plus approval for any temporary publication/public-media readback needed to verify the frontend.
5. Confirmation of the RM5 incremental cost ceiling and current R2 account headroom before Payload-generated object operations.

Cloudflare describes bucket-scoped Object Read & Write tokens in its [S3 setup guide](https://developers.cloudflare.com/r2/get-started/s3/) and [R2 token permissions](https://developers.cloudflare.com/r2/api/tokens/). The resources and direct R2 preflight are Owner-confirmed; this workspace has not accessed credentials or Cloudflare.

## Known gaps and gates

- No Railway manifest, checked-in staging service definition, or current account evidence is present in this repository. Branch selection, automatic deploy behavior, access protection, variable groups, and current subscription/charges must be verified in Railway before setup.
- The app has no startup guard that can recognize a production Neon/R2 resource mistakenly pasted into staging. Isolation depends on distinct resources, database grants restricted to staging, bucket-scoped credentials, no shared production variable groups, and a redacted resource-identity review before migrations or writes.
- The application-level staging Basic Auth gate protects public, Admin, API, media, and static routes, with only the exact unauthenticated `GET /api/healthz` liveness response exempted for Railway. It remains unverified on a deployed staging service. The application now renders a visible `STAGING — TEST DATA ONLY` banner on the public site and Payload admin when `RAILWAY_ENVIRONMENT_NAME=staging`; verify both on the deployed staging host before Owner content workflows. The banner does not replace the access gate.
- `HGR_PUBLIC_INDEXING_ENABLED=false` provides page-level `noindex` and an empty sitemap. It does not make a public staging site private.
- The deployment guide's enquiry variables must match the active Resend adapter (`RESEND_API_KEY`), not SMTP names. Do not configure email delivery for initial staging acceptance.
- Successful local tests and TypeScript checks do not establish Railway, Neon, or R2 connectivity, persistence, backups, or restore readiness.
