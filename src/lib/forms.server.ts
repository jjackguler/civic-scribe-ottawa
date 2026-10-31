/**
 * Server side of the reader forms. Forwards a validated payload to the owner's
 * webhook and keeps nothing: no database, no log line with the address or the
 * message. Errors are logged as a status code only.
 */

const g = globalThis as unknown as { __formHits?: Map<string, number[]> };

/** Per-isolate rate limit by client address (the address itself is never stored beyond the window). */
export function allow(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const hits = (g.__formHits ??= new Map<string, number[]>());
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** A coarse key for rate limiting: a hash of the client address, never the address itself. */
export async function clientKey(request: Request, scope: string): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const data = new TextEncoder().encode(`${scope}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest).slice(0, 8)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ForwardResult = "ok" | "unconfigured" | "failed";

/**
 * POST the payload as JSON to the webhook in `envName`. When `${envName}_SECRET`
 * (e.g. SUBSCRIBE_WEBHOOK_SECRET) is set it is sent as a bearer token so the
 * receiver can reject anything that did not come from the site.
 */
export async function forward(
  envName: "SUBSCRIBE_WEBHOOK_URL" | "TIP_WEBHOOK_URL",
  payload: unknown,
): Promise<ForwardResult> {
  const url = process.env[envName];
  if (!url || !/^https:\/\//i.test(url)) return "unconfigured";
  const secret = process.env[envName.replace(/_URL$/, "_SECRET")];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[forms] ${envName} answered HTTP ${res.status}`);
      return "failed";
    }
    return "ok";
  } catch {
    console.warn(`[forms] ${envName} unreachable`);
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
