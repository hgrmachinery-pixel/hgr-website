# HGR production deployment

This runbook describes the intended production path. Railway runs the Next.js application and Payload CMS; Neon provides PostgreSQL; Cloudflare R2 stores media. A local build does not prove that production services have passed acceptance.

## Hosting and release flow

- **Host:** Railway, running the Node.js server for Next.js and Payload.
- **Database:** Neon PostgreSQL through `DATABASE_URL`; do not use MariaDB.
- **Media:** Cloudflare R2 through Payload's S3-compatible adapter. Keep the bucket private.
- **Source:** [hgrmachinery-pixel/hgr-website](https://github.com/hgrmachinery-pixel/hgr-website). Connect Railway to GitHub branch `main` and enable auto-deploys. Any push to the connected branch, including a documentation-only commit, can trigger a production deploy. Confirm the repo, branch, and setting in Railway.
- **Node.js:** Use a version allowed by `package.json`: `>=22.23.3 <23` or `>=24 <25`. Install from the committed lockfile with npm.

Railway deploys commits pushed to the connected branch. If GitHub Actions is configured, enable Railway's **Wait for CI**. See [Railway GitHub auto-deploys](https://docs.railway.com/deployments/github-autodeploys).

## Build, pre-deploy, and start

Configure these Railway commands:

| Stage | Command |
|---|---|
| Install and build | `npm ci && npm run build` |
| Pre-deploy | `npm run migrate:production` |
| Start | `npm run start` |

The scripts are defined in `package.json`: `build` runs `npm run migrations:build && next build`; `migrations:build` runs `node scripts/build-migrations.mjs`; `migrate:production` runs `payload migrate`; `start` runs `next start`. Set `NODE_ENV=production`. Railway supplies `PORT`; do not hard-code it.

### Compiled Payload migrations

Migrations are TypeScript in `src/migrations`. The build script compiles them to `src/migrations-compiled`. When `NODE_ENV=production`, `src/payload.config.ts` tells Payload to discover migrations from that compiled directory; development uses the TypeScript directory.

This behavior is the confirmed fix from commit [`4442276`](https://github.com/hgrmachinery-pixel/hgr-website/commit/4442276b9d8e10f6aea20f62f05827101e9719d2), **“Fix production Payload migration discovery.”** It added `migrations:build`, runs compilation before `next build`, and selects `migrations-compiled` in production. Preserve the sequence: build (compile migrations), pre-deploy `payload migrate`, then start the app. Do not generate migrations on Railway or substitute schema push.

Railway runs pre-deploy after build and before activation, with service variables and private-network access. The command runs in a separate container; use files in the built image, not a persistent volume. A non-zero exit blocks the deployment. Review the logs, fix the cause, and retry; set a timeout with room for the migration. See [Railway pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

## Environment variables

Set values only in Railway's protected service variables or an approved Neon reference. This guide lists names only; never commit or expose values. The [`.env.example`](../.env.example) is names-only. Leave local smoke settings out of Railway.

### Required production names

- `NODE_ENV`
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PREVIEW_SECRET`
- `SERVER_URL`
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `HGR_MACHINE_PHOTO_MAX_FILE_BYTES`
- `HGR_MACHINE_PHOTO_MAX_BATCH_BYTES`

Keep `PAYLOAD_SECRET` and `PREVIEW_SECRET` separate and stable. Provide each required variable to the build, migration, and runtime stages that use it. Photo limits must be positive whole-number byte counts suited to host limits and processing capacity; missing or invalid limits disable inventory photo processing.

### Optional and gated names

Only set these after the related feature is configured and accepted:

- `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED`, `HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED`: keep unset/false until R2 delivery, privacy, and authorization checks pass.
- `HGR_PUBLIC_INDEXING_ENABLED`: keep unset/false on staging; enable only for an approved public launch.
- `HGR_ANALYTICS_ENABLED`, `HGR_GTM_CONTAINER_ID`: optional; enable only after analytics/privacy approval. The container ID is embedded at build time.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_EMAIL_ENABLED`: optional enquiry mail. Enable only after complete configuration and an approved delivery check. Payload account recovery mail is separate and disabled by the current adapter.

Do not configure local-only `HGR_SMOKE_DISPOSABLE`, `SMOKE_DATABASE_URL`, `SMOKE_GCS_ENDPOINT`, `SMOKE_GCS_BUCKET`, `SMOKE_APP_PORT`, `SMOKE_PG_USER`, `SMOKE_PG_PASSWORD`, `SMOKE_PG_PORT`, `SMOKE_GCS_PORT`, `SMOKE_GCS_IMAGE`, or `STORAGE_EMULATOR_HOST`. `GCS_PROJECT_ID`, `GCS_BUCKET`, `GCS_ENDPOINT`, and `GOOGLE_APPLICATION_CREDENTIALS` are also not production settings.

## Deployment verification

For each release, record the commit SHA, Railway deployment ID, migration result, verification date, and outcome. Never include secrets, customer data, or private documents.

1. Confirm the intended `main` commit and production environment.
2. Check build logs for successful `npm ci`, `npm run build`, and migration compilation.
3. Check pre-deploy logs for a zero exit from `payload migrate`. A migration failure blocks release; do not bypass it.
4. Confirm Railway reports the deployment healthy and HTTPS works.
5. Check key public pages and `/admin` login with an authorized account.
6. With approved synthetic data, verify Payload database read/write, R2 upload, derivative delivery, and denial of public access to private originals/documents.
7. Verify synthetic data and media persist after restart. Check indexing, email, and analytics only when enabled and accepted.

A successful build alone does not prove Neon, R2, backups, email, or launch acceptance. Record unresolved checks as pending.

## Rollback and recovery

### Application

1. In the Railway production service's **Deployments** list, select the last known healthy deployment.
2. Review its commit and details, then use the deployment actions menu to roll back. Railway restores the earlier image and variables; it does not reverse database migrations or R2 object changes.
3. Watch rollback logs, confirm health, then recheck HTTPS, `/admin`, database reads, and media access.
4. Record the incident, deployment IDs, commits, migration state, and outcome.

See [Railway deployment actions](https://docs.railway.com/deployments/deployment-actions).

### Database and media

An app rollback is safe only when the database schema remains compatible with the older app. Do not assume an app rollback reverses Payload migrations. Before release, confirm the approved Neon backup/recovery point and responsible operator. If a migration is incompatible, keep the service safe and use a reviewed forward fix or explicitly approved Neon restore. Consider writes after the recovery point because restore may discard them.

Railway rollback does not restore R2 objects. If recovery requires it, recover database and media together from approved points and preserve private-object controls. Routine rollback must not delete a database, bucket, or production data.

## Readiness

This is the intended Railway release path, not evidence that Railway, Neon, R2, domain routing, backups, or production acceptance are configured or tested. Gate production launch on service setup, recovery evidence, and the checks above.
