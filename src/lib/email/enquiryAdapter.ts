import nodemailer from "nodemailer";
import type { MailAdapter } from "../enquiries/submit.ts";

type Config = { enabled: boolean; host: string; port: 465 | 587; user: string; password: string; fromName: string; fromAddress: string; toAddress: string };
type Transport = { sendMail(message: Record<string, unknown>): Promise<{ accepted?: Array<string | { address?: string }> }> };
type TransportFactory = (options: Record<string, unknown>) => Transport;

const emailPattern = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const oneLine = (value: string | undefined) => (value ?? "").trim().replace(/[\r\n\x00-\x1f\x7f]/g, "");
const hasControls = (value: string | undefined) => value !== undefined && /[\x00-\x1f\x7f]/.test(value);

export function readEnquiryEmailConfig(env: NodeJS.ProcessEnv = process.env): Config | null {
  if (env.ENQUIRY_EMAIL_ENABLED !== "true") return null;
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

export function createSmtpEnquiryAdapter(
  getConfig: () => Config | null = () => readEnquiryEmailConfig(),
  createTransport: TransportFactory = (options) => nodemailer.createTransport(options as never) as unknown as Transport,
): MailAdapter {
  return async ({ fields, context }) => {
    const config = getConfig();
    if (!config) return { accepted: false };
    const recipient = config.toAddress.toLowerCase();
    const replyTo = fields.email && emailPattern.test(fields.email) ? fields.email : undefined;
    const lines = [
      `Enquiry type: ${fields.kind}`, `Name: ${fields.name ?? ""}`, `Company: ${fields.company ?? ""}`,
      `Phone: ${fields.phone ?? ""}`, `Email: ${fields.email ?? ""}`,
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
      return { accepted: (result.accepted ?? []).some((address) => (typeof address === "string" ? address : address.address ?? "").toLowerCase() === recipient) };
    } catch {
      return { accepted: false };
    }
  };
}

export const smtpEnquiryAdapter = createSmtpEnquiryAdapter();
