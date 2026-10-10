/**
 * The /og/* image routes. Server only, imported lazily by the route files so
 * the renderer and its outlines load only when a crawler asks for a card.
 *
 * Caching: a URL whose `v` matches the current content version is immutable
 * (one year, CDN and browsers); anything else gets an hour at the edge. Each
 * PNG is also kept in the Workers cache, so a card is drawn once per data
 * centre, not once per crawler.
 */
import { dayLabel, quizDay } from "../youth-core";
import { keepAlive } from "../shared-cache";
import { OG_REV, ogVersion } from "./url";
import type { OgSpec } from "./render";

type CfCache = { match(req: string): Promise<Response | undefined>; put(req: string, res: Response): Promise<void> };
const g = globalThis as unknown as { caches?: { default?: CfCache } };

const YEAR = 31536000;

const headers = (immutable: boolean, etag: string) => ({
  "content-type": "image/png",
  "cache-control": immutable ? `public, max-age=${YEAR}, immutable` : "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
  etag: `"${etag}"`,
  "access-control-allow-origin": "*",
  "x-content-type-options": "nosniff",
});

/** The house card for anything we can't draw (unknown id, renderer error). */
const fallback = (request: Request) =>
  new Response(null, { status: 302, headers: { location: new URL("/og-default.png", request.url).toString(), "cache-control": "public, max-age=300" } });

async function serve(request: Request, spec: OgSpec, etag: string, immutable: boolean): Promise<Response> {
  const url = new URL(request.url);
  if (request.headers.get("if-none-match") === `"${etag}"`) return new Response(null, { status: 304, headers: headers(immutable, etag) });
  const cacheKey = `https://${url.host}/__og/${encodeURIComponent(etag)}.png`;
  const cache = g.caches?.default;
  const hit = await cache?.match(cacheKey).catch(() => undefined);
  if (hit) return new Response(request.method === "HEAD" ? null : hit.body, { headers: headers(immutable, etag) });
  try {
    const { renderOg } = await import("./render");
    const png = await renderOg(spec);
    if (cache) keepAlive(cache.put(cacheKey, new Response(png.slice(), { headers: headers(true, etag) })));
    return new Response(request.method === "HEAD" ? null : png, { headers: { ...headers(immutable, etag), "content-length": String(png.length) } });
  } catch (e) {
    console.warn("[og]", (e as Error).message);
    return fallback(request);
  }
}

const langOf = (url: URL): "en" | "fr" => (url.searchParams.get("lang") === "fr" ? "fr" : "en");
const stripPng = (s: string) => decodeURIComponent(s).replace(/\.png$/i, "");

export async function ogArticle(request: Request, rawId: string): Promise<Response> {
  const url = new URL(request.url);
  const id = stripPng(rawId);
  const locale = langOf(url);
  if (!/^[\w-]{1,120}$/.test(id)) return fallback(request);
  let d: import("../dispatch-types").Dispatch | null = null;
  if (import.meta.env.DEV && url.searchParams.get("fixture") === "1") {
    const { FIXTURES } = await import("../dispatch-fixture");
    d = FIXTURES.find(x => x.id === id) ?? FIXTURES[0];
  } else {
    const { getDispatchById } = await import("../dispatch.server");
    d = await getDispatchById(id).catch(() => null);
  }
  if (!d) {
    // Our newsroom's own articles share the article card.
    const { articleById } = await import("../newsroom.server");
    const a = await articleById(id).catch(() => null);
    if (!a) return fallback(request);
    const v = ogVersion(a.updatedAt);
    return serve(request, {
      kind: "article", locale, id: a.id,
      kicker: locale === "fr" ? "AI Broadsheet" : "AI Broadsheet",
      headline: a[locale].headline,
      outlets: [...new Set(a.sources.map(s => s.outlet))],
    }, `n-${a.id}-${locale}-${v}`, url.searchParams.get("v") === v);
  }
  const version = ogVersion(d.createdAt);
  const c = d[locale];
  const outlets = [...new Set(d.sources.map(s => s.outlet))];
  return serve(request, {
    kind: "article",
    locale,
    id: d.id,
    kicker: locale === "fr" ? "Dépêche" : "Dispatch",
    headline: c.headline,
    outlets,
  }, `a-${d.id}-${locale}-${version}`, url.searchParams.get("v") === version);
}

export async function ogQuiz(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const locale = langOf(url);
  const asked = url.searchParams.get("d");
  const day = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) && !Number.isNaN(Date.parse(`${asked}T12:00:00Z`)) ? asked : quizDay();
  // A dated URL never changes; the undated one follows the day.
  const immutable = !!asked && day === asked && url.searchParams.get("v") === OG_REV;
  return serve(request, { kind: "quiz", locale, dayLabel: capitalise(dayLabel(day, locale), locale) }, `q-${day}-${locale}-${OG_REV}`, immutable);
}

export async function ogSection(request: Request, rawName: string): Promise<Response> {
  const url = new URL(request.url);
  const locale = langOf(url);
  const name = stripPng(rawName).toLowerCase();
  const { OG_SECTIONS } = await import("./sections");
  const s = OG_SECTIONS[name];
  if (!s) return new Response("Not found", { status: 404, headers: { "cache-control": "public, max-age=300" } });
  return serve(request, { kind: "section", locale, name, label: s.label[locale], dek: s.dek[locale] }, `s-${name}-${locale}-${OG_REV}`, url.searchParams.get("v") === OG_REV);
}

/** "vendredi 9 octobre" stays lower case in French; English already starts with a capital. */
const capitalise = (s: string, locale: "en" | "fr") => (locale === "fr" ? s : s.charAt(0).toUpperCase() + s.slice(1));
