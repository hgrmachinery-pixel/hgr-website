# Backup and Restore Procedure

## Current owner gate status — 2 October 2026

The owner confirmed that the isolated recovery target remains an unresolved deployment item. No target, operator, isolation evidence, or restore approval is recorded. Do not access or write to any live environment, and do not provision or purchase a recovery resource. SAFE-03 target checks and SAFE-05 restore proof remain pending until an existing disposable PostgreSQL/object-storage target and its approval evidence are supplied.

This provider-neutral procedure is a template for a future, owner-approved recovery rehearsal. It is not evidence that a backup exists or that a restore has succeeded. All target names, operators, schedules, retention periods, providers and access details remain **TO CONFIRM**.

## Safety rules

- Use synthetic representative content only. Do not copy customer records, real machine documents, private originals, production database contents or production object data into a rehearsal.
- Do not begin until the owner has identified and approved the exact existing disposable database, object-storage resource, application target and operator. Provisioning or selecting a paid resource is outside this procedure.
- Before any database or object command, verify the resolved endpoint and resource identity against the approved disposable target. **Stop** if an endpoint is production, unknown, shared with production, or cannot be independently verified. Never rely on a hostname, environment name or command prompt alone.
- Use dedicated recovery configuration values. Do not fall back to `DATABASE_URL`, production application settings, default credentials or a shell profile that may point elsewhere.
- Keep outbound email, analytics tags and other external calls disabled. Do not enter secrets in this document, source control, shell history or logs.
- Never restore rehearsal data onto production. Never make a private original public as part of verification.

## TO CONFIRM before rehearsal

| Item | Owner decision |
|---|---|
| Approved disposable database and object-storage identities, and how their identities are verified | TO CONFIRM |
| Named operator and least-privilege backup/restore permissions | TO CONFIRM |
| Backup schedule, retention, encryption and approved backup location | TO CONFIRM |
| Protected configuration recovery process and authorized secret custodian | TO CONFIRM |
| Synthetic fixture set and expected record/object counts | TO CONFIRM |
| Recovery time and recovery point objectives | TO CONFIRM |
| Approval to conduct the specific live restore rehearsal | TO CONFIRM |

## Capture a matched recovery point

1. Confirm this rehearsal is using a synthetic-only disposable dataset and has no connection to production data or resources.
2. Record a unique capture ID and UTC capture time in the rehearsal record. Record the deployed source revision, migration revision, and fixture-set revision that describe the data shape and expected contents.
3. Pause synthetic writes or use an approved quiesced snapshot procedure so database records and object changes refer to one consistent capture point. Record the resulting capture ID beside every database and object backup artifact. If the object provider cannot produce or verify a matching point, **stop**; do not claim the pair is consistent.
4. Create a PostgreSQL logical backup using the approved disposable source connection only. A typical portable command shape is:

   ```sh
   pg_dump --format=custom --no-owner --no-acl \
     --dbname="$RECOVERY_SOURCE_DATABASE_URL" \
     --file="$RECOVERY_ARTIFACT_DIR/$RECOVERY_CAPTURE_ID.dump"
   ```

   Before running it, verify that `RECOVERY_SOURCE_DATABASE_URL` resolves to the exact approved disposable database. Do not substitute `DATABASE_URL`. Use an already-installed, reviewed PostgreSQL client; package installation is not part of this procedure.
5. Export or snapshot each object class separately, using the provider's approved versioning/snapshot mechanism. Record object keys or immutable version identifiers, sizes and checksums in a manifest without exposing private URLs. Associate the manifest with the same capture ID and time as the database backup.
6. Back up protected environment configuration through the separately approved secret-management process. Record only the configuration revision or recovery reference, never secret values. Keep the restored application configuration isolated from production.
7. Verify artifact readability, checksums and the recorded capture ID. Restrict artifacts to least-privilege access and the owner-confirmed retention policy (**TO CONFIRM**).

## Data and object classes

Recover these inputs as a matched set while preserving their separate privacy classes:

| Input | Recovery treatment |
|---|---|
| PostgreSQL records | Restore the logical database into a new, isolated disposable database. Preserve the synthetic records and their relationships. |
| Structured Payload content | Included in PostgreSQL; verify its records against the fixture revision and the application/migration source revision. |
| Public machine-photo masters and generated responsive derivatives | Recover from their public-media object class and compare the restored manifest/checksums with the recorded capture. Keep masters staff-only according to current application permissions. |
| Private original machine documents | Recover only into the private object class with the same or stricter access controls. Never copy them into a public bucket or expose a public URL. |
| Approved public redacted documents | Recover as separate derivatives only when the synthetic fixture explicitly includes an approved public copy. Do not derive approval from the backup itself. |
| Protected configuration | Retrieve through the approved secret custodian into isolated recovery configuration. Exclude production credentials, production destinations and unreviewed analytics identifiers. |
| Application and migration source | Check out the exact recorded source revision and migration revision. Do not silently use a newer schema/application version with the captured data. |

## Restore into isolation

1. Reconfirm approval for this exact rehearsal and re-verify that the destination database and object resource are disposable, isolated and not production. **Stop before any restore command** if the identity or isolation is uncertain.
2. Create or identify a fresh empty disposable restore database and isolated object namespace through the approved operator procedure (**TO CONFIRM**). Do not overwrite an existing database or object set as a shortcut.
3. Restore the database archive using the recovery-only connection. For example:

   ```sh
   pg_restore --exit-on-error --no-owner --no-acl \
     --dbname="$RECOVERY_RESTORE_DATABASE_URL" \
     "$RECOVERY_ARTIFACT_DIR/$RECOVERY_CAPTURE_ID.dump"
   ```

   Verify `RECOVERY_RESTORE_DATABASE_URL` against the approved isolated restore target immediately before running the command. Never point it at `DATABASE_URL` or production.
4. Restore the object manifest into the corresponding isolated object classes. Preserve object versions/checksums and access classifications; do not make originals public during or after transfer.
5. Apply only the migration/source revision recorded for the capture, following the approved disposable-target procedure. Do not run migrations against production or an unverified resource.
6. Load only isolated runtime configuration. Confirm outbound email, analytics/marketing tags and other external integrations remain disabled, and confirm no production API, database, storage or domain endpoint is configured.

## Recovery checks

Record pass/fail results against the capture ID without recording customer data or secret values.

- Database archive restores without errors; expected synthetic record counts and relationships match the fixture and capture manifest.
- Application source and schema migration revisions match the recorded capture. Payload structured content can be read and edited in the isolated environment.
- Public photo objects and responsive derivatives match their manifest and remain connected to the expected synthetic machine records.
- Private originals remain private and inaccessible to anonymous requests. A redacted public derivative, if present in the synthetic fixture, remains a distinct object and follows the current approval/access rules.
- Anonymous access still rejects drafts, private fields, private originals and unapproved media; approved derivative behavior and private `no-store` responses remain intact.
- Owner and website-administrator permissions retain the same separation as before the restore. Do not create real staff accounts or copy production identities for this rehearsal.
- No outbound email, analytics tags or other external calls were emitted. Confirm the application's visible environment/configuration indicators and inspect only safe request metadata.
- The restore environment remains non-indexable and separately protected by its host access controls. Crawler directives such as `noindex` or `robots.txt` are not authentication or cache controls.

## Stop, rollback and report

- Stop immediately if a source or destination identity cannot be verified, production is detected, an artifact is missing or mismatched, private data appears in a public class, permissions differ, or an external call is enabled.
- Keep the source backups unchanged. Isolate the disposable restore environment and follow the owner-approved cleanup procedure (**TO CONFIRM**); do not run broad deletion commands or delete shared resources.
- Record the capture ID, source/migration revisions, isolated target identifiers, operator, checks, discrepancies and stop reason. Do not include secret values, private object URLs or real customer/machine documents.
- Report success only after all checks pass and the authorized reviewer accepts the evidence. A written procedure, a successful database restore alone, or a local test does not prove a complete live database-plus-object recovery.

## Pending external acceptance

The staging host authentication/cache check (SAFE-03) and an owner-approved live restore rehearsal (SAFE-05) remain open. No production endpoint, resource, account, provider, target, schedule, retention period or credential has been selected by this document.
