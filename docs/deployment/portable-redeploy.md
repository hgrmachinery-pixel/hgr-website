# Portable rebuild and redeployment

This procedure is for a technical maintainer deploying the retained foundation to a **compatible application host**. Exabytes is the initial test destination; another already available compatible host can provide a second destination. Compatibility is established by evidence from the actual account, not by its provider name.

Portability means rebuilding the same GitHub source and lockfile with destination environment values, without a source rewrite or material redesign. A destination rebuild is expected. PostgreSQL and object storage remain separate services from the replaceable Next.js/Payload application host.

## Status and permission boundary

The source/configuration and this procedure have been reviewed. Local production build, type checks and 11 configuration/safety tests passed. Database migration application and full local storage/upload/restart integration remain pending. **Exabytes and real second-host deployment verification are pending.** There is no confirmed test destination, external database, storage or email service in this repository.

Use only fake disposable data for feasibility tests. Begin with read-only account capability evidence. Exabytes writes, application upload/start, database migrations or other change tests require explicit owner approval for the exact destination and test. Preserve the existing WordPress environment. Production, DNS and irreversible changes require their own explicit approval.

A second-host test occurs only when an already available compatible resource exists and its required changes are authorized. If none exists, retain this documented procedure and record deployment as pending. Creating an account, subscription or paid/potentially chargeable app, database or storage resource requires explicit owner approval. Exabytes incompatibility is a finding for the owner; preserve the approved architecture.

## Required host capabilities

Check these before deploying:

- Node.js **22.23.3 or later in the 22.x line, or 24.x**, npm and a full Next.js Node server lifecycle. The committed [package.json](../../package.json) allows both runtime lines. Official [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Payload](https://payloadcms.com/docs/getting-started/installation) and [Sharp](https://sharp.pixelplumbing.com/install/) requirements are Node 20.9+; the selected framework and image-processing dependencies therefore do not require Node 24. Node 24 remains locally tested; Node 22.23.3 is allowed by the reviewed package engine ranges but this project has not yet been built/run under Node 22. Confirm the destination OS/architecture has a Sharp binary supported by Sharp's platform list.
- Build support and a maintained running process for `npm run start`, with host-provided port/restart management and HTTPS routing. PHP/static-only hosting cannot run this retained Admin/API application. [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) describes the Node server and reverse proxy requirements.
- Network access to the chosen **PostgreSQL** service and **GCS** bucket from the application and migration runner. Database/user and bucket must already exist; the app disables database creation and automatic schema push. PostgreSQL 17 is the local test configuration, not evidence of a destination server version.
- Native Sharp support for the destination OS/architecture, writable temporary/build/cache space and sufficient observed upload-processing memory/time. The foundation limits uploads to 5 MiB and creates a 640-pixel-wide card derivative; these are test settings, not approved production photo capacity. Verify proxy/request limits and image processing on the actual host.
- Protected server environment injection for build, migration and runtime; private credential mounting or suitable existing Google authentication; least-privilege database and bucket permissions. Inspect settings/logs without recording secret values.

Payload's [deployment guidance](https://payloadcms.com/docs/production/deployment) treats the app, database and permanent files as separate deployment needs. This project retains PostgreSQL and the official [GCS adapter](https://payloadcms.com/docs/upload/storage-adapters); the existing Exabytes MariaDB is not a substitute.

## Destination environment

Use the host's protected environment/secret settings. [`.env.example`](../../.env.example) contains names only. Local `.env` files, credentials and private documents remain outside Git. Never place a secret in a `NEXT_PUBLIC_` variable, source code, screenshots or planning records. Provide required settings before building as well as during migrations and runtime; the Payload configuration validates them on import.

| Name | Destination meaning |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL for the approved destination database; configure connection security to the service's requirements. |
| `PAYLOAD_SECRET` | Unpredictable secret of at least 32 characters. For an existing instance retain its approved secret; changing it affects authentication. |
| `SERVER_URL` | Destination HTTP(S) origin without credentials; use HTTPS for remote deployment. Drives Payload server URL and CSRF origin. |
| `GCS_PROJECT_ID`, `GCS_BUCKET` | Existing approved GCS project and bucket accessible to this instance. |
| `GCS_ENDPOINT` | Normally unset for real GCS; custom API endpoint only when an explicitly approved compatible test service requires it. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional path to a securely mounted private Google credential file outside tracked source; otherwise use the destination's existing [Google Application Default Credentials](https://docs.cloud.google.com/docs/authentication/application-default-credentials) setup. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | Reserved for later mail integration. No email adapter uses them yet; setting them does not enable delivery or account recovery email. |

Keep the real bucket private. The fixture collection is publicly readable through Payload's file route, with authentication required for writes; it accepts synthetic test images only and is unsuitable for private originals. Future JPJ/inventory rules belong to later phases. The foundation's storage adapter disables local upload storage, so app replacement must preserve the external database and objects.

The smoke-only names `HGR_SMOKE_DISPOSABLE`, `SMOKE_DATABASE_URL`, `SMOKE_GCS_ENDPOINT`, `SMOKE_GCS_BUCKET`, `SMOKE_APP_PORT`, `SMOKE_PG_USER`, `SMOKE_PG_PASSWORD`, `SMOKE_PG_PORT`, `SMOKE_GCS_PORT` and `SMOKE_GCS_IMAGE` belong exclusively to the [local procedure](../../README.md#configure-locally). Leave them out of remote deployments. Likewise `STORAGE_EMULATOR_HOST` is for emulator use only. An app host's `PORT` can set Next.js's listening port; it is process configuration, not the public domain.

## Rebuild and start

1. Obtain approval for the specific destination/test changes and confirm the external services and runtime. Record the selected source commit and non-sensitive capability evidence.
2. Check out that same source revision from the [GitHub repository](https://github.com/hgrmachinery-pixel/hgr-website), including `package-lock.json`, committed migrations and generated Admin import map. Do not copy another OS's `node_modules` or assume its `.next` artifact is portable.
3. Inject destination settings, then run from the repository root:

   ```text
   npm ci
   npm run typecheck
   npm run build
   ```

4. Review and apply committed Payload migrations to the confirmed PostgreSQL target before starting the app. The direct CLI has no disposable/loopback guard. Confirm the selected environment, credentials and any required backup/recovery arrangement before running it; an existing production database needs separate explicit approval.

   PowerShell, including non-TTY/CI execution:

   ```powershell
   $env:CI='true'; $env:PAYLOAD_MIGRATING='true'; npx payload migrate
   Remove-Item Env:CI, Env:PAYLOAD_MIGRATING -ErrorAction SilentlyContinue
   ```

   POSIX:

   ```sh
   CI=true PAYLOAD_MIGRATING=true npx payload migrate
   ```

   `npx` must resolve the installed, reviewed Payload package from `npm ci`; do not accept a package download prompt. The installed Payload migration CLI sets `PAYLOAD_MIGRATING` internally; the explicit form keeps this runbook consistent. [Payload migrations](https://payloadcms.com/docs/database/migrations) documents `payload migrate` for pending committed migrations. This foundation can build before migration; future builds that query schema may require applying the reviewed migration before build instead. Do not regenerate migrations on the destination or rely on schema push.

5. Start through the host's approved process manager with its injected environment:

   ```text
   npm run start
   ```

   Use host environment `PORT` or `npm run start -- --port <assigned-port>` as appropriate, replacing the marker with the assigned port. Verify public HTTPS routing, `/admin` and the API without publishing real data. Host provisioning, reverse proxy installation and DNS changes are outside this procedure's authorization.

## Prove the destination separately

`npm run smoke:foundation` is intentionally loopback-only, launches its own app and applies migrations to `hgr_foundation_smoke`. It cannot test remote Exabytes or another remote host simply by changing a URL. Do not weaken its guard or point it at live data. First prove the disposable local path with the [README](../../README.md#local-migration-and-verification).

For an approved destination test, the maintainer must establish a separately authorized fake-data procedure and record actual startup, PostgreSQL read/write, external object upload/read, derivative output, public/Admin access and persistence after app restart. Observe upload size, limits, elapsed time and failures on that account. Remove only the exact synthetic records/objects authorized for cleanup; do not delete a bucket, database, shared volume or production data.

For any move, preserve or separately authorize transfer of database content, object contents, permissions and relevant credentials; a rebuild alone does not transfer data. Record the source revision, runtime, service separation, environment **names**, test outcomes and unresolved gaps. Keep these evidence levels distinct:

| Evidence | What it establishes |
|---|---|
| Source/configuration and command review | Repeatable procedure exists; no host has been proven. |
| Local build/configuration tests | The reviewed tuple compiles and safety settings pass locally. |
| Completed local integration | The disposable local database/storage/public/Admin/restart path works. Currently pending. |
| Account-specific Exabytes test | That account supports the tested workload. Currently pending. |
| Real second-host deployment | The same revision rebuilt and passed on a second approved compatible destination. Currently pending. |

This is Phase 1 foundation guidance. Real inventory, private-document handling, production staging controls, email delivery, backup/recovery and launch acceptance remain assigned to later phases. Routine HGR content work will use CMS screens, not this runbook.

Official references above were checked on 1 October 2026 alongside the locked source; recheck compatibility when dependencies change.
