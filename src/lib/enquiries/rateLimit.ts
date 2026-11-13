type WindowEntry = { count: number; resetAt: number };
export type EnquiryRateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

const entries = new Map<string, WindowEntry>();
const windowMs = 15 * 60 * 1000;
const perClientLimit = 8;
const unknownClientLimit = 24;
const perProcessLimit = 120;
const maxEntries = 10_000;

/** Process-local fallback protection. Put a shared edge rate limit in front of multi-instance deployments. */
export function checkEnquiryRateLimit(
  clientKey: string,
  now = Date.now(),
): EnquiryRateLimitResult {
  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(key);
  }
  const global = entries.get("__process-global__");
  if (global && global.resetAt > now && global.count >= perProcessLimit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((global.resetAt - now) / 1000)) };
  }
  if (entries.size >= maxEntries && !entries.has(clientKey)) {
    return { allowed: false, retryAfterSeconds: 60 };
  }
  if (!global || global.resetAt <= now) entries.set("__process-global__", { count: 1, resetAt: now + windowMs });
  else global.count += 1;
  const entry = entries.get(clientKey);
  if (!entry || entry.resetAt <= now) {
    entries.set(clientKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  const limit = clientKey === "unknown-client" ? unknownClientLimit : perClientLimit;
  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count += 1;
  return { allowed: true };
}

export function enquiryClientKey(headers: Headers): string {
  // Only trust Cloudflare's canonical client IP header. Railway's forwarded
  // headers are not assumed trustworthy unless an operator verifies the edge.
  const candidate = headers.get("cf-connecting-ip");
  const value = candidate?.trim();
  if (!value || value.length > 64 || /[,\s]/.test(value)) return "unknown-client";
  const isIPv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split(".").every((part) => Number(part) <= 255);
  const isIPv6 = /^[0-9a-f:]+$/i.test(value) && value.includes(":");
  return isIPv4 || isIPv6 ? `ip:${value.toLowerCase()}` : "unknown-client";
}

export function resetEnquiryRateLimitsForTests(): void {
  entries.clear();
}
