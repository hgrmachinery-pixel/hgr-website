# First production deployment on Plesk

**Status: preparation guide only.** This repository has not been deployed to Plesk. The guide assumes the old WordPress site will eventually be replaced, but does not authorize changing the live site, DNS, hosting settings, databases, or customer data. Keep the existing site intact until the owner approves a specific cutover plan.

## Readiness summary

The application can be built and started as a Node.js server. It is not a WordPress theme or a static export. It needs Node.js, a persistent process, PostgreSQL, private Cloudflare R2 storage, and protected environment settings. WordPress and its MariaDB database cannot host the Payload data. Whether HGR's Plesk plan supports this arrangement is **not verified**.

Before attempting a deployment, confirm all of the following in the actual Plesk subscription:

- Plesk Obsidian **18.0.81 or later**, with Node.js Toolkit and Passenger enabled for Next.js detection.
- Node.js **22.23.3 or later in the 22.x line**. This matches the package engine and Plesk's currently listed Linux Node LTS. Node 24 is also accepted by the package but must be explicitly available in the account.
- The app can run `npm ci` and `npm run build`; Node.js Toolkit detects/configures the Passenger application and can restart it after a reboot.
- The Node application can be routed through HTTPS on its assigned port, and the host supports protected server environment variables for build, migration, and runtime. Plesk documents custom environment variables for Linux only.
- The server operating system and architecture are supported by the locked `sharp` image library. Verify this by building and exercising image processing on the actual app slot.
- The app can reach an already-approved PostgreSQL database and private R2 bucket over the network. Do not substitute the existing Exabytes MariaDB database.
- The account has enough memory, disk/temp space, execution time, and request-size allowance for Next.js builds and image processing. The current upload limits must be set explicitly; check Plesk/proxy request limits against the chosen values.
- A staging or isolated application slot can be used for first acceptance without overwriting the current WordPress site.

If any item is unavailable, stop and record the limitation. Do not install plugins, buy hosting, create paid services, alter WordPress, or change DNS as part of this guide. A PHP-only plan or a panel that cannot keep a Node process running is incompatible with this app.

## What the repository verifies

| Area | Verified in the repository | Still unverified on Plesk |
|---|---|---|
| Build | `npm run build` invokes `next build`; `npm ci` can install the exact lockfile. | Plesk build succeeds with its Node version, OS and resource limits. |
| Start | `npm run start` invokes `next start`; Next listens on `PORT` or an explicit port. | Persistent service, assigned port, restart and HTTPS proxy routing. |
| Plesk integration | Official Plesk guidance says Next.js detection/configuration through Node.js Toolkit and Passenger is supported from Obsidian 18.0.81. | Exact Plesk version and enabled extensions in HGR's plan. |
| Runtime | `package.json` requires Node 22.23.3+ in 22.x, or 24.x. Current local runtime is Node v24.21.0; Plesk's current Linux list includes Node 22. | Node 22.23.3+ availability, Linux glibc 2.28+ and Sharp support in this account. |
| App layout | Full Next/Payload source, `src/migrations`, `public`, `package.json`, and `package-lock.json` are required. | Plesk's deployment root and application directory configuration. |
| Database | Payload requires PostgreSQL; automatic database creation and schema push are disabled; migrations are committed. | PostgreSQL connectivity, role, TLS/pooling settings, migration and recovery. |
| Media | Runtime configuration uses a private S3-compatible Cloudflare R2 bucket. | Credentials, connectivity, upload/read/privacy and backup acceptance. |
| WordPress | Not used by this app. | Safe isolated hosting slot and an owner-approved cutover plan. |

This deployment process rebuilds the same source and lockfile on the destination. It is portable across suitable Node hosts; it does not mean copying `node_modules` or a Windows `.next` directory from a developer computer.

## Production environment settings

Enter values using Plesk's protected Node application environment settings or another approved protected server mechanism. Supply the needed settings to the build, migration and running application processes. Record whether each setting exists, never its value. Keep secrets out of Git, `.env` uploads, browser-visible variables, screenshots and logs.

### Required for application startup

| Variable | Requirement |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL for the approved application database. It must not point at MariaDB. Apply the database provider's required TLS settings. |
| `PAYLOAD_SECRET` | Random secret with at least 32 characters. Keep stable for this installation; changing it affects authentication/session handling. |
| `PREVIEW_SECRET` | A separate random secret with at least 32 characters. Required during build and runtime; changing it invalidates outstanding preview links. |
| `SERVER_URL` | Public application origin, e.g. `https://<approved-hostname>`; origin only, with no path, credentials, query or fragment. |
| `R2_ENDPOINT` | HTTPS Cloudflare R2 S3 API endpoint, without credentials embedded in the URL. |
| `R2_BUCKET` | Existing private bucket name. Do not make the bucket public or attach a public bucket domain. |
| `R2_ACCESS_KEY_ID` | Least-privilege R2 access key, protected. |
| `R2_SECRET_ACCESS_KEY` | Matching secret key, protected. |

The database, secret, origin and R2 settings are read while Payload configuration loads; missing or invalid values prevent the app from starting/building. No Google Cloud storage credentials are needed for the production configuration. GCS emulator and smoke-test variables are not production settings.

### Required before enabling inventory photo workflows

| Variable | Requirement |
|---|---|
| `HGR_MACHINE_PHOTO_MAX_FILE_BYTES` | Positive integer byte limit per source photo. Choose only after confirming Plesk/proxy request limits and testing memory/time. |
| `HGR_MACHINE_PHOTO_MAX_BATCH_BYTES` | Positive integer total batch limit, greater than or equal to the per-file limit. |
| `HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED` | Must remain unset or `false` until the private-master and approved-derivative delivery path has passed its security and privacy acceptance tests on the actual private bucket. Do not turn it on just to make image URLs work. |
| `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` | Used by existing public media delivery gates. Confirm its exact effect against current source and acceptance requirements before setting it. Default to unset/false during initial setup. |

`HGR_MACHINE_DOCUMENT_MIME_TYPES` is an optional comma-separated allowlist. Set it only after the allowed document types and sensitive-document workflow have been approved. Do not upload real JPJ or ownership records during initial deployment tests.

### Optional enquiry email

These settings are needed only if HGR has approved SMTP delivery and tested it end-to-end:

`ENQUIRY_EMAIL_ENABLED=true`, `SMTP_HOST`, `SMTP_PORT` (`465` or `587`), `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, and `ENQUIRY_TO_EMAIL`.

Without complete valid values and the explicit enable flag, website enquiries are not delivered by email. Payload account recovery email is a separate feature and is not configured by these values.

### Optional analytics

`HGR_ANALYTICS_ENABLED=true` and `HGR_GTM_CONTAINER_ID` enable Google Tag Manager. Keep analytics disabled until HGR has approved the measurement/privacy setup and any required consent experience. `HGR_GTM_CONTAINER_ID` must be provided at build time. These variables are included in `.env.example` by name only.

### Public origin and indexing

`NEXT_PUBLIC_SERVER_URL` is only used by the CMS's Copy Machine Link control. If supplied, set it to the same public origin as `SERVER_URL` before building because `NEXT_PUBLIC_*` values are embedded at build time. `HGR_PUBLIC_INDEXING_ENABLED` must remain unset/false on staging. Set it to `true` only for an owner-approved public launch after hostname, HTTPS, content and SEO checks. Indexing requires production mode, this explicit flag, and a valid `SERVER_URL`.

Do not set `HGR_LOCAL_UI_REVIEW=true` in a production deployment. Do not set smoke/emulator values such as `HGR_SMOKE_DISPOSABLE`, `SMOKE_DATABASE_URL`, `SMOKE_GCS_*`, `SMOKE_PG_*`, `SMOKE_APP_PORT`, `SMOKE_GCS_IMAGE`, `STORAGE_EMULATOR_HOST`, `GCS_ENDPOINT`, `GCS_BUCKET`, `GCS_PROJECT_ID`, or `GOOGLE_APPLICATION_CREDENTIALS` for ordinary production.

## Step-by-step Plesk procedure

This sequence is for a separately approved first deployment or isolated staging slot. Creating resources, changing server configuration and replacing the live site each require their own approval. No production write should be attempted from this document alone.

1. **Confirm the target and owner approval.** Identify the exact Plesk subscription/application slot, its purpose (staging or production), hostname, source commit, rollback method and authorized change window. First confirm the compatibility gates above. Do not target the live WordPress document root for the initial test.
2. **Prepare separate services.** Confirm an approved PostgreSQL database/user and private R2 bucket already exist, are reachable from Plesk, and have a documented backup/recovery plan. Exabytes MariaDB is not supported for Payload. Do not create or purchase services without separate owner approval.
3. **Configure the Node application in Plesk.** Confirm Obsidian 18.0.81+ and Node.js Toolkit/Passenger first. Choose Node 22.23.3+ within 22.x, the application root and assigned port in the Plesk Node.js interface. Set the app root to the repository root (the directory containing `package.json`). Enable Plesk's managed application proxy and HTTPS for the approved test hostname. Record the settings without secret values. Plesk menu names vary by edition/provider; use that account's instructions.
4. **Provide the environment.** Add required variables through Plesk's protected environment settings. Set `SERVER_URL` to the test hostname's HTTPS origin. For the first staging deployment leave public indexing and media-delivery verification flags disabled. Configure explicit conservative upload limits compatible with the proxy, or leave inventory photo workflows disabled until their limits are chosen. Add optional SMTP settings only after mail delivery is approved and tested.
5. **Get the source.** Deploy the exact approved GitHub commit to the app root, including `package.json`, `package-lock.json`, `next.config.mjs`, `src/`, `public/`, and `src/migrations/`. Use Plesk Git deployment if available, or another approved method. Do not copy local `.env` files, `node_modules`, `.next`, private documents, database files or backups into the web root.
6. **Install locked dependencies.** In the Plesk application terminal, run from the repository root:

   ```sh
   npm ci
   ```

   This installs from the committed lockfile. Do not use `npm install` to change dependency versions on the server. Confirm the installed Sharp native module can load on the Plesk OS/architecture.

7. **Check and build.** Run:

   ```sh
   npm run typecheck
   npm run build
   ```

   If the Plesk plan does not provide an application terminal or build command, determine the supported deployment method before proceeding. Do not upload a build made on Windows as a substitute for a Linux build unless the exact packaging is deliberately supported and verified.

8. **Apply the committed database migrations.** Confirm the environment points to the approved new/empty PostgreSQL database, not live or shared data, and verify the required backup/recovery arrangement. Review the committed files in `src/migrations/`, then run from the repository root with the same protected environment:

   ```sh
   CI=true PAYLOAD_MIGRATING=true npx payload migrate
   ```

   `npm ci` must have installed the local Payload CLI; do not accept an `npx` prompt to download another package. This changes the database schema. Run it only under the exact explicit approval and target confirmation for that database. Do not run schema push or regenerate migrations on Plesk.

9. **Start the application.** Use Node.js Toolkit's Next.js detection and Passenger configuration for the startup file and port. Plesk documents a startup-file field, not an arbitrary `npm run start` command field. Build with `npm run build`, then let the detected/managed Passenger app start and supervise Next.js. Restart it through Plesk's Node app controls. Confirm the logs show successful startup; remove secrets from any diagnostic capture. If Next.js is not detected or the startup file fails, stop and resolve the account-specific configuration rather than guessing a launcher.
10. **Protect the first administrator setup.** Before allowing any public access to a freshly migrated empty database, use Plesk's access restriction or an equivalent temporary network-level control to limit the site to the owner/operator. The first account created is assigned the Owner role, so never leave open registration reachable by the public during this bootstrap. Create the intended owner account, verify sign-in, then remove the temporary restriction only after the owner confirms the account is secure. Do not use a real password in screenshots or logs.
11. **Verify the isolated deployment.** Over HTTPS check `/`, `/used-excavators`, `/admin`, `/robots.txt`, and `/sitemap.xml`. Confirm the admin login page loads, robots do not include an unwanted staging sitemap, the application remains online after a Plesk restart, and logs contain no configuration or database errors. Use only synthetic data. Do not add real inventory or sensitive files until their relevant acceptance and owner workflows are approved.
12. **Prove integration before enabling features.** Separately test PostgreSQL read/write and persistence, R2 synthetic upload/read, denied public access to private originals/documents, approved derivative behavior, image processing, request-size failures, and restart persistence. SMTP requires its own synthetic receipt and failure test. A successful build or homepage response does not prove those systems work.
13. **Prepare cutover separately.** Before replacing WordPress, agree on the final hostname, migration/data plan, content and SEO review, rollback steps, monitoring and change window. Obtain explicit owner approval for the exact production cutover. DNS and live WordPress modifications are not part of this guide.

## Rollback and recovery notes

For staging, use Plesk to stop the Node application and restore the previous staging release if needed. Keep database/object recovery instructions with the responsible operator. A code rollback alone does not reverse database migrations or restore media. Do not delete databases, buckets, backups, WordPress files or production data as cleanup. Production rollback must be planned and explicitly approved before cutover.

## Evidence and current gaps

This guide verifies source configuration and gives a repeatable Plesk-shaped procedure. Plesk's published guidance supports Next.js from Obsidian 18.0.81 through Node.js Toolkit detection and Passenger; custom environment variables are documented for Plesk Linux only. It does not establish that HGR's Plesk plan meets the version, OS, environment-injection, PostgreSQL/R2 or Sharp requirements, or that deployment, migrations, media, mail, recovery or cutover have passed. Confirm the actual account first; deployment remains blocked until its capability gate and service/security decisions are resolved. See [Plesk Next.js compatibility](https://support.plesk.com/hc/en-us/articles/12376965359511-Does-Plesk-support-Next-js-React-Angular-Vue-js-Vite-applications) and [Plesk Node.js hosting documentation](https://docs.plesk.com/en-US/obsidian/administrator-guide/website-management/nodejs-support.76652/).

Related: [portable rebuild and redeployment](portable-redeploy.md), [production infrastructure audit](../../PRODUCTION-INFRASTRUCTURE-AUDIT.md), and [`.env.example`](../../.env.example).
