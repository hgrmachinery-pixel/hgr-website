export type EnquiryKind = "general" | "machine" | "rental" | "service" | "lubricant";
export type InventoryType = "used-machine" | "spare-part" | "lubricant" | "rental-machine" | "attachment";
export type InventoryIdentity = { name: string; type: InventoryType; referenceNumber?: string; canonicalURL?: string };

export type EnquiryInput = {
  kind: EnquiryKind;
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  email?: unknown;
  preferredContact?: unknown;
  subject?: unknown;
  message?: unknown;
  machineRequired?: unknown;
  startDate?: unknown;
  rentalDuration?: unknown;
  needOperator?: unknown;
  brand?: unknown;
  model?: unknown;
  problemDescription?: unknown;
  urgent?: unknown;
  machineBrand?: unknown;
  machineModel?: unknown;
  lubricantRequired?: unknown;
  purchaseTimeline?: unknown;
  budget?: unknown;
  tradeIn?: unknown;
  tradeInBrand?: unknown;
  tradeInModel?: unknown;
  tradeInYear?: unknown;
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

type CleanEnquiry = Record<string, string> & { kind: EnquiryKind; phone: string; preferredContact: "whatsapp" | "phone" | "email" };
export type EnquiryMetadata = {
  leadSource: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  browser?: string;
  timestamp: string;
};
type EnquiryContext = { machine?: { reference: string; title: string }; inventory?: InventoryIdentity; pagePath?: string; metadata?: EnquiryMetadata };
export type EnquiryField = keyof Omit<EnquiryInput, "kind" | "website">;
export type EnquiryFieldErrors = Partial<Record<EnquiryField, string>>;
export type DeliveryResult = { status: "accepted" | "unavailable" | "failed" | "invalid"; errors?: string[]; fieldErrors?: EnquiryFieldErrors };
export type MailAdapter = (message: { fields: CleanEnquiry; context: EnquiryContext }) => Promise<{ accepted: boolean }>;

const limits: Record<string, number> = {
  name: 160, company: 160, phone: 40, email: 254, message: 4000,
  preferredContact: 20, subject: 40, machineRequired: 160, startDate: 10, rentalDuration: 120, needOperator: 10,
  brand: 100, model: 100, problemDescription: 4000, urgent: 10, machineBrand: 100, machineModel: 100,
  lubricantRequired: 160, purchaseTimeline: 80, budget: 80, tradeIn: 10, tradeInBrand: 100, tradeInModel: 100, tradeInYear: 4,
  projectLocation: 200, projectTiming: 120, machineInterest: 200,
  viewingPreference: 200, machineLocation: 200, product: 160, application: 300, quantity: 80,
};

const requiredByKind: Record<EnquiryKind, string[]> = {
  general: ["name", "phone", "message", "subject"], machine: ["name", "phone", "message"],
  rental: ["name", "phone", "machineRequired", "startDate", "rentalDuration", "projectLocation", "needOperator"],
  service: ["name", "phone", "brand", "model", "problemDescription", "machineLocation", "urgent"],
  lubricant: ["name", "phone", "machineBrand", "lubricantRequired", "quantity"],
};

export function validateEnquiry(input: EnquiryInput): { ok: true; fields: CleanEnquiry } | { ok: false; errors: string[]; fieldErrors?: EnquiryFieldErrors } {
  const kinds: EnquiryKind[] = ["general", "machine", "rental", "service", "lubricant"];
  if (!input || !kinds.includes(input.kind)) return { ok: false, errors: ["Choose a valid enquiry type."] };
  if (typeof input.website === "string" && input.website.trim()) return { ok: false, errors: ["Submission could not be accepted."] };
  const fields = { kind: input.kind } as CleanEnquiry;
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
    let clean = value.trim();
    if (key === "email") clean = clean.toLowerCase();
    if (key === "name") clean = titleCaseName(clean);
    if (key === "phone") {
      const phone = normalizeMalaysianMobile(clean);
      if (!phone) addFieldError("phone", "Enter a valid Malaysian mobile number.");
      else clean = phone;
    }
    if (clean) fields[key] = clean;
  }
  const preferredContact = input.preferredContact === undefined || input.preferredContact === "" ? "whatsapp" : input.preferredContact;
  if (preferredContact !== "whatsapp" && preferredContact !== "phone" && preferredContact !== "email") addFieldError("preferredContact", "Choose a valid preferred contact method.");
  else fields.preferredContact = preferredContact;
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) addFieldError("email", "Enter a valid email address.");
  if (fields.preferredContact === "email" && !fields.email) addFieldError("email", "Email is required when Email is your preferred contact method.");
  for (const key of requiredByKind[input.kind]) if (!fields[key]) addFieldError(key, `${fieldLabels[key] ?? key} is required.`);
  if (input.kind === "machine" && fields.tradeIn === "yes") {
    for (const key of ["tradeInBrand", "tradeInModel", "tradeInYear"]) if (!fields[key]) addFieldError(key, `${fieldLabels[key]} is required when trade-in is selected.`);
  }
  const allowedValues: Partial<Record<string, string[]>> = {
    preferredContact: ["whatsapp", "phone", "email"], subject: ["General", "Sales", "Parts", "Rental", "Service", "Others"],
    needOperator: ["yes", "no"], urgent: ["yes", "no"], tradeIn: ["yes", "no"],
  };
  for (const [key, choices] of Object.entries(allowedValues)) if (choices && fields[key] && !choices.includes(fields[key])) addFieldError(key, `Choose a valid ${fieldLabels[key] ?? key.toLowerCase()} option.`);
  if (fields.startDate && !isValidDate(fields.startDate)) addFieldError("startDate", "Enter a valid start date.");
  if (input.kind === "machine" && fields.tradeInYear && !/^(19\d{2}|20\d{2})$/.test(fields.tradeInYear)) addFieldError("tradeInYear", "Enter a valid year.");
  return errors.length ? { ok: false, errors, fieldErrors } : { ok: true, fields };
}

const fieldLabels: Record<string, string> = {
  name: "Name", company: "Company", phone: "Phone", email: "Email", message: "Message",
  projectLocation: "Project location", projectTiming: "Project timing", viewingPreference: "Viewing preference",
  machineInterest: "Machine of interest", machineLocation: "Machine location", product: "Product",
  application: "Application", quantity: "Quantity", preferredContact: "Preferred contact", subject: "Subject",
  machineRequired: "Machine required", startDate: "Start date", rentalDuration: "Rental duration", needOperator: "Need operator",
  brand: "Brand", model: "Model", problemDescription: "Problem description", urgent: "Urgent", machineBrand: "Machine brand",
  machineModel: "Machine model", lubricantRequired: "Lubricant required", purchaseTimeline: "Purchase timeline", budget: "Budget",
  tradeIn: "Trade-in", tradeInBrand: "Trade-in brand", tradeInModel: "Trade-in model", tradeInYear: "Trade-in year",
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
  if (context.metadata) {
    const metadata: EnquiryMetadata = { leadSource: context.metadata.leadSource.slice(0, 80), timestamp: context.metadata.timestamp };
    for (const key of ["referrer", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "browser"] as const) {
      const value = context.metadata[key];
      if (typeof value === "string" && value.length <= 500 && !/[\r\n\x00-\x1f\x7f]/.test(value)) metadata[key] = key === "referrer" ? safeReferrer(value) : value;
    }
    if (!/^\d{4}-\d\d-\d\dT/.test(metadata.timestamp)) metadata.timestamp = new Date().toISOString();
    result.metadata = metadata;
  }
  return result;
}

function safeReferrer(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return undefined;
  }
}

function normalizeMalaysianMobile(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("60")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^1[0-9]{8,9}$/.test(digits) ? `+60${digits}` : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function titleCaseName(value: string): string {
  return value.replace(/\s+/g, " ").toLocaleLowerCase("en-MY").replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-MY"));
}
