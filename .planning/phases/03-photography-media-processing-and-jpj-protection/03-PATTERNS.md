# Phase 3: Photography, media processing and JPJ protection - Pattern Map

**Mapped:** 2026-10-01
**Files analyzed:** 15 likely file groups
**Analogs found:** 13 / 15 (Roles and append-only audit persistence have partial analogs)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/collections/MachineMedia.ts` | model / upload collection | file-I/O, CRUD | same file | exact extension point |
| `src/collections/MachineImageDerivatives.ts` (proposed) | model / upload collection | file-I/O, CRUD | `src/collections/MachineMedia.ts` | role-match; public readiness gates are new |
| `src/collections/MachineDocuments.ts` (proposed) | model / upload collection | file-I/O, CRUD | `src/collections/MachineMedia.ts`, `src/collections/Users.ts` | role-match; document approval is new |
| `src/collections/Machines.ts` | model / collection | CRUD, request-response | same file | exact extension point |
| `src/collections/Roles.ts` (proposed) and `src/collections/Users.ts` | model / permission config | CRUD, request-response | `src/collections/Users.ts` | partial; roles collection is new |
| `src/lib/machines/access.ts` | utility / policy | request-response | same file | exact extension point |
| `src/lib/machines/permissions.ts` (proposed) | utility / policy | request-response | `src/lib/machines/access.ts` | role-match; current role permission resolution is new |
| `src/lib/machines/media.ts` (or focused media modules) | utility / transform | transform, file-I/O | same file | role-match; derivative pipeline is new |
| `src/lib/machines/publicProjection.ts` | utility / transform | transform | same file | exact extension point |
| `src/app/api/media/[...path]/route.ts` (only if Payload access cannot express full checks) | route | request-response, file-I/O | `src/app/api/preview/route.ts` | role-match; media delivery is new |
| Payload Admin collection edit-view Publish/Preview controls (proposed component files) | component / action | request-response | installed Payload `PublishButton` contract; `src/app/api/preview/route.ts` | framework hook exists; project workflow is new |
| `src/collections/AssetAuditEvents.ts` (proposed) | model / audit log | event-driven, CRUD | `src/collections/Users.ts` (server-stamped hook); migration SQL | partial; append-only log is new |
| `src/payload.config.ts` | config | request-response, file-I/O | same file | exact extension point |
| `src/migrations/<generated phase 3 migration>.ts`, `src/migrations/index.ts` | migration / registry | batch, schema transform | `src/migrations/20261001_080057_phase2_machines.ts`, `src/migrations/index.ts` | role-match |
| `tests/machine-media.test.mjs`, `tests/machine-documents.test.mjs`, `tests/machine-access.test.mjs` | test | transform, request-response, file-I/O | `tests/machine-model.test.mjs`, `tests/machine-access.test.mjs` | role-match |

These are likely planning paths inferred from CONTEXT/RESEARCH; the planner should settle exact names. Do not create a separate service, provision storage/database, or use real JPJ/ownership files in local validation. Preserve D-01 through D-11 as approved decisions.

## Pattern Assignments

### `src/collections/MachineMedia.ts` (private photo master, file-I/O)

**Analog:** current tracked file, lines 1-47. It is already the staff-only original boundary. Preserve staff-only reads and external storage; do not switch master records or source object URLs to public access.

**Imports and access** (lines 1-4, 13-18):

```typescript
import type { CollectionConfig } from "payload";
import { denyAccess, staffAccess } from "../lib/machines/access";
import { generatedMachineImageName } from "../lib/machines/media";

access: {
  create: staffAccess,
  read: staffAccess,
  update: staffAccess,
  delete: denyAccess,
},
```

**Upload and metadata** (lines 19-47):

```typescript
hooks: {
  beforeOperation: [({ operation, req }) => {
    if (operation === "create" && req.file) {
      req.file.name = generatedMachineImageName(req.file.mimetype);
    }
  }],
},
upload: {
  disableLocalStorage: true,
  filesRequiredOnCreate: true,
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  pasteURL: false,
  imageSizes: [],
},
fields: [
  { name: "machine", type: "relationship", relationTo: "machines", required: false, index: true },
  { name: "altText", label: "Alternative Text", type: "text", maxLength: 250 },
],
```

Extend the record with typed category and human-review state while preserving its identity across reorder. A stable photo sequence/name must not derive from current gallery position. Keep factual alt text separate from filename. The current random-name helper (`src/lib/machines/media.ts:1-14`) is a safe anti-uploader-filename baseline but does not yet encode machine/category/sequence; phase work must implement the locked derivative naming rule.

### `src/collections/MachineImageDerivatives.ts` (proposed, public derivative)

**Analog:** `src/collections/MachineMedia.ts:6-47` for upload collection structure; `src/lib/machines/access.ts:19-25` for anonymous published/non-archived filtering.

Derivatives must be separate records from source masters. Reuse Payload upload collection conventions (`disableLocalStorage`, explicit MIME types, `pasteURL: false`) and attach machine, source master/photo identity, category, stable sequence, processing state and explicit publication approval. Public authorization must also establish same-machine ownership, ready state, approved use, and a currently Published/non-archived machine. If collection access cannot safely make that cross-record check, retain denied collection access and mediate delivery through a narrow server route. Never expose a master to make its derivative work.

### `src/collections/MachineDocuments.ts` (proposed, private sensitive records)

**Analogs:** `src/collections/MachineMedia.ts:13-32` for private upload policy; `src/collections/Users.ts:34-57` for server-enforced access; `src/collections/Users.ts:58-88` for immutable/auditable lifecycle fields.

Use a distinct collection and private storage prefix for originals, private previews, and pending redacted copies. Anonymous create/read/update/delete must all deny; authorized staff read/write checks use `staffAccess`, and destructive access should stay denied by default. The document state should distinguish availability approval from derivative file-display approval. A public copy is a separate file/revision; replacement invalidates its previous approval. D-05 requires reviewer identity, revision-bound approval, and explicit owner display approval; D-06 leaves the approver role/person TO CONFIRM, so do not infer broader authority from the current two staff roles. Safe default is no public display.

### `src/collections/Machines.ts` (machine relations and publication validation)

**Analog:** same tracked file, lines 12-19, 83-155, and 262-273.

Current imports reuse centralized access helpers. Anonymous machine reads are constrained by `publishedMachineRead`; publishing merges partial update data with `originalDoc`, validates it in `beforeChange`, then rejects invalid publication. Current featured/gallery relations target `machine-media` and `machinePublicationErrors` checks a real featured/gallery reference. Change public eligibility to a ready, approved derivative belonging to that exact machine; retain the physical machine identity and separate `_status` from archive and Available/Reserved/Sold state. D-02 requires all 12 categories to remain optional except the suitable featured/general image. Reordering must update relationship order only, not identity or generated object name. D-07 requires review invalidation when a photo is replaced or serial visibility changes.

**Publication hook shape** (`src/collections/Machines.ts:136-155`):

```typescript
beforeChange: [async ({ data, operation, originalDoc }) => {
  if (operation === "update" && originalDoc) {
    const identity = originalDoc as MachineIdentity;
    if (data.hgrId !== identity.hgrId) throw new Error("A machine reference cannot be changed");
  }
  if (data._status === "published") {
    const publishingData = { ...(originalDoc ?? {}), ...data };
    const errors = machinePublicationErrors(publishingData);
    if (errors.length > 0) throw new Error(`Complete these fields before publishing: ${errors.join(", ")}.`);
  }
  return data;
}],
```

Do not trust the relationship submitted by the browser alone for same-machine ownership; resolve and validate through an authorized server-side path.

### `src/lib/machines/access.ts` (shared access helpers)

**Analog:** same tracked file, lines 9-25 and 34-42.

```typescript
export function isStaffUser(user: unknown): user is StaffUser {
  if (!user || typeof user !== "object") return false;
  const candidate = user as { collection?: unknown; role?: unknown };
  return candidate.collection === "users" &&
    (candidate.role === "owner" || candidate.role === "website-administrator");
}
export const staffAccess: Access = ({ req }) => isStaffUser(req.user);
export const denyAccess: Access = () => false;
export const publishedMachineRead: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { _status: { equals: "published" }, archived: { not_equals: true } };
```

Reuse the predicate for staff-only collections. Add narrowly named checks for derivative/document states only when they can enforce record relationships; a public page projection is not a substitute for collection/static-file authorization. Do not widen staff roles to grant document approval authority by assumption.

### `src/lib/machines/publicProjection.ts` (public allow-list)

**Analog:** same tracked file, lines 22-84.

It validates publication/archive/identity before constructing a fresh typed object, copies only explicitly permitted fields, and omits absent values. Extend this allow-list with approved derivative metadata and document availability/display state only; never spread a raw Payload document. Include no private original, private preview, pending/rejected copy, or private serial. Include redacted document URL only when both relevant approvals apply, display is enabled, and the currently linked file revision is the one approved. A changed photo or serial visibility must cause affected image review state to fail closed.

### Media filename and transform helpers

**Analog:** `src/lib/machines/media.ts:1-14`; `src/payload.config.ts:7,73-84`.

```typescript
const extensionByMimeType: Record<string, string> = {
  "image/avif": "avif", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
};
export function generatedMachineImageName(mimeType: string, identity = randomUUID()): string {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error("Unsupported machine image format");
  return `machine-image-${identity}.${extension}`;
}
```

Use the MIME allow-list and unsupported-format rejection as the starting validation pattern. New processing must read the unwatermarked master, auto-orient and resize/encode with configured Sharp, then create a distinct derivative. Watermark settings belong in central server config; keep treatment and supplied artwork unapproved until owner confirmation, and never alter the master. Batch uploads should report per-file progress/failure and permit retry; current `src/payload.config.ts:86-89` 5 MiB per-file cap with `abortOnLimit: true` is not approved as a final owner limit. Keep limits configurable and verify synthetic batches later.

### Conditional media delivery route

**Analog:** `src/app/api/preview/route.ts:1-26` for a narrow App Router handler and controlled response; generic Payload mount is `src/app/(payload)/api/[...slug]/route.ts:1-16`.

The research leaves route necessity conditional: first determine whether installed Payload collection/static access can enforce the full derivative-to-machine publication/readiness/approval check. If a route is needed, keep it small, resolve the file through server-side authorized Payload access, reject private/pending/unapproved records with non-cacheable denial, and stream only derivative bytes. Do not route private originals through Next image optimization or any public GCS URL. Ensure API, static URL, optimizer and shared-cache paths all deny private documents and pending copies. No current source analog implements secure asset streaming.

### `src/payload.config.ts` and GCS wiring

**Analog:** same tracked file, lines 1-14, 20-47, 49-61, 73-89.

```typescript
collections: [FoundationFixture, Users, Machines, MachineMedia, Pages],
db: postgresAdapter({
  pool: { connectionString: databaseURL },
  disableCreateDatabase: true,
  push: false,
  migrationDir: path.resolve(configDirectory, "migrations"),
}),
plugins: [gcsStorage({
  collections: { "foundation-fixtures": true, "machine-media": true },
  bucket: requiredEnvironment("GCS_BUCKET"),
  acl: "Private",
  options: { projectId: requiredEnvironment("GCS_PROJECT_ID"), apiEndpoint: process.env.GCS_ENDPOINT || undefined,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined },
})],
```

Register new collections and explicitly map storage classes/prefixes while retaining env-supplied settings, PostgreSQL, and `push: false`. Preserve private storage for originals and documents. Current ACL wiring and GCS adapter compatibility with Uniform Bucket-Level Access is an unresolved deployment checkpoint from RESEARCH; do not provision/configure a bucket here. Keep upload caps configurable and do not hard-code hosts or credentials.

### Generated migration and registry

**Analogs:** `src/migrations/20261001_080057_phase2_machines.ts` (tracked) and `src/migrations/index.ts` (tracked).

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`...`);
}
```

```typescript
import * as migration_20261001_080057_phase2_machines from "./20261001_080057_phase2_machines";
export const migrations = [{
  up: migration_20261001_080057_phase2_machines.up,
  down: migration_20261001_080057_phase2_machines.down,
  name: "20261001_080057_phase2_machines",
}];
```

Use Payload-generated schema changes, review the migration and rollback scope, then register it in the established index. Do not hand-run migrations against a non-disposable database; no database or storage service is available/approved for this phase.

### Focused tests

**Analogs:** `tests/machine-model.test.mjs:1-20,89-160,163-219`; `tests/machine-access.test.mjs` for access/route cases; `tests/foundation-config.test.mjs:5-35,80-109` for isolated config loading.

Tests import pure helpers directly and use `node:test`/`node:assert/strict`; configuration tests load the real Payload config in a spawned Node process with synthetic env values. Follow that shape for category/name/processing state, approval invalidation, publication eligibility, and projection tests. Exercise anonymous and staff collection access plus direct media/API/route paths for private originals, pending copies, changed revisions, unpublished/archived machines, and same-machine ownership. Test config declarations without requiring live services. Existing access tests are unit/config boundary tests; no real GCS or database integration is currently available.

### `src/collections/Roles.ts`, `src/collections/Users.ts`, and permission resolver

**Analogs:**

- `src/collections/Users.ts:5-5,34-57,58-88,90-103` for current staff role typing, access rules, role immutability, and admin fields.
- `src/lib/machines/access.ts:9-17` for a small centralized policy predicate.
- `src/collections/Machines.ts:27-44` for a trusted server helper using the Payload request and database transaction context.

Move role-specific authority into a persisted `Roles` collection with a generic permission-name list. Keep the account classification and permissions distinct: `Users.role` becomes a relationship to a Role record, and the initial Owner role record contains `Approve Public Documents`; Administrator does not. All authorization checks ask whether a named permission exists, never compare a role name. Resolve the current authenticated user and related role/permissions from the database for each sensitive publish/preview action; do not trust a potentially stale serialized `req.user` relation or a client-supplied role/permission. Scope that lookup to the authenticated user ID and use a single `hasPermission` helper. Seed/migration behavior must preserve the current first-owner bootstrap and assign no approval permission to Administrator. Keep role/permission editing owner-restricted; do not let an Administrator grant itself capabilities.

The existing `Users` rules provide only a fixed role field and should be extended rather than copied as the authorization model. The schema change follows the generated migration and registry patterns below. No existing project collection provides a scalable role-permission relation, so the data shape is a new model; the `Users` collection is only a structural analog.

### Permission-gated Admin actions and server publication transition

**Analog:**

- Installed Payload 3.90.2 `node_modules/payload/dist/collections/config/types.d.ts:284-287` (dependency source, not a tracked project analog): `PublishButton` replaces the Publish button and requires drafts.
- `src/collections/Machines.ts:136-155` for server-side `beforeChange` transition checks.
- `src/app/api/preview/route.ts:1-45` and `src/lib/machines/preview.ts:42-101` for authenticated, server-validated preview behavior.

Render one custom Publish action for a user with the `Approve Public Documents` permission; Administrators can continue upload, redact, save draft, and submit for Owner review. The custom button is only an affordance: enforce current DB-resolved permission and exact-revision human review again in the server-side publication transition and any custom handler. Deny direct REST, GraphQL, and Admin API attempts without permission. One successful Publish transition writes distinct `approved_by`/`approved_at` and `published_by`/`published_at` values and separate audit event types; derive user and timestamps server-side. A failure in authorization, validation, revision matching, or audit persistence must not make the item public. The installed declaration is under ignored `node_modules`; cite it as Payload implementation evidence, never as a tracked project source analog.

### Revision-bound private “Preview as Public”

**Analog:** `src/lib/machines/preview.ts:42-101` and `src/app/api/preview/route.ts:1-45`.

The existing preview helper authenticates a staff session, validates an expiring signed token, loads the selected machine with `overrideAccess: false`, rejects invalid/archived records, and returns private no-store responses. Reuse those concrete guard/response conventions for the redacted document preview, but do not use a public or bearer URL for sensitive bytes. Require the named permission, load the exact current redacted revision with access checks, and render/stream those bytes without changing publish or approval state. Both preview HTML and bytes must carry `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`; do not route them through Next image optimization/CDN or expose GCS signed URLs. The existing machine preview is not itself a document-byte preview, so the content streaming and exact revision checks remain new and require security review before real documents.

### `src/collections/AssetAuditEvents.ts` (proposed, immutable lifecycle log)

**Analogs:** `src/collections/Users.ts:58-88` for server-authoritative hook assignment and immutable role protection; `src/collections/Machines.ts:27-44` for reuse of Payload request transaction context; `src/migrations/20261001_080057_phase2_machines.ts` for SQL migration execution/rollback structure.

Append one event per upload, redaction, approval, publication, and modification, with target entity and exact revision, event type, authenticated actor ID, server time, and applicable D-11 fields. Use create-only semantics: deny normal API create/read as appropriate, always deny update/delete, and expose no editable actor/time fields. A narrow trusted append helper may use Payload Local API with `overrideAccess: true`; it must derive actor from `req.user`, ignore client-supplied audit data, and pass the same `req` to preserve request transaction context. Payload 3.90.2 `PayloadRequest.transactionID` is declared in `node_modules/payload/dist/types/index.d.ts:63-64`; the established project code reads that transaction and database session at `src/collections/Machines.ts:27-44`. This supports transaction reuse patterns but is not proof of rollback semantics; validate configured PostgreSQL failure atomicity before claiming it.

The approved request now explicitly calls for an immutable event ledger. Add a PostgreSQL trigger through the reviewed generated migration to reject `UPDATE` and `DELETE` on the event table (in addition to Payload access denial). The tracked phase-2 migration is the concrete SQL/rollback pattern, but no existing table trigger is an analog. Add both trigger creation and its scoped down-migration carefully; do not run the migration against an unapproved/non-disposable database. Database-owner/tamper-resistant immutability is still a separate security review boundary; a trigger blocks ordinary SQL mutation paths but a privileged database owner can disable it.

**Trigger SQL shape** (new; follow the SQL template string and `db.execute` in `src/migrations/20261001_080057_phase2_machines.ts`):

```sql
CREATE FUNCTION prevent_asset_audit_event_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'asset audit events are append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER asset_audit_events_immutable
  BEFORE UPDATE OR DELETE ON asset_audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_asset_audit_event_mutation();
```

This is a pattern sketch; align exact quoted table/function names with the generated schema and ensure the down migration drops the trigger and function in dependency order.

### Complete photo “Needs Review” workflow

**Analogs:** `src/collections/MachineMedia.ts:19-47` for upload hooks and metadata; `src/collections/Machines.ts:136-155` for server-side transition validation; `src/lib/machines/publicProjection.ts:32-84` for explicit public eligibility.

Every new photo revision starts exactly at `Needs Review`. Persist review outcome, checklist answers, reviewer identity/time, and the precise derivative revision or content digest reviewed. The human checklist covers manufacturer serials, chassis/VINs, engine numbers, registration numbers, QR codes, barcodes, customer labels, delivery information, personal information, and other sensitive identifiers. If anything appears, blur/crop into a new derivative revision and repeat the review; never modify the private master. A new/replaced/redacted revision resets the status to `Needs Review`; prior approval cannot carry forward. Uncertainty is escalated to Owner. AI may only suggest highlight regions; it cannot answer checklist fields, clear review, approve or publish. Only the human review step can move the exact revision beyond review, and D-07 requires serial-visibility changes to invalidate affected review state. There is no existing photo review UI/model, so these are workflow additions rather than copied code.

## Shared Patterns

### Access and privacy
**Sources:** `src/lib/machines/access.ts:9-25,34-42`; `src/collections/MachineMedia.ts:13-18`
**Apply to:** all three media/document collections, projection and any file handler.

Keep Payload access checks enabled, explicitly staff-gate masters and sensitive documents, and enforce public eligibility on the derivative itself. D-01 through D-11 remain controlling: private master versus separate derivative; all 12 categories with only suitable featured/general required; configurable watermark on derivatives; configurable limits and recoverable batches; revision-bound human review and document approval; generic named permission on persisted Roles; one Publish action and private exact-revision preview; private serial and readable-plate review invalidation; server-stamped separate audit events with append-only DB trigger.

### Machine relation and publication state
**Sources:** `src/collections/Machines.ts:83-155,262-273`; `src/lib/machines/publicProjection.ts:32-84`
**Apply to:** featured/gallery relations, derivative authorization, public data and publication validation.

Require same physical-machine relation and derivative readiness/approval, plus Published and non-archived parent, at the server boundary. `_status`, archive, and business stock status are separate. Public output is an allow-list.

### Portable storage and schema
**Sources:** `src/payload.config.ts:20-47,49-61,73-89`; `src/migrations/index.ts:1-9`
**Apply to:** storage collection registration and every schema change.

Use environment configuration and private GCS, explicit reviewed migrations, and no schema push. The Phase 3 migration also creates the Roles/audit schema and append-only event trigger; do not run it against an unapproved database. No service setup, real documents, or production changes are within this mapping task.

## No Analog Found

| File / capability | Role | Data Flow | Reason |
|---|---|---|---|
| Generic persisted `Roles` collection and assignment workflow | model / config | CRUD | Existing `Users` only has a fixed role select; no generic role-permission collection exists. |
| Separate image derivative collection and processing pipeline | model / utility | file-I/O, transform | Existing media is only a staff-only master; no distinct derivative pipeline exists. |
| Private JPJ document collection and revision-bound review | model / workflow | file-I/O, CRUD | No sensitive-document model, review state, or human approval flow exists. |
| Immutable asset audit event model / DB trigger | model / migration | event-driven, batch | No audit-event table or immutable-table trigger exists; follow collection and SQL migration structure only. |
| Per-file mobile upload progress/retry UI | component / utility | streaming, file-I/O | No custom upload interface or partial-batch retry exists. Use Payload admin patterns, then validate against current version. |
| Fully checked public media streaming route | route | request-response, file-I/O | Preview route is not a file streaming/security analog; route may be unnecessary if Payload can enforce every check. |

## Metadata

**Analog search scope:** `src/collections/`, `src/lib/machines/`, `src/app/api/`, `src/payload.config.ts`, `src/migrations/`, `tests/`, Phase 2 pattern map.
**Tracked paths verified:** every source analog named above is git-tracked.
**Pattern extraction date:** 2026-10-01

