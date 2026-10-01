# Exabytes feasibility: evidence and proposed test

**Recorded: 1 October 2026. Status: Node 22.23.3 meets documented framework/runtime minimums and is now allowed by the project; the approved synthetic test remains pending because required test services do not exist.**

At the 1 October 2026 checkpoint, the owner reported: Exabytes Business Hosting – eBiz 12 Plus; Node.js support; Node.js 22.23.3; npm available; Application Mode `production`; Application Root `/httpdocs`; custom environment variables supported; startup file configurable; and File Manager available. This is owner-provided account evidence, not independently inspected in Plesk. Official [Next.js installation requirements](https://nextjs.org/docs/app/getting-started/installation), [Payload installation requirements](https://payloadcms.com/docs/getting-started/installation), and [Sharp prerequisites](https://sharp.pixelplumbing.com/install/) each state Node 20.9+; React has no stricter server runtime requirement. The locked dependency engine ranges also accept Node 22.23.3, with the caveat that an optional Windows x86 Sharp binary is Node-20-only and the Exabytes platform/architecture has not been supplied. The project engine range is updated to permit Node 22.23.3 and Node 24. The project was built on Node 24.21.0 only; Node 22 project build/runtime has not been exercised. Owner confirms no existing PostgreSQL or object-storage test services and no second compatible host. Therefore no remote write/upload test can run now, despite approval; no resource will be provisioned.

This record separates facts already established by the local Phase 1 work from Exabytes account facts. **Unverified** means the value is not established by current evidence; it does not by itself block local Phase 1 work. Only the deployment-critical items below are requested from the owner. The remaining technical limits may stay unverified unless visible in existing Plesk settings or readily available plan information. No exhaustive provider investigation is required.

This record does not grant permission to upload, deploy, start/restart a remote application, migrate a remote database or change any account. The exact Exabytes synthetic write/upload test still requires explicit owner approval after the destination and safe existing resources are identified. PORT-04/05/06 host-specific conclusions remain pending until supported by evidence.

## Evidence to provide

The owner may provide **redacted screenshots or capability descriptions** from the existing plan and application settings. Remove account identifiers, personal details, passwords, connection strings, tokens, keys and secret values. No credentials or service-account files should be sent or placed in Git/planning records. The owner need not run commands or change settings; the maintainer assesses supplied evidence and performs any subsequently authorized technical work.

For Plesk-visible information, redacted screenshots or short descriptions are sufficient. Do not change settings to make evidence available. Hide account identifiers, personal information, domains or paths where private, billing details, database/storage endpoints, and all credentials/secrets. Facts that are not visible in Plesk or existing plan materials are marked **unverified**; do not infer a value from generic advertising. Record a date/source for any fact supplied.

### Owner evidence needed to decide if an isolated deployment test is possible

| Deployment-critical fact | What to confirm from existing Plesk/plan information | Current evidence |
|---|---|---|
| Node application and supported runtime | Whether this existing plan exposes a Node app facility and offers a version compatible with the selected dependencies | Owner reports Node support, Node 22.23.3, and npm. Official Next.js, Payload and Sharp requirements are Node 20.9+; selected package engine ranges accept Node 22.23.3. Project `package.json` now permits Node `>=22.23.3 <23 || >=24 <25`. Node 22 build/runtime has not been tested here; host OS/architecture and Sharp binary support are unverified. |
| Existing app configuration (reported) | Application mode, root, startup file, environment-variable and File Manager capabilities | Owner reports production mode, `/httpdocs`, configurable startup file, custom environment variables, and File Manager. Not independently inspected. |
| Existing isolated app slot | Whether a separate test app slot already exists, isolated from WordPress/production, and can serve an HTTPS test route | Unverified; owner has not confirmed a separate slot or route. `/httpdocs` alone does not establish isolation. |
| Existing isolated PostgreSQL test service | Whether a separate disposable PostgreSQL service/schema is already available and can be used without charges; Exabytes MariaDB is not a substitute | Unverified; no service confirmed |
| Existing isolated object-storage test service | Whether an isolated existing GCS-compatible bucket/prefix is available and non-chargeable | Unverified; no service confirmed |
| Safe environment settings | Whether app secrets can be supplied through protected settings without putting them in source files | Owner reports custom environment variables. Whether values are protected and isolated from WordPress/production remains unverified. |
| Test scope approval | Whether the owner approves the exact synthetic deployment, database migration, one fake record/image upload, read-only route/API checks, anonymous denied PATCH, test-app restart, and cleanup described below | Owner approved one minimal synthetic test subject to stated safety constraints; approval is not permission to create or pay for missing services. |
| Second host (conditional) | Whether an already available compatible test host exists: yes / no / unknown. Only needed to report a real second-host result. | Owner confirms none is available; second-host deployment remains pending by plan. |

If a detail is not visible in Plesk and cannot be confirmed from existing plan material, simply report **unverified**. Do not contact support, change settings, create services, or undertake exhaustive evidence gathering for this checkpoint.

### Other capability details (record if already visible; otherwise unverified)

| Capability | Evidence that may be visible in existing Plesk/plan material | Current evidence |
|---|---|---|
| Process/start/port and HTTPS mapping | Existing Node app start command, long-running process support, assigned port and proxy mapping | Unverified |
| Restart/sleep behavior | Process supervision, restart rules, idle behavior, restart persistence | Unverified |
| Disk and temporary files | Writable paths, quotas and stated persistence/cleanup rules | Unverified |
| CPU, memory and process limits | Stated runtime/build/image-processing and concurrent-process limits | Unverified |
| Request/upload and timeout limits | Proxy/request limits and timeouts; note whether the 5 MiB cap fits if this is stated | Unverified |
| Outbound network and allowlists | PostgreSQL TCP/TLS and storage HTTPS/TLS policy, outbound restrictions or stable egress requirements | Unverified |
| Sharp/native processing | Stated native-module/platform and image-processing support | Unverified |
| Usage charges/quotas | Existing resource quotas or usage charges relevant to the proposed test | Unverified |

The [portable redeployment procedure](portable-redeploy.md) defines the required Node application, PostgreSQL and external object-storage capabilities. The existing Exabytes MariaDB is never a PostgreSQL substitute. Missing or unverified safe isolation/services leave the remote test pending; no purchase, account creation, upgrade, subscription or potentially chargeable provisioning is part of this proposal. These unknowns do not block already permitted local work.

## Exact proposed synthetic workload

This proposal uses the same generated image and record assertions as [the local smoke entry point](../../scripts/smoke-foundation.mjs) and [its integration coordinator](../../scripts/foundation-smoke.ts). It uses no customers, machinery records, real photographs, JPJ documents or other sensitive business data. A single small image proves only this foundation workload, not production photography capacity.

**Execution prerequisites:** specific owner approval for the named destination and operations below; evidenced safe existing test isolation; already available non-chargeable PostgreSQL and GCS-compatible endpoints; confirmed permissions; and a reviewed destination-specific execution wrapper. Record actual target facts first so the owner can approve a concrete test. General autonomous-development approval does not authorize a remote write test.

`npm run smoke:foundation` and [smoke-environment.mjs](../../scripts/smoke-environment.mjs) intentionally accept only disposable loopback services. They are not remote deployment tools. Do not weaken their guards, point them at remote targets or copy their local emulator bucket-creation behavior into a remote test. Before execution, the maintainer must prepare and audit a separate destination wrapper with exact app/database/storage destination checks, bounded timings, safe redirect handling, protected authentication, a unique fixture marker and exact cleanup. That wrapper is not created or authorized by this document. If it or any prerequisite is missing, the remote workload remains pending.

Once all prerequisites and exact operations are approved:

1. Record the source Git commit, destination alias, observed runtime/limits and redacted evidence references. Rebuild that same committed source/lockfile in the **existing isolated test app slot**, following the portable procedure. Use destination environment settings without rewriting the application. Apply only the committed schema migration to the explicitly approved disposable PostgreSQL target; no production database migrations. Start only that test application through its existing process management.
2. Generate the same deterministic **960 × 600 RGB PNG** used by the local coordinator. Use one UUID marker `foundation-smoke-<uuid>`, title `SYNTHETIC TEST ONLY — <marker>`, and filename `<marker>.png`. Record actual original byte length; it must be below the foundation's **5 MiB** upload cap. Do not claim a measured size before execution.
3. Through Payload's authenticated/authorized maintainer procedure, create only that one `foundation-fixtures` record and upload the PNG into the existing isolated external storage. Read the record back from PostgreSQL and match its title/identity. Verify the external original equals the generated bytes and the `card` derivative is **640 × 400**, nonempty and smaller than the PNG. Record original/processed byte counts and processing elapsed time. Include multipart overhead in the measured request-body bytes where an HTTP upload is used; a Payload Local API upload has no HTTP body-size result, so label it accordingly rather than inventing one.
4. Request the approved public test route `/` and processed file route, verifying the synthetic title, processed image URL, HTTP success and expected bytes. Check `/admin` responds through safe same-origin redirects; this proves the authentication surface only, not a staff login workflow. Read the synthetic fixture through the public API. Check an anonymous PATCH to this exact fixture is rejected with 401/403 and leaves its title unchanged; this attempted API operation is part of the exact approval scope. Verify no secrets/database configuration/private endpoint details appear publicly. Record route statuses and elapsed request times.
5. Stop/restart **only the isolated test application**, retaining its external database and objects. Re-read the record, original and derivative and repeat public delivery checks after restart. Record observed persistence and startup time; distinguish this restart test from any untested redeploy/disk-persistence behavior. Record explicit process/storage limits from account evidence separately from measured timings and failures.
6. Remove only the fixture whose UUID/title/ID match this run and its exact generated original/derivative objects. Verify their absence and stop only the process owned by this test. If an upload fails midway, use the same marker to find only this run's record/objects; a mismatch, ambiguity or cleanup error stops deletion and is reported. Never delete a database, bucket, shared volume, account, application foundation or unrelated record/object. No broad prefix purge or production cleanup is allowed.

No changes to WordPress, production hosting, DNS, shared account settings, firewall/allowlists or OS policy are covered. Any such requirement stops this protocol for separate review and specific approval. If evidence later shows Exabytes cannot support the workload, report the exact incompatibility and retain the approved portable architecture (D-12/D-13).

For a second host, first obtain confirmed availability and authorization for that existing isolated resource and its same operations. Rebuild the **same source revision** with that destination's environment values and repeat this workload/evidence capture. No available resource means a documented procedure with pending deployment proof; no host or account is provisioned under this record.

## Results kept separate

| Destination/check | Status on 1 October 2026 | Evidence and precise gap |
|---|---|---|
| Local production build/type checks and 11 configuration/safety tests | Pass, local only | Prior [Plan 01-03 summary](../../.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-03-SUMMARY.md) and [STATE](../../.planning/STATE.md); not rerun for this documentation task |
| Actual Exabytes capabilities | Partial owner evidence; Node 22.23.3 meets documented package requirements, subject to local verification | Owner reports Node/app settings as listed above. Official requirements and lockfile engine ranges support Node 22.23.3; project engine now allows it. The project's build under Node 22 and host platform/Sharp binary compatibility are unverified. Other unreported limits/isolation remain unverified. No account access or remote test performed. |
| Local full migration/PostgreSQL/GCS/upload/public/API/Admin/restart integration | Pending | `npm run smoke:foundation` exited safely at its guard because `HGR_SMOKE_DISPOSABLE=yes` was not set. Per STATE, disposable local PostgreSQL/GCS services are unavailable; the flag was not set and no integration operation ran. This is not host evidence. |
| Actual Exabytes synthetic workload (PORT-05) | Pending prerequisites | Owner approved one minimal fake-data test but confirms PostgreSQL and object-storage test services do not exist. No services will be created. Isolated app slot/route, OS/architecture, protected environment-value behavior and destination wrapper remain unverified/unprepared. No remote operation attempted. |
| Second-host rebuild/workload (PORT-04) | Pending by owner-confirmed unavailability | Owner confirms no existing second compatible host; provisioning is out of scope. |
| Actual host findings (PORT-06) | Pending | Checklist/protocol prepared; actual capability/workload evidence still absent |

No host workload has been run, so no workload pass/failure is recorded. Node 22.23.3 satisfies the official framework/image-library minimums and selected package engine ranges, so Node 24 is not a documentation-based blocker. The project package engine was widened accordingly. This does not prove the project build/runtime or Sharp binary on the actual Exabytes OS/architecture. The exact synthetic test is **approved by the owner**, but cannot proceed because the owner confirms there is no PostgreSQL or object-storage test service; no account/resource setup is authorized.

For each eventual destination run record: source commit; evidence references/dates; Node/npm/OS versions; explicit process, CPU/RAM, disk, request size/time and network limits; actual original/request/processed bytes; build/start/upload/public/API/Admin timings and statuses; restart persistence; exact cleanup outcome; error stage and redacted error description; and remaining unknowns. Use **pass** only for an observed completed check, **fail/unsupported** only with actual evidence, and **pending** for absent prerequisites or unrun checks. Local results never establish an Exabytes or second-host result.

## Owner checkpoint response

The supplied evidence records Node 22.23.3, which meets documented framework/runtime requirements; see the references above. Remaining runtime verification is the project build/run and target-compatible Sharp binary on the actual host platform, which cannot be established from the version alone. The owner confirms PostgreSQL and object-storage test services do not exist, so those service prerequisites are pending and will not be provisioned under this test. Test-slot isolation and protected environment settings remain unverified.

The owner has approved one minimal synthetic write/upload test under the stated safety conditions. Approval covers only the proposed isolated fake-data workload and cleanup, not creating services, changing app/account settings, or incurring charges. No write is attempted while PostgreSQL and object-storage services are absent.

Remaining owner responses, if already known:

- The Node 22.23.3 package compatibility check is documented; project build/runtime on that target remains unverified.
- Is there a separate test app slot and HTTPS route, isolated from WordPress/production? If not known, write unverified.
- PostgreSQL and object-storage test services: owner confirms none exist; do not provision them.
- Are the reported custom environment values protected? If not known, write unverified.

- Exact isolated Exabytes synthetic test: **approved**, but pending prerequisites. Test cannot run without existing isolated PostgreSQL and object-storage services; none may be created.
- Already available compatible second-host resource: **no**. Deployment remains pending; no host will be provisioned.

No passwords, tokens, keys, connection strings or service-account files are requested. The maintainer handles technical execution after the required evidence and exact approval, preserving decisions D-01–D-04, D-06, D-08–D-09 and D-12–D-13 in the [Phase 1 context](../../.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-CONTEXT.md).
