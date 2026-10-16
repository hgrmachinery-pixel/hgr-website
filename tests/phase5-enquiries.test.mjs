import assert from "node:assert/strict";
import test from "node:test";
import { validateEnquiry, submitEnquiry } from "../src/lib/enquiries/submit.ts";
import { createSmtpEnquiryAdapter, readEnquiryEmailConfig } from "../src/lib/email/enquiryAdapter.ts";

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
  ENQUIRY_EMAIL_ENABLED: "true", SMTP_HOST: "smtp.example.test", SMTP_PORT: "587",
  SMTP_USER: "user", SMTP_PASSWORD: "secret", MAIL_FROM_NAME: "HGR Website",
  MAIL_FROM_ADDRESS: "website@example.test", ENQUIRY_TO_EMAIL: "sales@example.test",
};

test("SMTP adapter is disabled until explicitly enabled with complete configuration", async () => {
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: " true " })?.enabled, true);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: "TRUE" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_PASSWORD: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_PORT: "25" }), null);
  let created = false;
  const adapter = createSmtpEnquiryAdapter(() => null, () => { created = true; throw new Error("must not create"); });
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A", phone: "0123456", message: "Hello" }, context: {} }), { accepted: false });
  assert.equal(created, false);
});

test("email diagnostics distinguish configuration problems without exposing values", async () => {
  const events = [];
  const withLogs = createSmtpEnquiryAdapter(
    () => null,
    () => { throw new Error("must not connect"); },
    (event, details) => events.push({ event, details }),
    () => "missing_smtp_password",
  );
  assert.deepEqual(await withLogs({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
  assert.deepEqual(events, [{ event: "configuration_unavailable", details: { reason: "missing_smtp_password" } }]);
  assert.equal(JSON.stringify(events).includes("Private"), false);
  assert.equal(JSON.stringify(events).includes(mailConfig.SMTP_USER), false);
});

test("email diagnostics distinguish authentication and connection failures without logging error text", async () => {
  for (const [error, event] of [
    [{ code: "EAUTH", responseCode: 535, command: "AUTH PLAIN", message: "secret-bearing provider response" }, "authentication_failure"],
    [{ code: "ECONNECTION", command: "CONN", message: "secret-bearing provider response" }, "connection_or_smtp_failure"],
  ]) {
    const events = [];
    const adapter = createSmtpEnquiryAdapter(
      () => readEnquiryEmailConfig({ ...mailConfig, SMTP_PORT: "465" }),
      () => ({ sendMail: async () => { throw error; } }),
      (name, details) => events.push({ event: name, details }),
    );
    assert.deepEqual(await adapter({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
    assert.equal(events[0].event, event);
    assert.deepEqual(events[0].details, { code: error.code, command: event === "authentication_failure" ? "UNKNOWN" : "CONN", responseCode: error.responseCode ?? 0, port: 465 });
    assert.equal(JSON.stringify(events).includes("secret-bearing"), false);
    assert.equal(JSON.stringify(events).includes("Private"), false);
  }
});

test("email diagnostics distinguish provider rejection without logging recipient or message", async () => {
  const events = [];
  const adapter = createSmtpEnquiryAdapter(
    () => readEnquiryEmailConfig(mailConfig),
    () => ({ sendMail: async () => ({ accepted: [], rejected: [mailConfig.ENQUIRY_TO_EMAIL] }) }),
    (event, details) => events.push({ event, details }),
  );
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "Private Name", phone: "+60123456789", message: "Private message" }, context: {} }), { accepted: false });
  assert.deepEqual(events, [{ event: "provider_rejected", details: { acceptedCount: 0, rejectedCount: 1, port: 587 } }]);
  assert.equal(JSON.stringify(events).includes(mailConfig.ENQUIRY_TO_EMAIL), false);
  assert.equal(JSON.stringify(events).includes("Private"), false);
});

test("SMTP sends plain text to the configured fixed recipient with TLS and accepts only that recipient", async () => {
  let options; let message;
  const adapter = createSmtpEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), (value) => {
    options = value;
    return { sendMail: async (payload) => { message = payload; return { accepted: [mailConfig.ENQUIRY_TO_EMAIL] }; } };
  });
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A Customer", phone: "0123456", message: "Interested", email: "a@example.test" }, context: {} }), { accepted: true });
  assert.equal(options.secure, false);
  assert.equal(options.requireTLS, true);
  assert.equal(options.tls.rejectUnauthorized, true);
  assert.equal(message.to, mailConfig.ENQUIRY_TO_EMAIL);
  assert.deepEqual(message.envelope.to, [mailConfig.ENQUIRY_TO_EMAIL]);
  assert.equal(message.replyTo, "a@example.test");
  assert.equal("html" in message, false);
  assert.equal("attachments" in message, false);
});

test("CRM preparation metadata is included in the enquiry notification", async () => {
  let message;
  const adapter = createSmtpEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), () => ({ sendMail: async (payload) => { message = payload; return { accepted: [mailConfig.ENQUIRY_TO_EMAIL] }; } }));
  await adapter({ fields: { kind: "general", name: "A Customer", phone: "+60123456789", preferredContact: "whatsapp" }, context: { metadata: { leadSource: "website:general", referrer: "https://search.example/", utmCampaign: "stock-listing", browser: "Synthetic Browser", timestamp: "2026-10-02T10:00:00.000Z" } } });
  assert.match(message.text, /Lead source: website:general/);
  assert.match(message.text, /UTM campaign: stock-listing/);
  assert.match(message.text, /Browser: Synthetic Browser/);
  assert.match(message.text, /Timestamp: 2026-10-02T10:00:00.000Z/);
});

test("SMTP adapter rejects unsafe recipient configuration and unaccepted delivery", async () => {
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_TO_EMAIL: "sales@example.test,attacker@example.test" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_TO_EMAIL: "sales@example.test\r\nBcc: attacker@example.test" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_HOST: "smtp.example.test\u0000.evil" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_PASSWORD: "secret\nother" }), null);
  const adapter = createSmtpEnquiryAdapter(() => readEnquiryEmailConfig(mailConfig), () => ({ sendMail: async () => ({ accepted: ["other@example.test"] }) }));
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A", phone: "0123456", message: "Hello" }, context: {} }), { accepted: false });
});

test("SMTP adapter uses implicit TLS on port 465 and safely handles transport exceptions", async () => {
  let options;
  const config = { ...mailConfig, SMTP_PORT: "465" };
  const adapter = createSmtpEnquiryAdapter(() => readEnquiryEmailConfig(config), (value) => {
    options = value;
    return { sendMail: async () => { throw new Error("private transport details"); } };
  });
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A", phone: "0123456", message: "Hello" }, context: {} }), { accepted: false });
  assert.equal(options.secure, true);
  assert.equal(options.requireTLS, false);
});
