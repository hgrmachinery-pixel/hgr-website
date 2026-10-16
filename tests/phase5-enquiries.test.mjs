import assert from "node:assert/strict";
import test from "node:test";
import { validateEnquiry, submitEnquiry } from "../src/lib/enquiries/submit.ts";
import { createResendEnquiryAdapter, readEnquiryEmailConfig } from "../src/lib/email/enquiryAdapter.ts";

const validGeneral = { kind: "general", name: "A Customer", phone: "+60 12 345 6789", subject: "General", message: "Please call me." };

test("general enquiries require name, phone and message; company and email are optional", () => {
  assert.equal(validateEnquiry(validGeneral).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, name: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, phone: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, message: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, email: "not-an-email" }).ok, false);
});

test("each enquiry type enforces its own required fields", () => {
  const rental = { ...validGeneral, kind: "rental", machineRequired: "Excavator", startDate: "2027-02-01", rentalDuration: "2 months", projectLocation: "Klang", needOperator: "no" };
  const service = { ...validGeneral, kind: "service", brand: "Komatsu", model: "PC200", problemDescription: "Hydraulic issue", machineLocation: "Klang", urgent: "no" };
  const lubricant = { kind: "lubricant", name: "A Customer", phone: "0123456789", machineBrand: "Komatsu", machineModel: "PC200", lubricantRequired: "Hydraulic oil", quantity: "200 litres" };
  assert.equal(validateEnquiry(rental).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "rental" }).ok, false);
  assert.equal(validateEnquiry(service).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "service", machineLocation: "Klang" }).ok, false);
  assert.equal(validateEnquiry(lubricant).ok, true);
  assert.equal(validateEnquiry({ kind: "lubricant", name: "A Customer", phone: "0123456789" }).ok, false);
});

test("enquiry normalization produces Malaysian E.164, title case and lowercase email", () => {
  const normalized = validateEnquiry({ ...validGeneral, name: "  mOHAMAD bin O'NEIL ", phone: "(012) 345-6789", email: "  CUSTOMER@Example.COM  " });
  assert.equal(normalized.ok, true);
  if (normalized.ok) {
    assert.equal(normalized.fields.name, "Mohamad Bin O'Neil");
    assert.equal(normalized.fields.phone, "+60123456789");
    assert.equal(normalized.fields.email, "customer@example.com");
    assert.equal(normalized.fields.preferredContact, "whatsapp");
  }
  assert.equal(validateEnquiry({ ...validGeneral, phone: "03 1234 5678" }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, preferredContact: "email" }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, preferredContact: "email", email: "person@example.test" }).ok, true);
});

test("trade-in detail requirements apply only after selecting trade-in", () => {
  assert.equal(validateEnquiry({ ...validGeneral, kind: "machine", tradeIn: "no" }).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "machine", tradeIn: "yes" }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "machine", tradeIn: "yes", tradeInBrand: "Komatsu", tradeInModel: "PC100", tradeInYear: "2015" }).ok, true);
});

test("machine enquiries accept an optional viewing preference", () => {
  assert.equal(validateEnquiry({ ...validGeneral, kind: "machine", viewingPreference: "Weekday afternoon" }).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "machine", viewingPreference: "V".repeat(201) }).ok, false);
});

test("bounds input and rejects honeypot submissions", () => {
  assert.equal(validateEnquiry({ ...validGeneral, name: "N".repeat(161) }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, website: "spam" }).ok, false);
});

test("delivery reports success only when the injected adapter accepts", async () => {
  assert.equal((await submitEnquiry(validGeneral, async () => ({ accepted: true }))).status, "accepted");
  assert.equal((await submitEnquiry(validGeneral, async () => ({ accepted: false }))).status, "unavailable");
  assert.equal((await submitEnquiry(validGeneral, async () => { throw new Error("offline"); })).status, "failed");
});

test("server context is delivered separately from visitor-controlled fields", async () => {
  let captured;
  await submitEnquiry({ ...validGeneral, machineSlug: "forged", source: "https://bad.example/?email=private" }, async (message) => {
    captured = message;
    return { accepted: true };
  }, { machine: { reference: "HGR028", title: "2018 Komatsu PC200" }, pagePath: "/machines/hgr028", metadata: { leadSource: "website:machine", referrer: "https://search.example/find?email=private&utm_source=paid#top", utmSource: "paid", browser: "Synthetic Browser", timestamp: "2026-10-02T10:00:00.000Z" } });
  assert.equal(captured.context.machine.reference, "HGR028");
  assert.equal(captured.context.pagePath, "/machines/hgr028");
  assert.equal(captured.context.metadata.referrer, "https://search.example/find");
  assert.equal(captured.context.metadata.utmSource, "paid");
  assert.equal(captured.context.metadata.timestamp, "2026-10-02T10:00:00.000Z");
  assert.equal(JSON.stringify(captured.context).includes("bad.example"), false);
});

const mailConfig = {
  ENQUIRY_EMAIL_ENABLED: "true", RESEND_API_KEY: "synthetic-resend-api-key", MAIL_FROM_NAME: "HGR Website",
  MAIL_FROM_ADDRESS: "enquiries@notify.hgrmachinery.com", ENQUIRY_TO_EMAIL: "hgrmachinery@gmail.com",
};

function makeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test("Resend config is disabled until explicitly enabled with complete valid configuration", async () => {
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: " true " })?.apiKey, mailConfig.RESEND_API_KEY);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: "TRUE" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, RESEND_API_KEY: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, MAIL_FROM_ADDRESS: "invalid" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, RESEND_API_KEY: "secret\nforged" }), null);
});

test("Resend HTTPS adapter sends fixed destination, plain text, and validated Reply-To", async () => {
  let request;
  const events = [];
  const adapter = createResendEnquiryAdapter(
    () => readEnquiryEmailConfig(mailConfig),
    async (url, init) => { request = { url: String(url), init }; return makeResponse(200, { id: "email-id" }); },
    (event, details) => events.push({ event, details }),
  );
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A Customer", phone: "+60123456789", message: "Interested", email: "a@example.test" }, context: {} }), { accepted: true });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers.Authorization, `Bearer ${mailConfig.RESEND_API_KEY}`);
  assert.equal(request.init.cache, "no-store");
  const payload = JSON.parse(request.init.body);
  assert.equal(payload.from, "HGR Website <enquiries@notify.hgrmachinery.com>");
  assert.deepEqual(payload.to, ["hgrmachinery@gmail.com"]);
  assert.equal(payload.reply_to, "a@example.test");
  assert.equal(payload.subject, "Website general enquiry");
  assert.match(payload.text, /Name: A Customer/);
  assert.equal("html" in payload, false);
  assert.deepEqual(events, [{ event: "provider_accepted", details: { status: 200 } }]);
});

test("Resend configuration failure is diagnosed without exposing credentials or enquiry data", async () => {
  const events = [];
  const adapter = createResendEnquiryAdapter(() => null, async () => { throw new Error("must not request"); }, (event, details) => events.push({ event, details }), () => "missing_resend_api_key");
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
  assert.deepEqual(events, [{ event: "configuration_unavailable", details: { reason: "missing_resend_api_key" } }]);
  assert.equal(JSON.stringify(events).includes(mailConfig.RESEND_API_KEY), false);
  assert.equal(JSON.stringify(events).includes("Private"), false);
});

test("Resend authentication and provider rejection failures are safe and diagnostic", async () => {
  for (const [status, body, event] of [
    [401, { name: "invalid_api_key", message: "private provider details" }, "authentication_failure"],
    [422, { name: "validation_error", message: "private provider details" }, "provider_rejected"],
  ]) {
    const events = [];
    const adapter = createResendEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), async () => makeResponse(status, body), (name, details) => events.push({ event: name, details }));
    assert.deepEqual(await adapter({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
    assert.deepEqual(events, [{ event, details: { status } }]);
    assert.equal(JSON.stringify(events).includes("private provider"), false);
    assert.equal(JSON.stringify(events).includes(mailConfig.RESEND_API_KEY), false);
    assert.equal(JSON.stringify(events).includes("Private"), false);
  }
});

test("Resend network and timeout failures do not expose raw errors", async () => {
  for (const error of [
    Object.assign(new Error("private socket details"), { cause: { code: "ETIMEDOUT" } }),
    Object.assign(new Error("private timeout details"), { name: "TimeoutError" }),
  ]) {
    const events = [];
    const adapter = createResendEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), async () => { throw error; }, (event, details) => events.push({ event, details }));
    assert.deepEqual(await adapter({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
    assert.equal(events[0].event, "provider_timeout");
    assert.equal(JSON.stringify(events).includes("private"), false);
    assert.equal(JSON.stringify(events).includes(mailConfig.RESEND_API_KEY), false);
  }
});

test("CRM preparation metadata is included in the enquiry notification", async () => {
  let payload;
  const adapter = createResendEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), async (_url, init) => { payload = JSON.parse(init.body); return makeResponse(200, { id: "email-id" }); });
  await adapter({ fields: { kind: "general", name: "A Customer", phone: "+60123456789", preferredContact: "whatsapp" }, context: { metadata: { leadSource: "website:general", referrer: "https://search.example/", utmCampaign: "stock-listing", browser: "Synthetic Browser", timestamp: "2026-10-02T10:00:00.000Z" } } });
  assert.match(payload.text, /Lead source: website:general/);
  assert.match(payload.text, /UTM campaign: stock-listing/);
  assert.match(payload.text, /Browser: Synthetic Browser/);
  assert.match(payload.text, /Timestamp: 2026-10-02T10:00:00.000Z/);
});
