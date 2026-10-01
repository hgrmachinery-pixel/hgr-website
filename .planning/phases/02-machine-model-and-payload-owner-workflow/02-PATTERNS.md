# Phase 2: Machine model and Payload owner workflow - Pattern Map

**Mapped:** 2026-10-01  
**Files analyzed:** 8 likely file groups  
**Analogs found:** 7 / 8 (several are partial; see no-analog section)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/collections/Machines.ts` | model / collection | CRUD, request-response | `src/collections/FoundationFixture.ts` | role-match, fake-only; not suitable as-is |
| `src/collections/Users.ts` (or staff auth collection) | model / auth collection | request-response | `src/migrations/20260930_235704_foundation.ts` (`users` schema) and fixture auth checks | partial |
| `src/collections/MachineMedia.ts` | model / upload collection | file-I/O | `src/collections/FoundationFixture.ts` | role-match, fake-only; adapt storage policy |
| `src/payload.config.ts` | config | request-response, file-I/O | `src/payload.config.ts` current config | exact extension point |
| `src/migrations/<generated phase migration>.ts` and `src/migrations/index.ts` | migration | batch / schema transform | `src/migrations/20260930_235704_foundation.ts`, `src/migrations/index.ts` | role-match |
| `src/app/api/preview/route.ts` (or equivalent protected preview route) | route / controller | request-response | `src/app/(payload)/api/[...slug]/route.ts` | role-match for App Router shape; no protected preview analog |
| `src/lib/machines/publicProjection.ts` (or equivalent) | utility / transform | transform | none | no analog |
| `tests/machines*.test.mjs`, `tests/payload-config*.test.mjs` | test | transform, request-response | `tests/foundation-config.test.mjs` | role-match for config assertions; no machine-specific tests |

Names outside the currently tracked files are inferred from `02-RESEARCH.md`; planner should align exact filenames with the agreed implementation layout. The existing admin mount already renders the configured Payload Admin and needs no parallel custom admin route (`src/app/(payload)/admin/[[...segments]]/page.tsx:1-15`).

## Pattern Assignments

### `src/collections/Machines.ts` (model / collection, CRUD)

**Analog:** `src/collections/FoundationFixture.ts` (tracked; synthetic-only, do not publish or promote as inventory).

**Imports and access** (lines 1-4):

```typescript
import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req: { user } }) => Boolean(user);
```

**Collection/admin/access structure** (lines 5-22):

```typescript
export const FoundationFixture: CollectionConfig = {
  slug: "foundation-fixtures",
  labels: {
    singular: "Synthetic foundation fixture",
    plural: "Synthetic foundation fixtures",
  },
  admin: { useAsTitle: "title", description: "Fake, disposable test content only." },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
```

For Machines, replace public-read behavior with a server-enforced published/non-archived query for anonymous reads; let authenticated staff read drafts and archived records. Deny routine delete and duplication so HGR identity and URL history remain attached to the physical unit. Keep Stock Status independent of Payload `_status`; use Payload draft versions for Draft/Published and a separate archive marker/state.

**Field validation shape** (lines 37-44):

```typescript
fields: [
  {
    name: "title",
    type: "text",
    required: true,
    maxLength: 120,
  },
],
```

Use typed/select/number/date fields with server-side cross-field validation. HGR ID must be allocated permanently and uniquely in the database, not calculated from mutable brand/model/year/serial fields. Validate required publication facts at publish time while allowing incomplete drafts. Keep Year of Manufacture and Registration Date distinct. For RM price, ensure Contact for Price cannot serialize an absent amount as zero.

**Serial field access pattern:** no serial-number field analog exists in source. Follow the Payload field access model documented in RESEARCH.md: staff-only update; deny anonymous read unless the independent public-visibility flag is explicitly true; default that flag false. Also omit serial from public projections by default.

### `src/collections/Users.ts` (auth model, request-response)

**Analogs:** `src/collections/FoundationFixture.ts:3,17-22` for the authenticated predicate/write gate; `src/migrations/20260930_235704_foundation.ts:34-54` for Payload's generated user/session/reset schema shape.

The current migration demonstrates that Payload creates session rows and reset-token/lockout columns for an auth collection. Do not hand-build password storage, reset tokens, or session logic. Configure one protected Payload auth collection for the two separate owner/admin accounts unless an approved role distinction requires additional access rules. Disable public account creation; use a controlled first-account bootstrap and protected staff workflow. Do not place real bootstrap credentials in source, tests, or migrations. Email-provider wiring is out of phase; preserve Payload's reset workflow but leave delivery verification pending.

### `src/collections/MachineMedia.ts` (model / upload collection, file-I/O)

**Analog:** `src/collections/FoundationFixture.ts` (lines 23-36).

**Upload controls and image derivative pattern** (lines 23-36):

```typescript
upload: {
  disableLocalStorage: true,
  filesRequiredOnCreate: true,
  mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  pasteURL: false,
  imageSizes: [{ name: "card", width: 640, withoutEnlargement: true }],
  adminThumbnail: "card",
},
```

Reuse the external-storage seam and strict media type/upload constraints as appropriate. The fixture is explicitly synthetic and its access/public delivery choices must not be copied blindly. Phase 2 only needs a real media reference that supports publication validation (selected featured image plus at least one gallery image); structured photography categories, advanced derivatives, watermarks, and private JPJ document workflows are Phase 3. Never route private documents through a public machine-media collection.

### `src/payload.config.ts` (config, request-response and file-I/O)

**Analog:** same tracked file; existing integration point.

**Imports and collection registration** (lines 1-10, 49-61):

```typescript
import { postgresAdapter } from "@payloadcms/db-postgres";
import { gcsStorage } from "@payloadcms/storage-gcs";
import { buildConfig } from "payload";
import sharp from "sharp";
import { FoundationFixture } from "./collections/FoundationFixture";

export default buildConfig({
  serverURL: origin.origin,
  csrf: [origin.origin],
  collections: [FoundationFixture],
  secret,
  sharp,
  db: postgresAdapter({
    pool: { connectionString: databaseURL },
    disableCreateDatabase: true,
    push: false,
    migrationDir: path.resolve(configDirectory, "migrations"),
  }),
```

Extend the collection list and GCS collection mapping with the agreed staff, machine, and public media collections. Preserve required environment validation, origin/CSRF handling, `push: false`, explicit migrations, and environment-configured storage. Do not add service credentials or hard-coded hosts.

### `src/migrations/<generated phase migration>.ts` and `src/migrations/index.ts` (migration, batch)

**Analogs:** `src/migrations/20260930_235704_foundation.ts`, `src/migrations/index.ts`.

**Migration signature and SQL** (`20260930_235704_foundation.ts:1-4`):

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "foundation_fixtures" (
```

**Migration registration** (`src/migrations/index.ts:1-9`):

```typescript
import * as migration_20260930_235704_foundation from "./20260930_235704_foundation";

export const migrations = [
  {
    up: migration_20260930_235704_foundation.up,
    down: migration_20260930_235704_foundation.down,
    name: "20260930_235704_foundation",
  },
];
```

Generate migrations from the Payload config, review generated SQL and register through the existing migration index convention. Keep rollback behavior scoped to the newly added schema. Never apply migrations against an unknown/non-disposable database: PostgreSQL is unavailable for this phase, and config explicitly disables schema push.

### `src/app/api/preview/route.ts` (route, request-response)

**Analog:** `src/app/(payload)/api/[...slug]/route.ts:1-16` for Next App Router/Payload route conventions. It is a generic REST mount, not a secure preview route.

```typescript
import config from "@payload-config";
import { REST_GET, REST_POST, REST_DELETE, REST_PATCH, REST_PUT, REST_OPTIONS } from "@payloadcms/next/routes";

export const GET = REST_GET(config);
export const POST = REST_POST(config);
```

For the preview endpoint, use a dedicated server route that validates the authorized Payload session and an unguessable server-side preview secret before enabling Next.js Draft Mode and redirecting to the requested machine path. Reject malformed paths and unauthenticated/invalid requests. The preview link hook itself has no codebase analog; RESEARCH.md’s official-doc example is a starting shape only. Ensure public route resolution continues to read published records only.

### `src/lib/machines/publicProjection.ts` (utility, transform)

**Analog:** none. No public machine read/projection code exists yet.

Use an explicit allow-list projection from an authorized published machine document. Omit absent optional facts rather than manufacturing defaults; include serial only when explicitly approved, and never expose hidden price as zero. Keep Draft/Archived records out of the public projection and keep Reserved/Sold public with stock badges when published. Build the durable route from the immutable HGR identity plus readable slug; do not allow the slug alone to become identity.

### Phase 2 Payload and machine tests (test, request-response / transform)

**Analog:** `tests/foundation-config.test.mjs` (lines 1-35, 80-109).

**Isolated config loading pattern** (lines 5-35):

```javascript
const fakeEnvironment = {
  DATABASE_URL: "postgresql://localhost/disposable_foundation_test",
  PAYLOAD_SECRET: "synthetic-test-secret-with-at-least-32-characters",
  SERVER_URL: "http://localhost:3000",
  GCS_PROJECT_ID: "synthetic-foundation-test",
  GCS_BUCKET: "synthetic-foundation-test",
};

function loadConfig(overrides = {}, assertions = "") {
  return spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", /* import config and assert */], {
    cwd: process.cwd(), encoding: "utf8",
    env: { ...process.env, ...fakeEnvironment, ...overrides }, timeout: 30000,
  });
}
```

**Config/access assertions** (lines 80-95): the test imports the actual config, finds a configured collection, invokes its access functions for anonymous and synthetic authenticated users, and asserts upload restrictions. Follow this for synchronous Payload configuration assertions without a live database. Add pure unit tests for HGR identity/slug rules, publication validation, independent stock state, price modes, and public projection. Keep live auth, preview, and database uniqueness tests behind the approved disposable integration boundary; PostgreSQL, media, and email integration were not available during this mapping.

## Shared Patterns

### Payload config and portable services
**Source:** `src/payload.config.ts:12-47,49-73`  
**Apply to:** collection registration, auth, media storage and migration setup.

Required server environment values are checked before config construction; URL protocol/credentials and secret length are validated. Keep database and storage endpoints environment-supplied, PostgreSQL-only, and migration-controlled (`push: false`).

### Staff access and public exposure
**Source:** `src/collections/FoundationFixture.ts:3,17-22`; `tests/foundation-config.test.mjs:80-95`  
**Apply to:** machine reads/writes, media access, sensitive fields and admin-only lifecycle records.

The fixture uses an authenticated-user predicate on mutations and tests both anonymous and authenticated access. For Machines, replace its deliberately-public read rule with publication/archive-filtered anonymous access. Enforce sensitive-field read/update rules at Payload level, then use an explicit public allow-list as a second boundary.

### Upload constraints and image processing
**Source:** `src/collections/FoundationFixture.ts:23-36`; `src/payload.config.ts:75-78`; `tests/foundation-config.test.mjs:95-105`  
**Apply to:** MachineMedia only in this phase.

The fixture disables local storage, rejects pasted URLs, allows selected image MIME types, generates a 640px thumbnail, and the config caps file size and aborts over-limit uploads. Tests assert configuration and demonstrate Sharp resizing. Keep Phase 2's image references simple; detailed gallery categories and processing policy belong to Phase 3.

### Explicit migration boundary
**Source:** `src/payload.config.ts:55-61`; `src/migrations/index.ts:1-9`; `tests/smoke-environment.test.mjs:36-77`  
**Apply to:** schema changes and any integration smoke validation.

Database schema changes use registered Payload migrations with automatic push disabled. Existing smoke tests require an explicit disposable acknowledgement and isolate child-process environment from inherited production credentials; do not weaken this boundary to exercise Phase 2 schema.

## No Analog Found

| File / capability | Role | Data Flow | Reason |
|-------------------|------|-----------|--------|
| `src/lib/machines/publicProjection.ts` | utility | transform | No public machine projection or inventory route exists yet. |
| Protected Next.js draft preview handler | route | request-response | Existing API route is Payload's generic REST mount only; no preview/session authorization flow exists. |
| Machine-specific access and publishing validation | collection behavior | CRUD | Fixture is synthetic and permits public reads; it has no draft/version or cross-field publish rules. |
| Machine identity allocator | utility/model behavior | CRUD / database allocation | No existing sequence or permanent business-ID allocator exists. |

## Metadata

**Analog search scope:** `src/collections/`, `src/app/(payload)/`, `src/migrations/`, `tests/`, Payload config.  
**Tracked paths verified:** every source analog listed above returned non-empty from `git ls-files -- <path>`.  
**Pattern extraction date:** 2026-10-01
