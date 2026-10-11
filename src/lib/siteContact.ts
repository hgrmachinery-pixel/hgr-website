export type WeeklyBusinessHours = { day: string; opens: string; closes: string };

export type PublicContact = {
  companyName?: string;
  registrationNumber?: string;
  phone?: string;
  whatsApp?: string;
  email?: string;
  salesEmail?: string;
  supportEmail?: string;
  officeAddress?: string;
  yardAddress?: string;
  yardLocation?: string;
  googleMapsURL?: string;
  googleMapsEmbedURL?: string;
  weeklyHours: WeeklyBusinessHours[];
  appointmentOnly: boolean;
  socials: { label: string; url: string }[];
  directionsURL?: string;
};

const socialHosts = {
  facebook: ["facebook.com"],
  instagram: ["instagram.com"],
  linkedin: ["linkedin.com"],
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
} as const;

export function safeHttpsURL(value: unknown, hosts?: readonly string[]): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    if (hosts && !hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function safeGoogleMapsURL(value: unknown): string | undefined {
  const safe = safeHttpsURL(value, ["google.com", "maps.app.goo.gl"]);
  if (!safe) return undefined;
  const url = new URL(safe);
  return url.hostname === "maps.app.goo.gl" || /^\/maps(?:\/|$)/.test(url.pathname) ? safe : undefined;
}

function cleanText(value: unknown, maxLength = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim().slice(0, maxLength);
  return text || undefined;
}

function safeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim();
  return email.length <= 254 && /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) ? email : undefined;
}

function readHours(value: unknown): WeeklyBusinessHours[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: WeeklyBusinessHours[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.day !== "string" || !["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(row.day)) continue;
    if (seen.has(row.day) || typeof row.opens !== "string" || typeof row.closes !== "string") continue;
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.opens) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.closes)) continue;
    seen.add(row.day);
    result.push({ day: row.day, opens: row.opens, closes: row.closes });
  }
  return result;
}

export function projectPublicContact(raw: Record<string, unknown>): PublicContact {
  const phone = cleanText(raw.phone, 40);
  const whatsApp = cleanText(raw.whatsApp, 40);
  const salesEmail = safeEmail(raw.email);
  const yardAddress = cleanText(raw.yardLocation);
  const googleMapsURL = safeGoogleMapsURL(raw.googleMapsURL);
  const addressDestination = yardAddress ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(yardAddress)}` : undefined;
  const hours = readHours(raw.weeklyHours);
  return {
    companyName: cleanText(raw.companyName, 160),
    registrationNumber: cleanText(raw.registrationNumber, 80),
    phone: phone && /^\+?[0-9][0-9(). -]{3,38}$/.test(phone) ? phone : undefined,
    whatsApp: whatsApp && /^\d{8,15}$/.test(whatsApp.replace(/[+\s().-]/g, "")) ? whatsApp.replace(/[+\s().-]/g, "") : undefined,
    email: salesEmail,
    salesEmail,
    supportEmail: safeEmail(raw.supportEmail),
    officeAddress: cleanText(raw.officeAddress),
    yardAddress,
    yardLocation: yardAddress,
    googleMapsURL,
    googleMapsEmbedURL: safeHttpsURL(raw.googleMapsEmbedURL, ["www.google.com"]),
    weeklyHours: hours,
    appointmentOnly: raw.appointmentOnly === true,
    socials: (Object.entries(socialHosts) as [keyof typeof socialHosts, readonly string[]][]).flatMap(([name, hosts]) => {
      const url = safeHttpsURL(raw[name], hosts);
      return url ? [{ label: name[0].toUpperCase() + name.slice(1), url }] : [];
    }),
    directionsURL: googleMapsURL ?? addressDestination,
  };
}

export function isGoogleMapsEmbedURL(value: unknown): boolean {
  const safe = safeHttpsURL(value, ["www.google.com"]);
  if (!safe) return false;
  const url = new URL(safe);
  return url.hostname === "www.google.com" && /^\/maps\/embed(?:\/|$)/.test(url.pathname);
}

export function safeGoogleMapsEmbedURL(value: unknown): string | undefined {
  return isGoogleMapsEmbedURL(value) ? safeHttpsURL(value, ["www.google.com"]) : undefined;
}
