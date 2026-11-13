# Initial production Owner provisioning

The first HGR Owner account must be created during controlled setup, before the public site is opened.

1. Generate a random bootstrap token of at least 32 characters and set it as the server-only Railway variable `HGR_OWNER_BOOTSTRAP_TOKEN` for the target environment. Do not put the token in source control, a browser, or a public URL.
2. While the Users collection is empty, submit the first account directly to Payload's authenticated server API (`POST /api/users`) with the normal account fields and the `x-hgr-owner-bootstrap-token` header. Use the approved production `SERVER_URL`, an HTTPS client, and enter the new Owner's password through a secure operator-controlled method. The Owner role is assigned server-side regardless of any supplied role value.
3. Confirm the account can sign in and that it has the Owner role.
4. Remove `HGR_OWNER_BOOTSTRAP_TOKEN` from Railway immediately. With the variable absent, first-account creation is denied. Subsequent user creation is available only to the current Owner through normal Payload access controls.

Do not enable unrestricted public registration or leave the bootstrap token configured after setup. If the Owner account must be re-created after deletion, repeat the same controlled process only while the Users collection is empty.
