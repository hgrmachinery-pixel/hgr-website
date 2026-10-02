export const analyticsEventNames = [
  "inventory_list_view",
  "machine_view",
  "contact_intent",
  "enquiry_start",
  "viewing_intent",
  "enquiry_accepted",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type EnquiryKind = "general" | "machine" | "rental" | "service" | "lubricant";
export type ContactChannel = "whatsapp" | "phone" | "email";
export type SupportingPageGroup = "contact" | "rental" | "machinery-services" | "lubricants" | "about";
export type CampaignAttribution = {
  source?: "mudah" | "google" | "facebook" | "hgr";
  medium?: "referral" | "organic" | "paid-search" | "paid-social" | "listing";
  campaign?: "used-excavators" | "machine-viewing" | "brand-awareness";
  content?: "whatsapp" | "phone" | "viewing";
};

export type AnalyticsEvent = {
  event: AnalyticsEventName;
  machine_reference?: string;
  enquiry_kind?: EnquiryKind;
  contact_channel?: ContactChannel;
  page_group?: SupportingPageGroup;
  campaign_source?: CampaignAttribution["source"];
  campaign_medium?: CampaignAttribution["medium"];
  campaign_name?: CampaignAttribution["campaign"];
  campaign_content?: CampaignAttribution["content"];
};

type EventInput = {
  name: AnalyticsEventName;
  machineReference?: unknown;
  enquiryKind?: unknown;
  contactChannel?: unknown;
  pageGroup?: unknown;
  campaign?: unknown;
};

const enquiryKinds = ["general", "machine", "rental", "service", "lubricant"] as const;
const contactChannels = ["whatsapp", "phone", "email"] as const;
const pageGroups = ["contact", "rental", "machinery-services", "lubricants", "about"] as const;
const campaignValues = {
  source: ["mudah", "google", "facebook", "hgr"],
  medium: ["referral", "organic", "paid-search", "paid-social", "listing"],
  campaign: ["used-excavators", "machine-viewing", "brand-awareness"],
  content: ["whatsapp", "phone", "viewing"],
} as const;

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : undefined;
}

function safeMachineReference(value: unknown): string | undefined {
  return typeof value === "string" && /^HGR-[0-9]{6,}$/i.test(value) ? value.toUpperCase() : undefined;
}

export function allowCampaignAttribution(value: unknown): CampaignAttribution {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const source = oneOf(input.source, campaignValues.source);
  const medium = oneOf(input.medium, campaignValues.medium);
  const campaign = oneOf(input.campaign, campaignValues.campaign);
  const content = oneOf(input.content, campaignValues.content);
  return {
    ...(source ? { source } : {}),
    ...(medium ? { medium } : {}),
    ...(campaign ? { campaign } : {}),
    ...(content ? { content } : {}),
  };
}

/** Reads only the small, documented campaign vocabulary; it never returns other query values. */
export function campaignFromSearch(search: string): CampaignAttribution {
  const params = new URLSearchParams(search);
  return allowCampaignAttribution({
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  });
}

/** Constructs event payloads field by field and intentionally ignores unknown input fields. */
export function createAnalyticsEvent(input: EventInput): AnalyticsEvent {
  const event: AnalyticsEvent = { event: input.name };
  const machineReference = safeMachineReference(input.machineReference);
  const enquiryKind = oneOf(input.enquiryKind, enquiryKinds);
  const contactChannel = oneOf(input.contactChannel, contactChannels);
  const pageGroup = oneOf(input.pageGroup, pageGroups);
  const campaign = allowCampaignAttribution(input.campaign);

  if (["machine_view", "contact_intent", "enquiry_start", "viewing_intent", "enquiry_accepted"].includes(input.name) && machineReference) {
    event.machine_reference = machineReference;
  }
  if (["enquiry_start", "enquiry_accepted"].includes(input.name) && enquiryKind) event.enquiry_kind = enquiryKind;
  if (input.name === "contact_intent" && contactChannel) event.contact_channel = contactChannel;
  if (["contact_intent", "enquiry_start"].includes(input.name) && pageGroup) event.page_group = pageGroup;
  if (campaign.source) event.campaign_source = campaign.source;
  if (campaign.medium) event.campaign_medium = campaign.medium;
  if (campaign.campaign) event.campaign_name = campaign.campaign;
  if (campaign.content) event.campaign_content = campaign.content;
  return event;
}

export function eventWithCampaignAttribution(event: AnalyticsEvent, campaign: unknown): AnalyticsEvent {
  return createAnalyticsEvent({
    name: event.event,
    machineReference: event.machine_reference,
    enquiryKind: event.enquiry_kind,
    contactChannel: event.contact_channel,
    pageGroup: event.page_group,
    campaign,
  });
}

export type AcceptedEnquiryState = {
  status?: string;
  measurementEligible?: boolean;
  measurementKind?: unknown;
  measurementMachineReference?: unknown;
};

export type ConsentChoice = "unknown" | "granted" | "denied";
export type AnalyticsConsent = { analytics: ConsentChoice; advertising: ConsentChoice };
export type AnalyticsRuntimeConfig = { enabled: boolean; containerId?: unknown; localReview?: boolean };
export type GtmScriptRequest = { url: string; referrerPolicy: "no-referrer" };

const unknownConsent: AnalyticsConsent = { analytics: "unknown", advertising: "unknown" };

function consentChoice(value: unknown): ConsentChoice {
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function parseAnalyticsConsent(value: unknown): AnalyticsConsent {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return { ...unknownConsent };
    }
  }
  if (!parsed || typeof parsed !== "object") return { ...unknownConsent };
  const input = parsed as Record<string, unknown>;
  return { analytics: consentChoice(input.analytics), advertising: consentChoice(input.advertising) };
}

export function isValidGtmContainerId(value: unknown): value is string {
  return typeof value === "string" && /^GTM-[A-Z0-9]+$/.test(value);
}

export function getGtmScriptRequest(config: AnalyticsRuntimeConfig): GtmScriptRequest | null {
  if (!config.enabled || config.localReview || !isValidGtmContainerId(config.containerId)) return null;
  return {
    url: "https://www.googletagmanager.com/gtm.js?id=" + config.containerId,
    referrerPolicy: "no-referrer",
  };
}

function sanitizeAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = oneOf(input.event, analyticsEventNames);
  if (!name) return null;
  return createAnalyticsEvent({
    name,
    machineReference: input.machine_reference,
    enquiryKind: input.enquiry_kind,
    contactChannel: input.contact_channel,
    pageGroup: input.page_group,
    campaign: {
      source: input.campaign_source,
      medium: input.campaign_medium,
      campaign: input.campaign_name,
      content: input.campaign_content,
    },
  });
}

/** Small testable consent boundary. It never buffers events and a withdrawal is final for this page load. */
export function createConsentAwareTagController(
  config: AnalyticsRuntimeConfig,
  loadTag: (request: GtmScriptRequest) => () => void,
  transmit: (event: AnalyticsEvent) => void,
) {
  const request = getGtmScriptRequest(config);
  let consent = { ...unknownConsent };
  let active = false;
  let withdrawn = false;
  let unload: (() => void) | null = null;

  function deactivate(withdrawal: boolean) {
    if (withdrawal && active) withdrawn = true;
    unload?.();
    unload = null;
    active = false;
  }

  return {
    setConsent(next: unknown) {
      const updated = parseAnalyticsConsent(next);
      if (active && updated.analytics !== "granted") deactivate(true);
      consent = updated;
      if (request && consent.analytics === "granted" && !active && !withdrawn) {
        unload = loadTag(request);
        active = true;
      }
    },
    track(value: unknown) {
      if (!active || withdrawn || consent.analytics !== "granted") return;
      const event = sanitizeAnalyticsEvent(value);
      if (event) transmit(event);
    },
    dispose() {
      deactivate(false);
    },
    get isActive() {
      return active && !withdrawn;
    },
  };
}

export function acceptedEnquiryEvent(state: AcceptedEnquiryState, campaign?: unknown): AnalyticsEvent | null {
  if (state.status !== "accepted" || state.measurementEligible !== true) return null;
  return createAnalyticsEvent({
    name: "enquiry_accepted",
    enquiryKind: state.measurementKind,
    machineReference: state.measurementMachineReference,
    campaign,
  });
}

/** Suppresses concurrent submits and repeated renders of one result object without storing submissions. */
export function createEnquiryEventGate() {
  let pending = false;
  let lastAcceptedState: AcceptedEnquiryState | null = null;
  return {
    begin(): boolean {
      if (pending) return false;
      pending = true;
      return true;
    },
    settle(state: AcceptedEnquiryState, campaign?: unknown): AnalyticsEvent | null {
      pending = false;
      if (state.status !== "accepted" || state.measurementEligible !== true || state === lastAcceptedState) return null;
      lastAcceptedState = state;
      return acceptedEnquiryEvent(state, campaign);
    },
  };
}

const analyticsEvent = "hgr:analytics-event";

/** Events are dispatched synchronously and are dropped when no consented provider listens. */
export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(analyticsEvent, { detail: event }));
}

export function analyticsEventType(): string {
  return analyticsEvent;
}
