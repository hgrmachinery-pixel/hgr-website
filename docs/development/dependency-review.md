# Foundation dependency review

The owner approved the 13 exact direct packages and proposed Windows x64 dependency list on 30 September 2026 before installation. This local foundation uses Node.js 24; the check ran on Node 24.21.0 and npm 11.19.0.

| Direct package | Version |
| --- | --- |
| next | 16.3.7 |
| react, react-dom | 19.3.0 |
| payload, @payloadcms/next, @payloadcms/db-postgres, @payloadcms/storage-gcs | 3.90.2 |
| graphql | 16.14.2 |
| sharp | 0.35.5 |
| typescript | 5.9.3 |
| @types/node | 24.19.0 |
| @types/react, @types/react-dom | 19.3.0 |

Payload's exact package peer ranges accept this Next/React/GraphQL tuple. The lockfile retains integrity hashes and exact indirect versions. No alternative database or storage adapter was installed.

Initial installation disabled lifecycle scripts. Comparison with the approved list detected three PostgreSQL helper patch releases published after the proposal. Overrides retain the approved `pg-protocol` 1.16.0, `pg-connection-string` 2.14.0 and `pg-cloudflare` 1.4.0. These satisfy `pg` 8.20.0's declared ranges (`^1.13.0`, `^2.12.0`, and `^1.3.0`).

npm deduplication consolidated `get-tsconfig` 4.14.3 into the already approved 4.14.2 and `range-parser` 1.3.0 into the already approved 1.2.1. The resulting Windows installation contains 376 instances, all approved name/version pairs, rather than forcing duplicate copies to match the 378-instance proposal. Future operating systems select their own optional platform binaries from the lockfile; this review does not claim those installations have been tested.

The only automatic installation hooks applicable to this Windows tree are three esbuild `postinstall` scripts (`node install.js`) at versions 0.18.20, 0.25.12 and 0.28.2. Their source was inspected before clean installation. They locate the matching installed Windows binary and check its version; the binary packages are present. If optional binaries are absent, the upstream scripts can download the matching package, so do not omit optional dependencies. Published-package `prepare` commands were inspected but are not run when npm installs these registry archives. Sharp has no automatic installation hook in this version.

The approved tuple includes deprecated indirect esbuild-kit packages and older uuid copies. These are upstream dependencies, not replacement packages selected by HGR. No dependency upgrades were made outside the approved set.

Official API and package references: [Payload installation](https://payloadcms.com/docs/getting-started/installation), [PostgreSQL adapter](https://payloadcms.com/docs/database/postgres), [GCS adapter](https://payloadcms.com/docs/upload/storage-adapters), [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), and [Sharp installation](https://sharp.pixelplumbing.com/install/).

Installing these packages provisions no database, bucket, hosting account, or paid service. Database, external-media, production build, Exabytes, and second-host integration results belong to the subsequent tracer and feasibility plans.
