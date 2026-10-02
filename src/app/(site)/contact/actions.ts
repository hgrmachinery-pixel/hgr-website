"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { getPublicMachineForSlug } from "../../../lib/machines/publicQueries";
import { smtpEnquiryAdapter } from "../../../lib/email/enquiryAdapter";
import { submitEnquiry, type EnquiryKind } from "../../../lib/enquiries/submit.ts";

export type EnquiryFormState = {
  status: "idle" | "invalid" | "unavailable" | "failed" | "accepted";
  message?: string;
  errors?: string[];
  values?: Record<string, string>;
};

const publicKinds: EnquiryKind[] = ["general", "machine", "rental", "service", "lubricant"];

export async function sendEnquiry(expectedKind: EnquiryKind, expectedMachineSlug: string | undefined, _previous: EnquiryFormState, formData: FormData): Promise<EnquiryFormState> {
  const kind = publicKinds.includes(expectedKind) ? expectedKind : "general";
  const input: Record<string, unknown> = { kind };
  for (const key of ["name", "company", "phone", "email", "message", "projectLocation", "projectTiming", "viewingPreference", "machineInterest", "machineLocation", "product", "application", "quantity", "website"]) {
    const value = formData.get(key);
    if (typeof value === "string") input[key] = value;
  }
  const valueLimits: Record<string, number> = { name: 160, company: 160, phone: 40, email: 254, message: 4000, projectLocation: 200, projectTiming: 120, viewingPreference: 200, machineInterest: 200, machineLocation: 200, product: 160, application: 300, quantity: 80 };
  const values = Object.fromEntries(Object.entries(input)
    .filter(([key, value]) => key !== "kind" && key !== "website" && typeof value === "string" && key in valueLimits)
    .map(([key, value]) => [key, (value as string).slice(0, valueLimits[key])]));
  let context: { machine?: { reference: string; title: string }; pagePath?: string } = {};
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
  const result = await submitEnquiry(input as never, smtpEnquiryAdapter, context);
  if (result.status === "accepted") return { status: "accepted", message: "Your enquiry was accepted for delivery." };
  if (result.status === "invalid") return { status: "invalid", errors: result.errors, values };
  if (result.status === "unavailable") return { status: "unavailable", message: "Online enquiries are not available right now. Please use the phone or WhatsApp options shown on this page when configured.", values };
  return { status: "failed", message: "We could not send your enquiry. Please try again later or use a direct contact option when available.", values };
}
