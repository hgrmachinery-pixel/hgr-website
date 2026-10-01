# Phase 3 Plan 04: Service and Migration Readiness

## Local migration and authorization review

- Payload migration generation ran locally with synthetic environment values. The installed `migrate:create` command disables database connection; no database or storage service was contacted.
- Generated migration and Payload schema snapshot: `src/migrations/20261001_171946_phase3_media_documents.ts` and `.json`; registered in `src/migrations/index.ts`.
- Payload types were regenerated from the local schema. `src/payload-types.ts` was already in sync and did not need a change.
- The migration seeds stable Owner and Website Administrator roles and grants `Approve Public Documents` initially to Owner. Existing users map only from exact legacy role values; unknown roles abort. Existing media needing invented identifiers, digests, reviews, or actors aborts migration.
- The migration creates `hgr_machine_photo_seq`, which the photo upload hook consumes; rollback drops it only after the locked empty-history/representability preflight.
- Role and account administration checks fresh persisted Owner authority, separately from the document approval permission. Bootstrap and last-Owner changes serialize on the persisted Owner role. Permission values are checked by their `{ name }` shape.
- Audit history receives UPDATE/DELETE and TRUNCATE guards. The down migration takes ACCESS EXCLUSIVE locks and checks refusal conditions before destructive statements; it has no `CASCADE`. It refuses populated or nonrepresentable history/records and unsupported role assignments/grants.
- Review of the installed Payload migration runner confirms down migration runs inside its transaction. No migration has been applied; database push remains disabled.
- **Review boundary:** local static review and contract tests are complete. PostgreSQL parsing, actual apply/rollback, locking and trigger behavior remain unverified because no exact owner-approved disposable database target was provided. This readiness record does not imply migration approval.

## Live service checks

**Status: pending; public delivery remains disabled.** No owner-approved existing isolated disposable PostgreSQL and GCS-compatible targets are available in saved project state. Do not connect to an unknown target or apply this migration.

The following checks remain pending against exact owner-approved existing disposable targets:

- Migration apply and rollback behavior, including refusal/preservation with populated audit history.
- Installed Payload/GCS authorization for private originals, pending revisions, approved derivatives, direct-object denial and withdrawal of a previously eligible revision.
- Cache behavior for success, denial and range responses through actual installed handlers.
- A real browser upload-progress acceptance run using a synthetic image.

`HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` remains unset/default-denied. Photo and document byte delivery must not be enabled until the approved live checks pass.

## Deferred operational inputs

- Exact existing isolated disposable PostgreSQL and GCS-compatible targets, if/when provided and approved for specific verification operations.
- GCS ACL versus Uniform Bucket-Level Access decision.
- Approved HGR watermark artwork and placement defaults.
- Accepted document formats and the human redaction/review operating procedure.
- Per-file and batch upload limits.
- Retention and derivative regeneration policy.

No production or infrastructure changes, purchases, real private documents, public document display or Phase 4 work were performed.

## Local checks completed

- `npm run typecheck` — passed.
- `node --test tests/machine-access.test.mjs tests/phase3-migration.test.mjs tests/asset-audit.test.mjs tests/machine-media.test.mjs tests/machine-documents.test.mjs` — 38 passed.
- `npm run build` — passed with synthetic environment only; no database or GCS service contacted.
- `git diff --check HEAD` — passed (line-ending warnings only).
- Payload type generation — passed using synthetic configuration only.
