# HGR website foundation

Next.js + Payload CMS application using PostgreSQL and Cloudflare R2 for production media. The synthetic foundation upload collection is available only inside the guarded local smoke process and uses a GCS-compatible emulator; it is not part of the production Payload runtime.

These instructions are for the technical maintainer. HGR staff will manage ordinary inventory and content through Payload CMS as those workflows are delivered.

## Prerequisites and current evidence

- Node.js 22.23.3 or later in the 22.x line, or Node.js 24.x (see the `package.json` engine range), npm and Git. Install from the committed `package-lock.json`; see [dependency review](docs/development/dependency-review.md).
- Disposable PostgreSQL and a compatible GCS JSON API emulator on literal `127.0.0.1` for the guarded local fixture smoke only, with three distinct explicit ports for database, storage and app. The local compose file uses PostgreSQL 17. The smoke process does not contact Cloudflare R2.
- Docker with Compose is one local service option. `SMOKE_GCS_IMAGE` must identify a maintainer-reviewed `fsouza/fake-gcs-server` tag/digest before pulling it. No image version has been selected or proven compatible with this adapter yet.

Production build, type checks, and the automated test suite were rerun for the current release candidate; see the deployment readiness documents for remaining host and live-service checks. The local disposable PostgreSQL/GCS-emulator upload/Admin/restart smoke and live responsive checks remain pending because the required services are unavailable in the current environment. Neither Exabytes nor a second host has passed a deployment test.

## Configure locally

### Local UI review without infrastructure

For a UI-only review, you can run the public pages without PostgreSQL or GCS by explicitly enabling the fictional local review data. This mode is development-only, shows a warning banner, and never sends or stores enquiries. It does not provide CMS login or admin functionality.

```powershell
npm ci
$env:HGR_LOCAL_UI_REVIEW='true'
$env:SERVER_URL='http://127.0.0.1:3000'
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000/`. The same mode is available at `/used-excavators`, `/machines/demo-komatsu-pc200-8-hgr-900001`, `/machines/demo-caterpillar-320d-hgr-900002`, `/machines/demo-hitachi-zx200-5g-hgr-900003`, `/machines/demo-kobelco-sk200-10-hgr-900004`, and the rental, machinery-services, lubricants, about, and contact pages. All sample machine facts are fictional. Phone and WhatsApp details are inert placeholders. Enquiry form submission is acknowledged locally and discarded.

Stop with Ctrl+C. The mode turns off when the shell closes. Do not set `HGR_LOCAL_UI_REVIEW=true` in production.

From the repository root, install the locked packages and copy the names-only [environment example](.env.example):

```powershell
npm ci
Copy-Item .env.example .env
```

On POSIX use `cp .env.example .env` for the copy. Fill `.env` locally; it is ignored by Git. Keep credentials, private files and environment values out of commits, screenshots and logs. Use fictional test records and generated images only—never customer, machine or JPJ documents. Do not point these instructions at production services.

| Variables | Local setup |
|---|---|
| `SMOKE_PG_USER`, `SMOKE_PG_PASSWORD` | Disposable credentials created only for this test database; URL-encode them in connection URLs. |
| `SMOKE_PG_PORT`, `SMOKE_GCS_PORT`, `SMOKE_APP_PORT` | Distinct available ports; app port must be 1024–65535. |
| `SMOKE_DATABASE_URL` | PostgreSQL URL containing those credentials, literal `127.0.0.1`, the explicit PostgreSQL port and database `hgr_foundation_smoke`; no query or fragment. |
| `SMOKE_GCS_ENDPOINT` | HTTP origin with literal `127.0.0.1` and the explicit storage port; no credentials, extra path, query or fragment. |
| `SMOKE_GCS_BUCKET`, `HGR_SMOKE_DISPOSABLE` | Set exactly `hgr-foundation-smoke` and `yes`, respectively, only for disposable local services. |
| `SMOKE_GCS_IMAGE` | Reviewed emulator image tag/digest; compatibility still needs testing. |
| `PAYLOAD_SECRET`, `PREVIEW_SECRET` | Separate locally generated random secrets of at least 32 characters. Keep each stable for the environment; preview links become invalid when `PREVIEW_SECRET` changes. |
| `SERVER_URL` | HTTP origin using `127.0.0.1` and the chosen app port. |
| `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Required only when running Payload collections backed by R2. Do not use real R2 credentials in the disposable foundation smoke; that command supplies inert synthetic R2 settings in its isolated child process. |
| `HGR_MACHINE_PHOTO_MAX_FILE_BYTES`, `HGR_MACHINE_PHOTO_MAX_BATCH_BYTES` | Positive photo upload limits. Required for inventory photo processing; choose them based on the actual destination host. |
| `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED`, `HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED`, `HGR_PUBLIC_INDEXING_ENABLED` | Leave unset/false locally or on staging unless completing the specific approved acceptance/launch step. |
| `HGR_ANALYTICS_ENABLED`, `HGR_GTM_CONTAINER_ID` | Optional analytics; keep disabled until approved. |
| `STORAGE_EMULATOR_HOST` | Set by the guarded smoke runner for its local GCS-compatible fixture emulator; it is not a production setting. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_EMAIL_ENABLED` | Optional website enquiry mail. Keep disabled unless all settings are valid and HGR has approved end-to-end delivery testing. |

`STORAGE_EMULATOR_HOST` is a Google client setting used automatically by the guarded smoke runner; it is not an extra required host setting. Next.js and the Payload CLI load local environment files; the plain Node smoke entry point requires explicit loading or shell-exported values.

## Local migration and verification

After the emulator image has been reviewed and local services are available, start only the disposable services defined in [compose.yaml](compose.yaml):

```text
docker compose up -d postgres gcs
node --env-file=.env scripts/smoke-foundation.mjs --migrate-only
node --env-file=.env scripts/smoke-foundation.mjs
```

These direct Node commands load `.env` and run the same entry point as the package scripts. When these variables are already exported in the shell, the equivalent scripts are `npm run migrate:local` and `npm run smoke:foundation`. Do not combine `--env-file` with `--run`: Node does not pass file-loaded values to that child command.

The migration wrapper validates the disposable loopback target before applying committed migrations. The full smoke runner also checks the emulator, creates its test bucket if absent, generates a synthetic image/record, builds and starts its own production app, checks public/Admin routes and access restrictions, verifies processed media and restart persistence, and cleans up only its own fixture/objects. Do not start a competing app on its port. It discards inherited app/cloud settings and supplies isolated test values to child processes.

A pass requires that complete sequence to succeed. Missing Docker alone does not prevent use of already available equivalent local services, but missing/unreachable PostgreSQL, an incompatible/unavailable emulator, an invalid target or unsupported runtime leaves the smoke pending. Fix the prerequisite; do not substitute MariaDB, local-disk storage or cloud credentials. Local success proves only the local test path. These commands cannot target remote Exabytes or a second host by changing endpoint values; remote tests need their own approved procedure.

Stop these local services without deleting their volumes using `docker compose stop postgres gcs`. No destructive volume cleanup is part of this guide.

## Manual app development and production build

Apply `migrate:local` first. For manual emulator use, set `STORAGE_EMULATOR_HOST` in the shell, then run the app with the chosen port:

```powershell
$env:STORAGE_EMULATOR_HOST='http://127.0.0.1:<storage-port>'
```

Replace `<storage-port>` with the local storage port from `.env`. POSIX uses `export STORAGE_EMULATOR_HOST='http://127.0.0.1:<storage-port>'` with the same replacement.

```text
npm run dev -- --hostname 127.0.0.1 --port <app-port>
```

Visit `http://127.0.0.1:<app-port>/` and `/admin`. Replace `<app-port>` with the configured port. No HGR staff accounts or real inventory are supplied by Phase 1.

Stop development before testing the production start:

```text
npm run typecheck
node --test tests/smoke-environment.test.mjs tests/foundation-config.test.mjs
npm run build
npm run start -- --hostname 127.0.0.1 --port <app-port>
```

No lint script is currently configured. Check important desktop/mobile and empty/error states when services are available; a successful build does not prove them.

For an explicitly approved migration target, Payload's non-TTY CLI forms are below. Prefer the guarded local wrapper above for disposable testing. Direct CLI execution has no loopback guard, changes database schema and requires confirmed destination environment values:

```powershell
$env:CI='true'; $env:PAYLOAD_MIGRATING='true'; npx payload migrate
Remove-Item Env:CI, Env:PAYLOAD_MIGRATING -ErrorAction SilentlyContinue
```

```sh
CI=true PAYLOAD_MIGRATING=true npx payload migrate
```

Run only after `npm ci` has installed the approved local Payload binary; do not approve a download prompt. The installed CLI sets `PAYLOAD_MIGRATING` itself; the explicit form is retained for non-TTY consistency. Review migrations before applying them. See the [portable rebuild/redeploy guide](docs/deployment/portable-redeploy.md) for destination approval, environment injection and evidence requirements.

## References

Checked against the retained source and official docs on 1 October 2026: [Payload installation](https://payloadcms.com/docs/getting-started/installation), [migrations](https://payloadcms.com/docs/database/migrations), [storage adapters](https://payloadcms.com/docs/upload/storage-adapters), [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [Node.js 22 CLI](https://nodejs.org/docs/latest-v22.x/api/cli.html) and [Node.js 24 CLI](https://nodejs.org/docs/latest-v24.x/api/cli.html).
