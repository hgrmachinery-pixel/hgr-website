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

export type AcceptedEnquiryState = {
  status?: string;
  measurementEligible?: boolean;
  measurementKind?: unknown;
  measurementMachineReference?: unknown;
};

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
