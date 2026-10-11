export const publicPageSlugs = ["rental", "repair-services", "machinery-services", "spare-parts", "lubricants", "about", "contact", "privacy-policy", "website-terms"] as const;
export type PublicPageSlug = (typeof publicPageSlugs)[number];

export function isPublicPageSlug(slug: string): slug is PublicPageSlug {
  return (publicPageSlugs as readonly string[]).includes(slug);
}

export async function getPublishedPage(slug: string) {
  if (!isPublicPageSlug(slug)) return null;
  if (process.env.HGR_LOCAL_UI_REVIEW === "true" && process.env.NODE_ENV !== "production") return null;
  try {
    const [{ default: config }, { getPayload }] = await Promise.all([import("@payload-config"), import("payload")]);
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages", where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      limit: 1, depth: 0, overrideAccess: false,
    });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPublicContact(): Promise<import("./siteContact").PublicContact> {
  const { projectPublicContact } = await import("./siteContact");
  if (process.env.HGR_LOCAL_UI_REVIEW === "true" && process.env.NODE_ENV !== "production") {
    return projectPublicContact({ phone: "+60 00-000 0000", whatsApp: "60000000000", email: "review@example.invalid", yardLocation: "Fictional local-review location — not a real HGR contact" });
  }
  try {
    const [{ default: config }, { getPayload }] = await Promise.all([import("@payload-config"), import("payload")]);
    const payload = await getPayload({ config });
    const contact = await payload.findGlobal({ slug: "site-contact", depth: 0, overrideAccess: false }) as unknown as Record<string, unknown>;
    return projectPublicContact(contact);
  } catch {
    return projectPublicContact({});
  }
}

export function safePhone(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && /^\+?[0-9][0-9(). -]{3,38}$/.test(normalized) ? normalized : undefined;
}

export function safeWhatsApp(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/[+\s().-]/g, "");
  return /^\d{8,15}$/.test(normalized) ? normalized : undefined;
}

export function lexicalPlainText(value: unknown): string[] {
  const lines: string[] = [];
  function visit(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const record = node as { text?: unknown; children?: unknown[]; type?: unknown };
    if (typeof record.text === "string") return record.text;
    if (!Array.isArray(record.children)) return "";
    const text = record.children.map(visit).filter(Boolean).join("");
    if (text && (record.type === "paragraph" || record.type === "heading" || record.type === "quote" || record.type === "listitem")) lines.push(text);
    return text;
  }
  visit(value && typeof value === "object" && "root" in value ? (value as { root: unknown }).root : value);
  return lines;
}
