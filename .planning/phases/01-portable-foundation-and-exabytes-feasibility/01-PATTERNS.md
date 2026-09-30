# Phase 1: Portable foundation and Exabytes feasibility - Pattern Map

**Mapped:** 2026-09-30  
**Files analyzed:** 16 proposed files/areas  
**Analogs found:** 0 / 16 application files

## File Classification

The repository has no application scaffold. The paths below are inferred from the phase decisions and the proposed structure in `01-RESEARCH.md`; they are planning targets, not files already present. Documentation targets under `docs/deployment/` are intentionally described by purpose because research does not prescribe final filenames.

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` and package lockfile | config | request-response | None | none |
| `tsconfig.json` | config | transform | None | none |
| `next.config.mjs` | config | request-response | None | none |
| `payload.config.ts` | config | CRUD | None | none |
| `collections/FoundationTest.ts` (minimal fake record) | model | CRUD | None | none |
| `collections/FoundationUploads.ts` (synthetic upload) | model | file-I/O | None | none |
| `app/(payload)/admin/[[...segments]]/page.tsx` and Payload API route | route | request-response | None | none |
| `app/(site)/page.tsx` (public fake-record output) | component | request-response | None | none |
| `compose.yaml` (disposable PostgreSQL and optional GCS emulator) | config | event-driven | None | none |
| `.env.example` | config | transform | None | none |
| `.gitignore` (application additions, if required) | config | transform | `.gitignore` (root) | role-match; config only |
| `scripts/smoke-foundation.*` or package smoke command | utility | batch | None | none |
| Synthetic test image/fixture | utility | file-I/O | None | none |
| `README.md` or local setup guide | documentation | request-response | None | none |
| `docs/deployment/` portable rebuild/redeploy guide | documentation | request-response | None | none |
| `docs/deployment/` Exabytes evidence/results record | documentation | request-response | None | none |

## Pattern Assignments

### Application foundation: package manifest, TypeScript, Next.js and Payload configuration

**Analog:** None. No application package manifest, routes, TypeScript config, Next.js config, or Payload config exists in tracked source.

**Research direction (not a repository pattern):** `01-RESEARCH.md` sections “Standard Stack” and “Recommended Project Structure” propose an App Router Next.js application with Payload mounted in the same app, the official PostgreSQL adapter, and the official GCS storage adapter. Resolve exact compatible dependency versions at implementation time; research reports registry versions were not verified. Do not treat this recommendation as an existing code excerpt.

### Test record, upload collection, and public output route

**Analog:** None. No collections, models, components, or routes exist in the application source.

**Research direction (not a repository pattern):** The representative slice is one clearly fake record persisted through PostgreSQL, one synthetic image uploaded through the external storage adapter, and a public route that renders that fake content. Keep it minimal; real inventory and later-phase workflows are explicitly out of scope.

### Local services and environment configuration

**Analog:** `.gitignore` (tracked root file; local configuration and credentials section, lines 1–19; build/cache section, lines 34–46).

**Relevant existing excerpt:**

```gitignore
# Local configuration and credentials
.env
.env.*
!.env.example
*.pem
*.key
*service-account*.json
*credentials*.json

# Application build, cache and test output
node_modules/
.next/
dist/
build/
coverage/
```

Use the existing ignore rules as the repository baseline; add only missing application-specific entries. `.gitignore` does not establish an application implementation pattern. `compose.yaml`, `.env.example`, and the actual service integration have no analogs. Research proposes names-only environment examples and isolated disposable services; actual values must remain outside tracked files.

### Foundation smoke script and synthetic fixture

**Analog:** None. No application smoke script, test fixture, or test harness exists.

**Research direction (not a repository pattern):** `01-RESEARCH.md` “Smoke-check outline” specifies the sequence: start disposable services, check Payload/Admin and PostgreSQL, create a fake record and synthetic upload, verify public output and processed media, then restart while retaining only disposable service data. Local success must not be reported as Exabytes or second-host verification.

### Setup, deployment, and Exabytes documentation

**Analog:** `AGENTS.md` (tracked project guidance) and `docs/planning-analysis/RECONCILIATION-REPORT.md` (tracked planning analysis) are documentation examples only. Neither documents application startup, deployment procedures, or observed Exabytes capabilities; there is no procedural deployment or feasibility-results analog to copy.

**Documentation pattern:** Keep instructions explicit and evidence-based, separate confirmed results from pending checks, and do not include secrets. Exabytes and second-host findings remain pending unless actual evidence is collected. Do not infer compatibility from local tests.

## Shared Patterns

### Secret and local-file exclusion

**Source:** `.gitignore` lines 1–19.  
**Apply to:** `.env.example`/local environment setup, local service configuration, credentials, and disposable test data.

The tracked ignore file already excludes `.env`, `.env.*` while allowing `.env.example`, credentials, keys, private documents, local uploads, and database artifacts. Preserve these protections. The example file must contain variable names only, with no real values.

### Portability and evidence boundaries

**Source:** `AGENTS.md` architecture, deployment portability, and safety guidance; binding decisions D-01 through D-13 in `01-CONTEXT.md`.  
**Apply to:** Payload/database/storage configuration, environment example, local services, smoke procedure, and deployment/Exabytes documentation.

Keep host-specific values in environment configuration; keep PostgreSQL and object storage independent of the app host where practical. Do not configure Exabytes MariaDB or couple the app to Exabytes. Keep account assessment read-only until a specific write test is approved, and report absent evidence as pending.

## No Analog Found

No application-source analog exists for the proposed Next.js, Payload, PostgreSQL, storage, route, collection, test, or deployment files. This phase establishes the first application conventions. Use the official-stack guidance in `01-RESEARCH.md` as implementation research, not as evidence of patterns already present in this repository.

| File/area | Reason |
|-----------|--------|
| `package.json`, lockfile, `tsconfig.json`, `next.config.mjs`, `payload.config.ts` | No application scaffold or framework configuration exists. |
| Payload routes, test collections, and public route | No application routes, models, or components exist. |
| `compose.yaml`, `.env.example`, storage adapter configuration | No local database or object-storage setup exists. |
| Smoke command/script and synthetic fixture | No application tests, smoke tooling, or test media exists. |
| Local setup, portable deployment, Exabytes results documentation | Existing docs are planning/source material, not operational application/deployment guides or account evidence. |

## Metadata

**Analog search scope:** Repository root and tracked files; `.planning/`, `docs/`, root configuration, and application-related path scan.  
**Files scanned:** Tracked-file inventory plus root ignore/configuration and phase research/context.  
**Tracking check:** Existing analog paths named above are tracked (`git ls-files` confirmed). No ignored `.codex` runtime or mirrored capability path is used as an analog.  
**Pattern extraction date:** 2026-09-30
