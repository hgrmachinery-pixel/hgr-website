import type { MailAdapter } from "../enquiries/submit.ts";

type Config = { apiKey: string; fromName: string; fromAddress: string; toAddress: string };
type ResendResponse = { id?: unknown; message?: unknown; name?: unknown };
type DiagnosticLogger = (event: string, details: Record<string, string | number | boolean>) => void;
type Fetcher = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

const emailPattern = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const oneLine = (value: string | undefined) => (value ?? "").trim().replace(/[\r\n\x00-\x1f\x7f]/g, "");
const hasControls = (value: string | undefined) => value !== undefined && /[\x00-\x1f\x7f]/.test(value);

function logEnquiryEmailDiagnostic(event: string, details: Record<string, string | number | boolean> = {}): void {
  // Intentionally log only fixed event names and non-sensitive API metadata.
  console.info("[hgr-enquiry-email]", JSON.stringify({ event, ...details }));
}

export function readEnquiryEmailConfig(env: NodeJS.ProcessEnv = process.env): Config | null {
  // Delivery remains opt-in and ignores only surrounding whitespace.
  if (env.ENQUIRY_EMAIL_ENABLED?.trim() !== "true") return null;
  const configKeys = ["RESEND_API_KEY", "MAIL_FROM_NAME", "MAIL_FROM_ADDRESS", "ENQUIRY_TO_EMAIL"] as const;
  if (configKeys.some((key) => env[key] === undefined || env[key] === "" || hasControls(env[key]))) return null;
  const apiKey = env.RESEND_API_KEY ?? "";
  const fromName = oneLine(env.MAIL_FROM_NAME);
  const fromAddress = oneLine(env.MAIL_FROM_ADDRESS);
  const toAddress = oneLine(env.ENQUIRY_TO_EMAIL);
  if (!apiKey.trim() || !fromName || !emailPattern.test(fromAddress) || !emailPattern.test(toAddress)) return null;
  return { apiKey, fromName, fromAddress, toAddress };
}

function configurationFailureReason(env: NodeJS.ProcessEnv): string {
  if (env.ENQUIRY_EMAIL_ENABLED?.trim() !== "true") return "disabled";
  const configKeys = ["RESEND_API_KEY", "MAIL_FROM_NAME", "MAIL_FROM_ADDRESS", "ENQUIRY_TO_EMAIL"] as const;
  const missing = configKeys.find((key) => env[key] === undefined || env[key] === "");
  if (missing) return `missing_${missing.toLowerCase()}`;
  if (configKeys.some((key) => hasControls(env[key]))) return "invalid_control_character";
  if (!oneLine(env.MAIL_FROM_NAME)) return "invalid_mail_from_name";
  if (!emailPattern.test(oneLine(env.MAIL_FROM_ADDRESS)) || !emailPattern.test(oneLine(env.ENQUIRY_TO_EMAIL))) return "invalid_email_address";
  return "invalid_resend_configuration";
}

function errorCode(error: unknown): string {
  const candidate = (error as { cause?: { code?: unknown }; code?: unknown })?.cause?.code ?? (error as { code?: unknown })?.code;
  return typeof candidate === "string" && /^[A-Z0-9_]{1,40}$/.test(candidate) ? candidate : "UNKNOWN";
}

function responseCategory(status: number, body: ResendResponse): string {
  const errorName = typeof body.name === "string" ? body.name.toLowerCase() : "";
  if (status === 401 || status === 403 || errorName.includes("api_key") || errorName.includes("authentication")) return "authentication_failure";
  return "provider_rejected";
}

export function createResendEnquiryAdapter(
  getConfig: () => Config | null = () => readEnquiryEmailConfig(),
  fetcher: Fetcher = fetch,
  logger: DiagnosticLogger = logEnquiryEmailDiagnostic,
  getFailureReason: () => string = () => configurationFailureReason(process.env),
): MailAdapter {
  return async ({ fields, context }) => {
    const config = getConfig();
    if (!config) {
      logger("configuration_unavailable", { reason: getFailureReason() });
      return { accepted: false };
    }

    const replyTo = fields.email && emailPattern.test(fields.email) ? fields.email : undefined;
    const lines = [
      `Enquiry type: ${fields.kind}`, `Name: ${fields.name ?? ""}`, `Company: ${fields.company ?? ""}`,
      `Phone: ${fields.phone ?? ""}`, `Email: ${fields.email ?? ""}`,
      ...(context.inventory ? [`Inventory name: ${context.inventory.name}`, `Inventory type: ${context.inventory.type}`, `Reference number: ${context.inventory.referenceNumber ?? "Not supplied"}`, `Canonical URL: ${context.inventory.canonicalURL ?? "Not supplied"}`] : []),
      ...Object.entries(fields).filter(([key]) => !["kind", "name", "company", "phone", "email"].includes(key)).map(([key, value]) => `${key}: ${value}`),
      ...(context.machine ? [`Machine: ${context.machine.reference} — ${context.machine.title}`] : []),
      ...(context.pagePath ? [`Page: ${context.pagePath}`] : []),
      ...(context.metadata ? [
        `Lead source: ${context.metadata.leadSource}`,
        `Referrer: ${context.metadata.referrer ?? ""}`,
        `UTM source: ${context.metadata.utmSource ?? ""}`,
        `UTM medium: ${context.metadata.utmMedium ?? ""}`,
        `UTM campaign: ${context.metadata.utmCampaign ?? ""}`,
        `UTM term: ${context.metadata.utmTerm ?? ""}`,
        `UTM content: ${context.metadata.utmContent ?? ""}`,
        `Browser: ${context.metadata.browser ?? ""}`,
        `Timestamp: ${context.metadata.timestamp}`,
      ] : []),
    ];

    try {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromAddress}>`,
          to: [config.toAddress],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject: `Website ${fields.kind} enquiry`,
          text: lines.join("\n"),
        }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });

      let body: ResendResponse = {};
      try { body = await response.json() as ResendResponse; } catch { /* Invalid provider response is logged only by status. */ }
      if (!response.ok || typeof body.id !== "string" || !body.id) {
        const category = responseCategory(response.status, body);
        logger(category, { status: response.status });
        return { accepted: false };
      }

      logger("provider_accepted", { status: response.status });
      return { accepted: true };
    } catch (error) {
      const code = errorCode(error);
      const category = code === "ETIMEDOUT" || code === "ECONNABORTED" || (error instanceof Error && error.name === "TimeoutError")
        ? "provider_timeout"
        : "provider_connection_failure";
      logger(category, { code });
      return { accepted: false };
    }
  };
}

export const resendEnquiryAdapter = createResendEnquiryAdapter();
