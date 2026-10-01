# HGR website foundation

Retained Next.js + Payload CMS foundation using PostgreSQL and external Google Cloud Storage (GCS). Phase 1 contains a synthetic upload collection and public test page; real inventory, staff workflows and launch features belong to later phases.

These instructions are for the technical maintainer. HGR staff will manage ordinary inventory and content through Payload CMS as those workflows are delivered.

## Prerequisites and current evidence

- Node.js 24.x (`package.json` requires `>=24 <25`), npm and Git. Install from the committed `package-lock.json`; see [dependency review](docs/development/dependency-review.md).
- Disposable PostgreSQL and a compatible GCS JSON API emulator on literal `127.0.0.1`, with three distinct explicit ports for database, storage and app. The local compose file uses PostgreSQL 17.
- Docker with Compose is one local service option. `SMOKE_GCS_IMAGE` must identify a maintainer-reviewed `fsouza/fake-gcs-server` tag/digest before pulling it. No image version has been selected or proven compatible with this adapter yet.

Production build, type checks and the 11 configuration/safety tests passed during Phase 1. The generated migration has not been applied; full PostgreSQL/storage/upload/public/Admin/restart smoke and live responsive checks remain pending because disposable services are unavailable in the current environment. Docker is absent from PATH. Neither Exabytes nor a second host has passed a deployment test.

## Configure locally

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
| `DATABASE_URL`, `GCS_ENDPOINT`, `GCS_BUCKET` | For manual local app commands, use the same disposable database URL, emulator endpoint and smoke bucket. |
| `GCS_PROJECT_ID` | Use fictional project ID `hgr-foundation-smoke` locally. |
| `PAYLOAD_SECRET`, `SERVER_URL` | Locally generated random secret of at least 32 characters; HTTP origin using `127.0.0.1` and the chosen app port. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Leave empty for the emulator. Set `STORAGE_EMULATOR_HOST` to the same emulator origin in the local shell for manual app commands. No real cloud credentials. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | Reserved names only; leave empty. No mail adapter/delivery is configured. |

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

Checked against the retained source and official docs on 1 October 2026: [Payload installation](https://payloadcms.com/docs/getting-started/installation), [migrations](https://payloadcms.com/docs/database/migrations), [storage adapters](https://payloadcms.com/docs/upload/storage-adapters), [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), and [Node.js 24 CLI](https://nodejs.org/docs/latest-v24.x/api/cli.html).
