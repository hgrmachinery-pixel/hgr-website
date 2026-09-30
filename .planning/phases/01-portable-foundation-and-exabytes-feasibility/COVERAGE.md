# API Coverage — Payload GCS storage adapter / Google Cloud Storage

> Full coverage by default within the external-media capability needed by the Phase 1 foundation. This is an operation-level scope for the Payload GCS adapter, not a claim to implement every Google Cloud Storage product feature.

| capability | decision | reason |
|---|---|---|
| Configure adapter with server-side GCS bucket, credentials, and endpoint | INTEGRATE | Selects external storage without embedding host-specific values in source. |
| Store uploaded original bytes as an object | INTEGRATE | Required to prove media remains outside the application host. |
| Store the processed responsive image derivative as an object | INTEGRATE | The representative upload path includes one generated size. |
| Resolve public URLs and retrieve original/derivative objects | INTEGRATE | Required for public fixture output and restart-persistence checks. |
| Delete the synthetic test object during fixture cleanup | INTEGRATE | Required to clean up the disposable test data without touching unrelated objects. |
| Enumerate bucket contents or perform general bucket administration | OPT-OUT | Phase 1 needs only the known test object's lifecycle; bucket administration is outside the application slice. |
| Configure IAM, accounts, bucket policy, retention, CORS, CDN, or signed URLs | OPT-OUT | These need cloud/account decisions; no cloud resource or policy changes are authorized. |
| Resumable, multipart, or parallel large-object upload | OPT-OUT | The representative test uses one small generated PNG; large production batch behavior belongs to later media work. |
| Versioning, archival/retention, replication, or disaster recovery | OPT-OUT | Backup, recovery, retention, and production operations belong to later phases. |
| Notifications, Pub/Sub, analytics, and inventory reporting | OPT-OUT | The foundation has no event-driven or reporting requirement. |
| Other GCS features outside upload, derivative storage, delivery, and cleanup | OPT-OUT | Outside the Phase 1 architecture path; no stated need justifies added scope/configuration. |
