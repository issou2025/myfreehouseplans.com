const DANGEROUS_PROTOCOLS = ["javascript:", "data:text/html"];
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const HTML_TAGS = /<[^>]*>/g;

export function cleanText(value: unknown, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(HTML_TAGS, "").trim().slice(0, maxLength);
}

export function cleanMultilineText(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(HTML_TAGS, "").trim().slice(0, maxLength);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isSafeRelativeOrHttpUrl(value: string) {
  if (!value) return true;
  const trimmed = value.trim().toLowerCase();
  if (DANGEROUS_PROTOCOLS.some((protocol) => trimmed.startsWith(protocol))) return false;
  if (trimmed.startsWith("#")) return !trimmed.includes("\\");
  if (trimmed.startsWith("/")) return !trimmed.includes("..") && !trimmed.includes("\\");
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
