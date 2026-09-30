# Phase 1 deferred verification

## Windows native image-processing prerequisite

Plan 01-01's required clean npm installation and TypeScript checks passed. The additional `node --test tests/foundation-config.test.mjs` runtime configuration suite did not pass: configuration import was blocked before assertions could evaluate the application's access controls or environment validation.

The restricted process sandbox first rejected tsx's Node `os.userInfo` lookup (`uv_os_get_passwd` / `ENOMEM`). Running the same test through approved local escalation progressed to Windows Application Control rejecting Sharp's installed native module:

`ERR_DLOPEN_FAILED: An Application Control policy has blocked this file.`

Affected installed package file: `node_modules/@img/sharp-win32-x64/lib/sharp-win32-x64-0.35.5.node`.

No OS policy, file trust settings, or security controls were changed. Do not bypass this restriction, substitute unapproved packages, or report the image runtime as working. Retain the test for a compatible authorized runtime. A maintainer must provide an environment in which the approved Sharp binary is permitted before the Plan 01-02 upload-processing tracer can pass.

Disposable PostgreSQL and a compatible external-object endpoint also remain prerequisites for Plan 01-02; Docker was absent from PATH at planning time. No service or infrastructure was provisioned in Plan 01-01.

Production build and responsive/Admin/browser verification belong to Plan 01-02, which adds the application routes. There are no UI routes to inspect in Plan 01-01. Mail variable names document future configuration only; no mail adapter or delivery test exists yet. PORT integration requirements, actual Exabytes tests, and a second-host deployment remain pending.
