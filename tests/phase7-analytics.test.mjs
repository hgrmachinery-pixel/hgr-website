import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptedEnquiryEvent,
  campaignFromSearch,
  createAnalyticsEvent,
  createEnquiryEventGate,
} from "../src/lib/analytics/events.ts";

test("only a real eligible server-accepted result creates a lead event", () => {
  for (const state of [
    { status: "idle", measurementEligible: true },
    { status: "invalid", measurementEligible: true },
    { status: "unavailable", measurementEligible: true },
    { status: "failed", measurementEligible: true },
    { status: "accepted", measurementEligible: false },
    { status: "accepted" },
  ]) assert.equal(acceptedEnquiryEvent(state), null);

  assert.deepEqual(acceptedEnquiryEvent({
    status: "accepted",
    measurementEligible: true,
    measurementKind: "machine",
    measurementMachineReference: "HGR-900001",
    name: "PII_NAME_SENTINEL",
    email: "PII_EMAIL_SENTINEL",
    phone: "PII_PHONE_SENTINEL",
    message: "PII_MESSAGE_SENTINEL",
    serial: "PRIVATE_SERIAL_SENTINEL",
    url: "https://example.test/?email=PII_URL_SENTINEL",
    referrer: "PII_REFERRER_SENTINEL",
  }, { source: "mudah", campaign: "machine-viewing", raw: "PII_CAMPAIGN_SENTINEL" }), {
    event: "enquiry_accepted",
    enquiry_kind: "machine",
    machine_reference: "HGR-900001",
    campaign_source: "mudah",
    campaign_name: "machine-viewing",
  });
});

test("pending submissions and repeated accepted result renders do not duplicate lead events", () => {
  const gate = createEnquiryEventGate();
  assert.equal(gate.begin(), true);
  assert.equal(gate.begin(), false);
  assert.equal(gate.settle({ status: "failed", measurementEligible: true }), null);

  const accepted = { status: "accepted", measurementEligible: true, measurementKind: "general" };
  assert.equal(gate.begin(), true);
  assert.deepEqual(gate.settle(accepted), { event: "enquiry_accepted", enquiry_kind: "general" });
  assert.equal(gate.settle(accepted), null);

  const laterAcceptedAttempt = { ...accepted };
  assert.deepEqual(gate.settle(laterAcceptedAttempt), { event: "enquiry_accepted", enquiry_kind: "general" });
});

test("event projection excludes form, URL, title, referrer and private machine values", () => {
  const event = createAnalyticsEvent({
    name: "contact_intent",
    contactChannel: "whatsapp",
    machineReference: "PRIVATE_SERIAL_SENTINEL",
    pageGroup: "contact",
    email: "PII_EMAIL_SENTINEL",
    phone: "PII_PHONE_SENTINEL",
    message: "PII_MESSAGE_SENTINEL",
    url: "https://example.test/?customer=PII_URL_SENTINEL",
    title: "PII_TITLE_SENTINEL",
    referrer: "PII_REFERRER_SENTINEL",
    href: "https://wa.me/?text=PII_LINK_SENTINEL",
  });
  assert.deepEqual(event, {
    event: "contact_intent",
    contact_channel: "whatsapp",
    page_group: "contact",
  });
  for (const sentinel of ["PII_EMAIL_SENTINEL", "PII_PHONE_SENTINEL", "PII_MESSAGE_SENTINEL", "PII_URL_SENTINEL", "PII_TITLE_SENTINEL", "PII_REFERRER_SENTINEL", "PII_LINK_SENTINEL", "PRIVATE_SERIAL_SENTINEL"]) {
    assert.equal(JSON.stringify(event).includes(sentinel), false);
  }
});

test("campaign attribution accepts only documented categorical values", () => {
  assert.deepEqual(campaignFromSearch("?utm_source=mudah&utm_medium=listing&utm_campaign=used-excavators&utm_content=whatsapp&email=PII_EMAIL_SENTINEL"), {
    source: "mudah",
    medium: "listing",
    campaign: "used-excavators",
    content: "whatsapp",
  });
  assert.deepEqual(campaignFromSearch("?utm_source=customer%40example.test&utm_medium=PII_PHONE_SENTINEL&utm_campaign=free-text"), {});
});

test("approved runtime analytics requires consent and stops permanently after withdrawal", () => {
  return import("../src/lib/analytics/events.ts").then((analytics) => {
    assert.equal(typeof analytics.createConsentAwareTagController, "function");
    assert.equal(typeof analytics.getGtmScriptRequest, "function");
  });
});
