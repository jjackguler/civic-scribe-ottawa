/**
 * A small cache shared by every Cloudflare isolate in a data centre, built on
 * the Workers Cache API (`caches.default`). No bindings or setup needed.
 *
 * Each isolate keeps its own memory, so without this a fresh isolate starts
 * with an empty news desk. With it, a fresh isolate starts from the last desk
 * any isolate built. Everything here fails soft: where the Cache API doesn't
 * exist (local dev, tests) reads return null and writes do nothing.
 */

type CfCache = { match(req: string): Promise<Response | undefined>; put(req: string, res: Response): Promise<void> };
type CfCtx = { waitUntil(p: Promise<unknown>): void };

const g = globalThis as unknown as { caches?: { default?: CfCache }; __cfCtx?: CfCtx; __sharedHost?: string };

/** Called from src/server.ts on every request: remembers the host and the Worker's execution context. */
export function bindRequest(request: Request, ctx: unknown) {
  try { g.__sharedHost = new URL(request.url).host; } catch { /* keep previous */ }
  if (ctx && typeof (ctx as CfCtx).waitUntil === "function") g.__cfCtx = ctx as CfCtx;
}

const store = (): CfCache | undefined => g.caches?.default;

export const sharedCacheAvailable = () => !!store();

const keyUrl = (key: string) => `https://${g.__sharedHost ?? "aibroadsheet.com"}/__shared-cache/${encodeURIComponent(key)}`;

/** Keep work running after the response is sent (Workers would otherwise cancel it). */
export function keepAlive(p: Promise<unknown>) {
  try { g.__cfCtx?.waitUntil(p.catch(() => {})); } catch { /* not on Workers */ }
}

export async function sharedRead<T>(key: string, ms = 1500): Promise<T | null> {
  const c = store();
  if (!c) return null;
  try {
    const res = await Promise.race([c.match(keyUrl(key)), new Promise<undefined>(r => setTimeout(() => r(undefined), ms))]);
    if (!res) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function sharedWrite(key: string, value: unknown, maxAgeSec: number) {
  const c = store();
  if (!c) return;
  try {
    const body = JSON.stringify(value);
    const p = c.put(keyUrl(key), new Response(body, {
      headers: { "content-type": "application/json", "cache-control": `public, max-age=${maxAgeSec}` },
    }));
    keepAlive(p);
  } catch { /* ignore */ }
}
