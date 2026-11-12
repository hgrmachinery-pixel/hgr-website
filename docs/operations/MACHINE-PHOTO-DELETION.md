# Machine photo deletion and object cleanup

Machine Images allow staff to delete one record at a time. Bulk deletion is disabled in Admin and rejected by the collection hook, including requests that bypass Payload access checks. Unpublish the owning machine and remove the photo from any other published machine before deleting it.

Deleting a master queues its original file and responsive files, then removes its linked derivative records and their files. Deleting a derivative affects only that derivative. Existing relational constraints clear Featured Image references and remove gallery relationships. Published machine references are checked before the transaction proceeds.

R2 object keys are recorded in `machine_media_deletion_jobs` in the same database transaction as the record deletion. The default Payload storage hook is prevented from attempting an early best-effort delete. The worker deletes only exact queued keys in the configured `R2_BUCKET`; S3 DeleteObject is safe to repeat. Failed attempts retain a sanitized error code and are retried with exponential backoff. A five-minute lease lets a later worker resume a job after process interruption.

Enable `HGR_MEDIA_CLEANUP_WORKER_ENABLED=true` only in an application server after the cleanup table migration has been applied. The worker is off by default, does not run during production builds, and uses the existing R2 credentials already configured for the storage adapter. Do not enable it before verifying the service's staging bucket mapping.

The durable asset audit collection does not currently define a `deleted` event type. Deletions are therefore recorded as `modified` with a unique event key containing `:deleted:`. This preserves append-only audit history without changing the audit enum or adding another migration. Inline history stored on the deleted media row is removed with that row; the permanent audit event remains.

The cleanup-job table is operational state, not an audit ledger. Keep completed entries until the retention policy is reviewed. A rollback refuses while jobs are pending.
