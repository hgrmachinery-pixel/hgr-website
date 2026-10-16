import nodemailer from "nodemailer";
import type { MailAdapter } from "../enquiries/submit.ts";

type Config = { enabled: boolean; host: string; port: 465 | 587; user: string; password: string; fromName: string; fromAddress: string; toAddress: string };
type Transport = { sendMail(message: Record<string, unknown>): Promise<{ accepted?: Array<string | { address?: string }> }> };
type TransportFactory = (options: Record<string, unknown>) => Transport;
type DiagnosticLogger = (event: string, details: Record<string, string | number | boolean>) => void;

const emailPattern = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const oneLine = (value: string | undefined) => (value ?? "").trim().replace(/[\r\n\x00-\x1f\x7f]/g, "");
const hasControls = (value: string | undefined) => value !== undefined && /[\x00-\x1f\x7f]/.test(value);

function logEnquiryEmailDiagnostic(event: string, details: Record<string, string | number | boolean> = {}): void {
  // Intentionally log only fixed event names and non-sensitive transport metadata.
  console.info("[hgr-enquiry-email]", JSON.stringify({ event, ...details }));
}

function getConfigurationFailure(env: NodeJS.ProcessEnv): string | null {
  if (env.ENQUIRY_EMAIL_ENABLED?.trim() !== "true") return "disabled";
  const configured = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM_NAME", "MAIL_FROM_ADDRESS", "ENQUIRY_TO_EMAIL"] as const;
  const missing = configured.find((key) => env[key] === undefined || env[key] === "");
  if (missing) return `missing_${missing.toLowerCase()}`;
  if (configured.some((key) => hasControls(env[key]))) return "invalid_control_character";
  const host = oneLine(env.SMTP_HOST);
  const portText = oneLine(env.SMTP_PORT);
  const fromAddress = oneLine(env.MAIL_FROM_ADDRESS);
  const toAddress = oneLine(env.ENQUIRY_TO_EMAIL);
  if (!host || /[\s/@]/.test(host) || (portText !== "465" && portText !== "587")) return "invalid_host_or_port";
  if (!oneLine(env.SMTP_USER) || !env.SMTP_PASSWORD || !oneLine(env.MAIL_FROM_NAME)) return "missing_required_value";
  if (!emailPattern.test(fromAddress) || !emailPattern.test(toAddress)) return "invalid_email_address";
  return null;
}

export function readEnquiryEmailConfig(env: NodeJS.ProcessEnv = process.env): Config | null {
  // Railway values can be copied with surrounding whitespace. Keep delivery
  // opt-in and case-sensitive, but ignore that harmless formatting whitespace.
  if (env.ENQUIRY_EMAIL_ENABLED?.trim() !== "true") return null;
  if ([env.SMTP_HOST, env.SMTP_PORT, env.SMTP_USER, env.SMTP_PASSWORD, env.MAIL_FROM_NAME, env.MAIL_FROM_ADDRESS, env.ENQUIRY_TO_EMAIL].some(hasControls)) return null;
  const host = oneLine(env.SMTP_HOST);
  const portText = oneLine(env.SMTP_PORT);
  const port = portText === "465" ? 465 : portText === "587" ? 587 : null;
  const user = oneLine(env.SMTP_USER);
  const password = env.SMTP_PASSWORD ?? "";
  const fromName = oneLine(env.MAIL_FROM_NAME);
  const fromAddress = oneLine(env.MAIL_FROM_ADDRESS);
  const toAddress = oneLine(env.ENQUIRY_TO_EMAIL);
  if (!host || /[\s/@]/.test(host) || !port || !user || !password || !fromName || !fromAddress || !toAddress) return null;
  if (!emailPattern.test(fromAddress) || !emailPattern.test(toAddress)) return null;
  return { enabled: true, host, port, user, password, fromName, fromAddress, toAddress };
}

function readEnquiryEmailConfigWithStatus(env: NodeJS.ProcessEnv): { config: Config | null; reason: string | null } {
  const config = readEnquiryEmailConfig(env);
  return { config, reason: config ? null : getConfigurationFailure(env) ?? "configuration_invalid" };
}

export function createSmtpEnquiryAdapter(
  getConfig?: () => Config | null,
  createTransport: TransportFactory = (options) => nodemailer.createTransport(options as never) as unknown as Transport,
  logger: DiagnosticLogger = logEnquiryEmailDiagnostic,
  getFailureReason?: () => string,
): MailAdapter {
  const configProvider = getConfig ?? (() => readEnquiryEmailConfig());
  const failureReasonProvider = getFailureReason ?? (() => readEnquiryEmailConfigWithStatus(process.env).reason ?? "configuration_provider_returned_empty");
  return async ({ fields, context }) => {
    const config = configProvider();
    if (!config) {
      logger("configuration_unavailable", { reason: failureReasonProvider() });
      return { accepted: false };
    }
    const recipient = config.toAddress.toLowerCase();
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
      const transport = createTransport({
        host: config.host, port: config.port, secure: config.port === 465,
        requireTLS: config.port === 587, auth: { user: config.user, pass: config.password },
        tls: { rejectUnauthorized: true }, logger: false, debug: false,
        connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 10_000,
        disableFileAccess: true, disableUrlAccess: true,
      });
      const result = await transport.sendMail({
        from: { name: config.fromName, address: config.fromAddress }, to: config.toAddress,
        replyTo, subject: `Website ${fields.kind} enquiry`, text: lines.join("\n"),
        envelope: { from: config.fromAddress, to: [config.toAddress] },
      });
      const accepted = (result.accepted ?? []).some((address) => (typeof address === "string" ? address : address.address ?? "").toLowerCase() === recipient);
      if (!accepted) logger("provider_rejected", { acceptedCount: result.accepted?.length ?? 0, rejectedCount: (result as { rejected?: unknown[] }).rejected?.length ?? 0, port: config.port });
      else logger("provider_accepted", { port: config.port });
      return { accepted };
    } catch (error) {
      const smtpError = error as { code?: unknown; command?: unknown; responseCode?: unknown };
      const code = typeof smtpError.code === "string" && /^[A-Z0-9_]{1,40}$/.test(smtpError.code) ? smtpError.code : "UNKNOWN";
      const command = typeof smtpError.command === "string" && /^[A-Z0-9]{1,20}$/.test(smtpError.command) ? smtpError.command : "UNKNOWN";
      const responseCode = typeof smtpError.responseCode === "number" && Number.isInteger(smtpError.responseCode) ? smtpError.responseCode : 0;
      const category = responseCode === 535 || responseCode === 534 || code === "EAUTH" ? "authentication_failure" : "connection_or_smtp_failure";
      logger(category, { code, command, responseCode, port: config.port });
      return { accepted: false };
    }
  };
}

export const smtpEnquiryAdapter = createSmtpEnquiryAdapter();
