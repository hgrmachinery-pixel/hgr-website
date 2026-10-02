"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { getPublicMachineForSlug } from "../../../lib/machines/publicQueries";
import { smtpEnquiryAdapter } from "../../../lib/email/enquiryAdapter";
import { submitEnquiry, type EnquiryFieldErrors, type EnquiryKind, type EnquiryMetadata } from "../../../lib/enquiries/submit.ts";
import { isLocalReviewMode } from "../../../lib/machines/publicQueries.ts";
import { headers } from "next/headers";

export type EnquiryFormState = {
  status: "idle" | "invalid" | "unavailable" | "failed" | "accepted";
  message?: string;
  errors?: string[];
  fieldErrors?: EnquiryFieldErrors;
  values?: Record<string, string>;
  measurementEligible?: boolean;
  measurementKind?: EnquiryKind;
  measurementMachineReference?: string;
};

const publicKinds: EnquiryKind[] = ["general", "machine", "rental", "service", "lubricant"];

export async function sendEnquiry(expectedKind: EnquiryKind, expectedMachineSlug: string | undefined, _previous: EnquiryFormState, formData: FormData): Promise<EnquiryFormState> {
  const kind = publicKinds.includes(expectedKind) ? expectedKind : "general";
  const input: Record<string, unknown> = { kind };
  const submittedKeys = ["name", "company", "phone", "email", "preferredContact", "subject", "message", "machineRequired", "startDate", "rentalDuration", "needOperator", "projectLocation", "projectTiming", "viewingPreference", "machineInterest", "machineLocation", "brand", "model", "problemDescription", "urgent", "machineBrand", "machineModel", "lubricantRequired", "product", "application", "quantity", "purchaseTimeline", "budget", "tradeIn", "tradeInBrand", "tradeInModel", "tradeInYear", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "website"];
  for (const key of submittedKeys) {
    const value = formData.get(key);
    if (typeof value === "string") input[key] = value;
  }
  const valueLimits: Record<string, number> = { name: 160, company: 160, phone: 40, email: 254, preferredContact: 20, subject: 40, message: 4000, machineRequired: 160, startDate: 10, rentalDuration: 120, needOperator: 10, projectLocation: 200, projectTiming: 120, viewingPreference: 200, machineInterest: 200, machineLocation: 200, brand: 100, model: 100, problemDescription: 4000, urgent: 10, machineBrand: 100, machineModel: 100, lubricantRequired: 160, product: 160, application: 300, quantity: 80, purchaseTimeline: 80, budget: 80, tradeIn: 10, tradeInBrand: 100, tradeInModel: 100, tradeInYear: 4, referrer: 500, utmSource: 200, utmMedium: 200, utmCampaign: 200, utmTerm: 200, utmContent: 200 };
  const values = Object.fromEntries(Object.entries(input)
    .filter(([key, value]) => key !== "kind" && key !== "website" && typeof value === "string" && key in valueLimits)
    .map(([key, value]) => [key, (value as string).slice(0, valueLimits[key])]));
  let context: { machine?: { reference: string; title: string }; pagePath?: string; metadata?: EnquiryMetadata } = {};
  if (kind === "machine" && expectedMachineSlug) {
    const result = await getPublicMachineForSlug(expectedMachineSlug);
    if (result.machine) {
      context = {
        machine: { reference: result.machine.reference, title: [result.machine.year, result.machine.brand, result.machine.model].filter(Boolean).join(" ") || `Excavator ${result.machine.reference}` },
        pagePath: `/machines/${result.machine.slug}`,
      };
    }
  }
  if (kind === "machine" && !context.machine) {
    return { status: "invalid", errors: ["This machine page is no longer available. Please choose another machine or send a general enquiry."], values };
  }
  const requestHeaders = await headers();
  context.metadata = {
    leadSource: `website:${kind}`,
    referrer: typeof input.referrer === "string" ? input.referrer : requestHeaders.get("referer") ?? undefined,
    utmSource: typeof input.utmSource === "string" ? input.utmSource : undefined,
    utmMedium: typeof input.utmMedium === "string" ? input.utmMedium : undefined,
    utmCampaign: typeof input.utmCampaign === "string" ? input.utmCampaign : undefined,
    utmTerm: typeof input.utmTerm === "string" ? input.utmTerm : undefined,
    utmContent: typeof input.utmContent === "string" ? input.utmContent : undefined,
    browser: requestHeaders.get("user-agent")?.slice(0, 500) ?? undefined,
    timestamp: new Date().toISOString(),
  };
  if (isLocalReviewMode()) {
    const validation = await submitEnquiry(input as never, async () => ({ accepted: true }), context);
    if (validation.status === "accepted") return { status: "accepted", measurementEligible: false, message: "Local review only: this sample enquiry was not sent or saved." };
    if (validation.status === "invalid") return { status: "invalid", errors: validation.errors, fieldErrors: validation.fieldErrors, values };
    return { status: "unavailable", message: "Local review only: no enquiry was sent or saved.", values };
  }
  const result = await submitEnquiry(input as never, smtpEnquiryAdapter, context);
  if (result.status === "accepted") return {
    status: "accepted",
    measurementEligible: true,
    measurementKind: kind,
    ...(context.machine?.reference ? { measurementMachineReference: context.machine.reference } : {}),
    message: "Thank you. Your enquiry has been received. Our team will contact you as soon as possible.",
  };
  if (result.status === "invalid") return { status: "invalid", errors: result.errors, fieldErrors: result.fieldErrors, values };
  if (result.status === "unavailable") return { status: "unavailable", message: "Online enquiries are not available right now. Please use the phone or WhatsApp options shown on this page when configured.", values };
  return { status: "failed", message: "We could not send your enquiry. Please try again later or use a direct contact option when available.", values };
}
