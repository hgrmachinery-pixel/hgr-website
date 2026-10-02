import assert from "node:assert/strict";
import test from "node:test";
import { validateEnquiry, submitEnquiry } from "../src/lib/enquiries/submit.ts";
import { createSmtpEnquiryAdapter, readEnquiryEmailConfig } from "../src/lib/email/enquiryAdapter.ts";

const validGeneral = { kind: "general", name: "A Customer", phone: "+60 12 345 6789", message: "Please call me." };

test("general enquiries require name, phone and message; company and email are optional", () => {
  assert.equal(validateEnquiry(validGeneral).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, name: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, phone: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, message: " " }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, email: "not-an-email" }).ok, false);
});

test("each enquiry type enforces its own required fields", () => {
  assert.equal(validateEnquiry({ ...validGeneral, kind: "rental", projectLocation: "Klang" }).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "rental" }).ok, false);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "service", machineLocation: "Klang" }).ok, true);
  assert.equal(validateEnquiry({ ...validGeneral, kind: "service" }).ok, false);
  assert.equal(validateEnquiry({ kind: "lubricant", name: "A Customer", phone: "0123456789" }).ok, true);
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
  }, { machine: { reference: "HGR028", title: "2018 Komatsu PC200" }, pagePath: "/machines/hgr028" });
  assert.equal(captured.context.machine.reference, "HGR028");
  assert.equal(captured.context.pagePath, "/machines/hgr028");
  assert.equal(JSON.stringify(captured.context).includes("bad.example"), false);
});

const mailConfig = {
  ENQUIRY_EMAIL_ENABLED: "true", SMTP_HOST: "smtp.example.test", SMTP_PORT: "587",
  SMTP_USER: "user", SMTP_PASSWORD: "secret", MAIL_FROM_NAME: "HGR Website",
  MAIL_FROM_ADDRESS: "website@example.test", ENQUIRY_TO_EMAIL: "sales@example.test",
};

test("SMTP adapter is disabled until explicitly enabled with complete configuration", async () => {
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, ENQUIRY_EMAIL_ENABLED: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_PASSWORD: "" }), null);
  assert.equal(readEnquiryEmailConfig({ ...mailConfig, SMTP_PORT: "25" }), null);
  let created = false;
  const adapter = createSmtpEnquiryAdapter(() => null, () => { created = true; throw new Error("must not create"); });
  assert.deepEqual(await adapter({ fields: { kind: "general", name: "A", phone: "0123456", message: "Hello" }, context: {} }), { accepted: false });
  assert.equal(created, false);
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
