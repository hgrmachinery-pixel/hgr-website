# Phase 7: Measurement, Privacy, Security and Recovery - Pattern Map

**Mapped:** 2026-10-02  
**Files analyzed:** 8 new/implied files or modification surfaces; exact implementation scope remains for planning  
**Analogs found:** 7 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/analytics/events.ts` (proposed small allowlisted event helper) | utility | event-driven | `src/lib/enquiries/submit.ts` | partial; pure validation/safe projection style |
| `src/components/site/AnalyticsProvider.tsx` (only if consent-approved browser loading is selected) | provider | event-driven | `src/components/site/EnquiryForm.tsx` | role-match; client interaction/state boundary |
| `src/app/(site)/layout.tsx` (modify to wire an approved provider/runtime public ID) | component | request-response | `src/app/(site)/layout.tsx` | exact; existing site shell |
| `src/app/(site)/contact/actions.ts` and enquiry form surfaces (accepted conversion state / CTA events) | controller, component | request-response / event-driven | `src/app/(site)/contact/actions.ts`; `src/components/site/EnquiryForm.tsx` | exact |
| `tests/phase7-analytics.test.mjs` | test | event-driven | `tests/phase5-enquiries.test.mjs` | role-match |
| `tests/phase7-staging.test.mjs` | test | request-response | `tests/phase6-seo.test.mjs`; `tests/machine-access.test.mjs` | role-match |
| `docs/operations/backup-and-restore.md` (research recommendation) | utility/documentation | file-I/O, batch | `docs/deployment/portable-redeploy.md` | partial; operational doc, no current recovery runbook |
| `.planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md` (update only after facts/reviewer) | document | request-response | existing draft itself | exact document structure; content is owner-gated |

The analytics paths and runbook location are research recommendations, not locked architecture. Keep analytics account, consent policy, recipient/retention facts, reviewer, backup target/operator and external-service activation as gates. SAFE-01/02 primarily call for auditing and extending existing boundaries/tests; do not imply new routes, collections, roles or auth design.

## Pattern Assignments

### `src/lib/analytics/events.ts` (proposed, utility, event-driven)

**Analog:** `src/lib/enquiries/submit.ts`

**Validation and projection pattern** (`src/lib/enquiries/submit.ts`, lines 74-115, 140-166): validate input against fixed accepted values, explicitly construct the clean result, bound strings, and omit invalid or unsafe values. Reuse this allowlist approach for event names and parameters; analytics payloads should be constructed field-by-field and must not accept whole form objects, arbitrary query strings, referrers, free-text campaign values, or private serials.

```typescript
export async function submitEnquiry(input: EnquiryInput, adapter: MailAdapter, context: EnquiryContext = {}): Promise<DeliveryResult> {
  const validation = validateEnquiry(input);
  if (!validation.ok) return { status: "invalid", errors: validation.errors, fieldErrors: validation.fieldErrors };
  try {
    const result = await adapter({ fields: validation.fields, context: safeContext(context) });
    return result?.accepted === true ? { status: "accepted" } : { status: "unavailable" };
  } catch {
    return { status: "failed" };
  }
}
```

**Relevant test analog:** `tests/phase5-enquiries.test.mjs`, lines 58-76 exercises accepted/unavailable/failed outcomes and verifies forged visitor fields do not enter the separately constructed server context. Use synthetic PII sentinels in the Phase 7 tests to assert they never reach event payloads.

### `src/components/site/AnalyticsProvider.tsx` and existing contact UI (conditional, provider/component, event-driven)

**Analog:** `src/components/site/EnquiryForm.tsx` and `src/app/(site)/contact/actions.ts`

The server action has explicit form states at `src/app/(site)/contact/actions.ts`, lines 11-16, and returns success only when the injected mail adapter accepts at lines 64-68. The browser-side success event should follow the accepted returned state, not the click or form start. Ensure any consent gating and tag loading follow a reviewed policy; no consent default, provider account, or tag ID is approved by the current inputs.

```typescript
export type EnquiryFormState = {
  status: "idle" | "invalid" | "unavailable" | "failed" | "accepted";
  message?: string;
  errors?: string[];
  fieldErrors?: EnquiryFieldErrors;
  values?: Record<string, string>;
};
```

The existing site shell is [src/app/(site)/layout.tsx] (tracked). Its exact current layout is the integration point; keep any runtime public identifier separate from credentials and do not freeze environment-specific IDs into a promoted client bundle without an intentional per-environment build decision.

### `src/app/(site)/contact/actions.ts` (modified controller, request-response)

**Analog:** itself; supporting service `src/lib/enquiries/submit.ts`

**Accepted-result pattern** (`src/app/(site)/contact/actions.ts`, lines 58-68): after validation, maps only `result.status === "accepted"` to a success state; `invalid`, `unavailable`, and failed delivery remain distinct. Preserve this outcome contract when wiring measurement. **Do not add persistent submission records/idempotency schema** based on this analog; stronger retry deduplication remains a scope decision and CRM is deferred.

### `tests/phase7-analytics.test.mjs` (test, event-driven)

**Analog:** `tests/phase5-enquiries.test.mjs`

**Test style** (lines 58-76): Node built-in `node:test`, strict assertions, injected adapter and explicit outcomes. Cover fixed event names/parameter allowlists, accepted-only success, click intent labeling, invalid/missing runtime IDs fail closed, campaign input bounded/approved, duplicate pending submits, and synthetic PII sentinel absence. The exact consent assertions depend on the owner-approved consent choice.

```javascript
test("delivery reports success only when the injected adapter accepts", async () => {
  assert.equal((await submitEnquiry(validGeneral, async () => ({ accepted: true }))).status, "accepted");
  assert.equal((await submitEnquiry(validGeneral, async () => ({ accepted: false }))).status, "unavailable");
  assert.equal((await submitEnquiry(validGeneral, async () => { throw new Error("offline"); })).status, "failed");
});
```

### `tests/phase7-staging.test.mjs` (test, request-response)

**Analogs:** `tests/phase6-seo.test.mjs` and `tests/machine-access.test.mjs`

Use the current isolated helper tests: `tests/phase6-seo.test.mjs`, lines 31-49 verifies indexing is opt-in and robots/sitemap output closes when disabled; `tests/machine-access.test.mjs` checks authorization boundaries. Staging crawler directives are supplementary only: add checks for the staging auth gate and anonymous page/API/media denial only when that mechanism is identified. Add host/cache verification as a manual target gate; source-level noindex is not proof of staging protection.

```javascript
test("indexing fails closed unless production and explicit opt-in are both set", async () => {
  const { getIndexingPolicy } = await import("../src/lib/siteMetadata.ts");
  assert.equal(getIndexingPolicy({ nodeEnv: "production", enabled: "true", origin: "https://hgrmachinery.com" }).index, true);
  for (const config of [
    { nodeEnv: "development", enabled: "true", origin: "https://hgrmachinery.com" },
    { nodeEnv: "production", enabled: "false", origin: "https://hgrmachinery.com" },
    { nodeEnv: "production", enabled: "true", origin: undefined },
  ]) assert.equal(getIndexingPolicy(config).index, false);
});
```

### Existing SAFE-01/02 security surfaces (modified only if tests find a gap)

**Analogs:** `src/lib/machines/access.ts`, `src/lib/machines/publicQueries.ts`, `src/lib/machines/publicProjection.ts`, `src/app/api/machine-documents/[action]/route.ts`, and Payload API wrapper `src/app/(payload)/api/[...slug]/route.ts`.

`src/lib/machines/access.ts`, lines 15-27 separates staff access from published-only public reads. `src/lib/machines/publicQueries.ts`, lines 50-71 uses explicit published/non-archived filters with `overrideAccess: false`; `src/lib/machines/publicProjection.ts`, lines 35-96 builds an explicit public field projection. Preserve the separation between record access and field projection.

The private document route (`src/app/api/machine-documents/[action]/route.ts`, lines 10-16, 18-30) sets `private, no-store`, authenticates staff and checks the specific approval permission. `tests/machine-documents.test.mjs`, lines 33-51 covers anonymous denial, cache policy and same-origin POST checks. Use these exact controls and tests as the route/file-security analog; do not broaden `overrideAccess: true` beyond a narrowly authorized server path.

### `docs/operations/backup-and-restore.md` (proposed documentation, file-I/O/batch)

**Closest analog:** `docs/deployment/portable-redeploy.md` (tracked)

No existing tracked backup/recovery procedure is present. Follow the deployment document's portable, environment-variable-based operational documentation style, while separating PostgreSQL, object data and protected configuration recovery. Record prerequisites, operator/authorization, verification, and rollback/safety checks only as template steps until an already-approved target and responsible operator are identified. The live representative restore requirement cannot be fulfilled by this documentation pattern.

### Privacy/terms update (document, request-response; gated)

**Analog:** `.planning/phases/05-enquiries-and-supporting-pages/PRIVACY-POLICY-DRAFT.md`

Update disclosures only after confirming actual form recipient, mail/storage/analytics providers, logs, consent behavior, embeds and retention, then have the designated reviewer approve publication. Current file is a draft, not approved policy; do not invent provider, retention, legal or consent statements. No tracked terms draft was found.

## Shared Patterns

### Fail-closed public behavior
**Sources:** `src/lib/machines/access.ts:15-27`, `src/lib/machines/publicQueries.ts:50-71`, `src/lib/machines/publicProjection.ts:35-96`, `tests/phase6-seo.test.mjs:31-49`  
**Apply to:** public data and staging checks. Keep public authorization, explicit projection and indexing policy separate. Robots metadata does not restrict a direct requester.

### Server-accepted enquiry outcome
**Sources:** `src/app/(site)/contact/actions.ts:11-16,64-68`, `src/lib/enquiries/submit.ts:129-155`  
**Apply to:** lead-success tracking. Only accepted status is the conversion signal; clicks express intent. Do not add a durable lead ledger without an explicit scope decision.

### Private responses and credential hygiene
**Sources:** `src/app/api/machine-documents/[action]/route.ts:10-16`, `.gitignore:1-18`, `.env.example:1-33`  
**Apply to:** protected file checks and secret review. Keep protected responses `private, no-store`, `.env` ignored, and `.env.example` variable names only. Do not place credentials in source, plans or browser bundles.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `docs/operations/backup-and-restore.md` | documentation | file-I/O, batch | No tracked recovery runbook exists; `docs/deployment/portable-redeploy.md` is a partial documentation-style match only. |

## Metadata

**Analog search scope:** `src/app`, `src/lib`, `src/components/site`, `tests`, `docs/deployment`, existing Phase 5 planning draft  
**Tracked-source gate:** All named source analogs and the existing privacy draft were confirmed by `git ls-files`; no `.gsd` mirror paths are used.  
**Pattern extraction date:** 2026-10-02
