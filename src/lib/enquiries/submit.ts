export type EnquiryKind = "general" | "machine" | "rental" | "service" | "lubricant";

export type EnquiryInput = {
  kind: EnquiryKind;
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  projectLocation?: unknown;
  projectTiming?: unknown;
  viewingPreference?: unknown;
  machineInterest?: unknown;
  machineLocation?: unknown;
  product?: unknown;
  application?: unknown;
  quantity?: unknown;
  website?: unknown;
};

type CleanEnquiry = Record<string, string> & { kind: EnquiryKind };
type EnquiryContext = { machine?: { reference: string; title: string }; pagePath?: string };
export type EnquiryField = keyof Omit<EnquiryInput, "kind" | "website">;
export type EnquiryFieldErrors = Partial<Record<EnquiryField, string>>;
export type DeliveryResult = { status: "accepted" | "unavailable" | "failed" | "invalid"; errors?: string[]; fieldErrors?: EnquiryFieldErrors };
export type MailAdapter = (message: { fields: CleanEnquiry; context: EnquiryContext }) => Promise<{ accepted: boolean }>;

const limits: Record<string, number> = {
  name: 160, company: 160, phone: 40, email: 254, message: 4000,
  projectLocation: 200, projectTiming: 120, machineInterest: 200,
  viewingPreference: 200, machineLocation: 200, product: 160, application: 300, quantity: 80,
};

const requiredByKind: Record<EnquiryKind, string[]> = {
  general: ["name", "phone", "message"], machine: ["name", "phone", "message"],
  rental: ["name", "phone", "projectLocation"], service: ["name", "phone", "machineLocation", "message"],
  lubricant: ["name", "phone"],
};

export function validateEnquiry(input: EnquiryInput): { ok: true; fields: CleanEnquiry } | { ok: false; errors: string[]; fieldErrors?: EnquiryFieldErrors } {
  const kinds: EnquiryKind[] = ["general", "machine", "rental", "service", "lubricant"];
  if (!input || !kinds.includes(input.kind)) return { ok: false, errors: ["Choose a valid enquiry type."] };
  if (typeof input.website === "string" && input.website.trim()) return { ok: false, errors: ["Submission could not be accepted."] };
  const fields: CleanEnquiry = { kind: input.kind };
  const errors: string[] = [];
  const fieldErrors: EnquiryFieldErrors = {};
  const addFieldError = (key: string, message: string) => {
    errors.push(message);
    if (key in limits && !fieldErrors[key as EnquiryField]) fieldErrors[key as EnquiryField] = message;
  };
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key as keyof EnquiryInput];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string" || value.length > max) { addFieldError(key, `${fieldLabels[key] ?? key} is too long or invalid.`); continue; }
    const clean = value.trim();
    if (clean) fields[key] = clean;
  }
  for (const key of requiredByKind[input.kind]) if (!fields[key]) addFieldError(key, `${fieldLabels[key] ?? key} is required.`);
  if (fields.phone && !/[0-9]/.test(fields.phone)) addFieldError("phone", "Enter a valid phone number.");
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) addFieldError("email", "Enter a valid email address.");
  return errors.length ? { ok: false, errors, fieldErrors } : { ok: true, fields };
}

const fieldLabels: Record<string, string> = {
  name: "Name", company: "Company", phone: "Phone", email: "Email", message: "Message",
  projectLocation: "Project location", projectTiming: "Project timing", viewingPreference: "Viewing preference",
  machineInterest: "Machine of interest", machineLocation: "Machine location", product: "Product",
  application: "Application", quantity: "Quantity",
};

export async function submitEnquiry(input: EnquiryInput, adapter: MailAdapter, context: EnquiryContext = {}): Promise<DeliveryResult> {
  const validation = validateEnquiry(input);
  if (!validation.ok) return { status: "invalid", errors: validation.errors, fieldErrors: validation.fieldErrors };
  try {
    const result = await adapter({ fields: validation.fields, context: safeContext(context) });
    return result?.accepted === true ? { status: "accepted" } : { status: "unavailable" };
  } catch {
    return { status: "failed" };
  }
}

function safeContext(context: EnquiryContext): EnquiryContext {
  const result: EnquiryContext = {};
  if (context.machine && /^[A-Za-z0-9-]{1,40}$/.test(context.machine.reference) && context.machine.title.length <= 200) {
    result.machine = { reference: context.machine.reference, title: context.machine.title };
  }
  if (context.pagePath && /^\/[a-z0-9/-]{1,200}$/.test(context.pagePath)) result.pagePath = context.pagePath;
  return result;
}
