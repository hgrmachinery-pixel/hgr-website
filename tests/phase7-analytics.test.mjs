import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("local-review sample acceptance is explicitly ineligible while real adapter acceptance is eligible", async () => {
  const actions = await readFile(new URL("../src/app/(site)/contact/actions.ts", import.meta.url), "utf8");
  assert.match(actions, /if \(isLocalReviewMode\(\)\)[\s\S]*?status:\s*"accepted",\s*measurementEligible:\s*false/);
  assert.match(actions, /if \(result\.status === "accepted"\) return \{[\s\S]*?measurementEligible:\s*true/);
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

test("public inventory, unit and contact routes wire distinct intent events", async () => {
  const inventoryPage = await readFile(new URL("../src/app/(site)/used-excavators/page.tsx", import.meta.url), "utf8");
  assert.match(inventoryPage, /name:\s*"inventory_list_view"/);
  const [machinePage, supportingPage, analyticsProvider, enquiryForm] = await Promise.all([
    readFile(new URL("../src/app/(site)/machines/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/(site)/[supportingPage]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/site/AnalyticsProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/site/EnquiryForm.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(machinePage, /name:\s*"machine_view",\s*machineReference:\s*machine\.reference/);
  assert.match(machinePage, /TrackedContactLink/);
  assert.match(supportingPage, /TrackedContactLink/);
  assert.match(analyticsProvider, /name:\s*"contact_intent"/);
  assert.doesNotMatch(analyticsProvider, /href:\s*href|page_url|link_destination/);
  assert.match(enquiryForm, /onFocus:\s*name === "viewingPreference" \? onViewingFocus/);
  const viewingHandler = enquiryForm.match(/const onViewingFocus = \(\) => \{([\s\S]*?)\n  \};/)?.[1] ?? "";
  assert.notEqual(viewingHandler, "");
  assert.doesNotMatch(viewingHandler, /currentTarget|FormData|\.value/);

  const analytics = await import("../src/lib/analytics/events.ts");
  assert.deepEqual([
    analytics.createAnalyticsEvent({ name: "inventory_list_view" }).event,
    analytics.createAnalyticsEvent({ name: "machine_view", machineReference: "HGR-900001" }).event,
    analytics.createAnalyticsEvent({ name: "contact_intent", contactChannel: "whatsapp" }).event,
    analytics.createAnalyticsEvent({ name: "enquiry_start", enquiryKind: "machine" }).event,
    analytics.createAnalyticsEvent({ name: "viewing_intent", machineReference: "HGR-900001" }).event,
    analytics.createAnalyticsEvent({ name: "enquiry_accepted", enquiryKind: "machine" }).event,
  ], ["inventory_list_view", "machine_view", "contact_intent", "enquiry_start", "viewing_intent", "enquiry_accepted"]);
});
