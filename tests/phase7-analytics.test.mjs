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

test("approved runtime analytics requires runtime config and consent, and stops after withdrawal", async () => {
  const analytics = await import("../src/lib/analytics/events.ts");
  const publicConfig = { enabled: true, containerId: "GTM-ABC123" };
  for (const config of [
    { enabled: false, containerId: "GTM-ABC123" },
    { enabled: true },
    { enabled: true, containerId: "secret-looking-value" },
    { enabled: true, containerId: "GTM-ABC123", localReview: true },
  ]) assert.equal(analytics.getGtmScriptRequest(config), null);

  const request = analytics.getGtmScriptRequest(publicConfig);
  assert.deepEqual(request, {
    url: "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123",
    referrerPolicy: "no-referrer",
  });
  const loaded = [];
  const sent = [];
  let unloadCount = 0;
  const controller = analytics.createConsentAwareTagController(
    publicConfig,
    (scriptRequest) => {
      loaded.push(scriptRequest);
      return () => { unloadCount += 1; };
    },
    (event) => sent.push(event),
  );

  const beforeConsent = { event: "contact_intent", contact_channel: "whatsapp" };
  controller.track(beforeConsent);
  controller.setConsent({ analytics: "unknown", advertising: "unknown" });
  controller.setConsent({ analytics: "denied", advertising: "granted" });
  assert.equal(loaded.length, 0);
  assert.equal(sent.length, 0);

  const consent = analytics.parseAnalyticsConsent({ analytics: "granted", advertising: "denied" });
  assert.deepEqual(consent, { analytics: "granted", advertising: "denied" });
  controller.setConsent(consent);
  assert.equal(loaded.length, 1);
  assert.deepEqual(loaded[0], request);
  assert.equal(sent.length, 0, "pre-consent events are dropped and never replayed");

  controller.track({
    event: "contact_intent",
    contact_channel: "whatsapp",
    machine_reference: "HGR-900001",
    email: "PII_EMAIL_SENTINEL",
    phone: "PII_PHONE_SENTINEL",
    message: "PII_MESSAGE_SENTINEL",
    serial: "PRIVATE_SERIAL_SENTINEL",
    page_url: "https://example.test/?email=PII_URL_SENTINEL",
    title: "PII_TITLE_SENTINEL",
    referrer: "PII_REFERRER_SENTINEL",
    link_destination: "https://wa.me/?text=PII_LINK_SENTINEL",
  });
  assert.deepEqual(sent, [{
    event: "contact_intent",
    machine_reference: "HGR-900001",
    contact_channel: "whatsapp",
  }]);

  const mockedOutbound = JSON.stringify({ requests: loaded, events: sent });
  for (const sentinel of ["PII_EMAIL_SENTINEL", "PII_PHONE_SENTINEL", "PII_MESSAGE_SENTINEL", "PRIVATE_SERIAL_SENTINEL", "PII_URL_SENTINEL", "PII_TITLE_SENTINEL", "PII_REFERRER_SENTINEL", "PII_LINK_SENTINEL"]) {
    assert.equal(mockedOutbound.includes(sentinel), false);
  }
  assert.equal(request.referrerPolicy, "no-referrer");

  controller.setConsent({ analytics: "denied", advertising: "granted" });
  assert.equal(unloadCount, 1);
  assert.equal(controller.isActive, false);
  controller.track({ event: "enquiry_accepted", enquiry_kind: "general" });
  controller.setConsent({ analytics: "granted", advertising: "denied" });
  assert.equal(loaded.length, 1, "a withdrawn provider does not automatically reactivate during this page load");
  assert.equal(sent.length, 1, "events after withdrawal are dropped");
  controller.dispose();
});
