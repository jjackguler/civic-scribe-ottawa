/**
 * Pages we removed on purpose answer "410 Gone", so search engines drop them
 * faster than a 404 and readers get a clear message instead of a dead end.
 *
 * Add a path (English form, without /fr; the French twin is handled) or a
 * prefix ending in "/*" when you delete a page or a whole section for good.
 * Moved pages should get a redirect instead, not a 410.
 *
 * Checked in src/server.ts before the app renders.
 */
import { isFrPath, stripFr } from "./seo";
import { SITE } from "./site";

export const GONE: string[] = [
  // "/old-section/*",
  // "/learn/retired-guide",
];

/** True when this public pathname has been retired. */
export function isGone(pathname: string, list: string[] = GONE): boolean {
  const p = (stripFr(pathname).replace(/\/+$/, "") || "/").toLowerCase();
  return list.some(g => (g.endsWith("/*") ? p === g.slice(0, -2) || p.startsWith(g.slice(0, -1)) : p === g.toLowerCase()));
}

const page = (fr: boolean) => `<!doctype html>
<html lang="${fr ? "fr-CA" : "en-CA"}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>${fr ? "Page retirée" : "Page removed"} — ${SITE.name}</title>
<style>body{font:17px/1.55 system-ui,-apple-system,sans-serif;background:#f4f5f2;color:#10191b;display:grid;place-items:center;min-height:100vh;margin:0;padding:1.5rem}main{max-width:32rem;text-align:center}h1{font:600 2rem/1.15 Georgia,serif;margin:.4rem 0 .8rem}p{color:#56635f}a{display:inline-block;margin:.3rem;padding:.6rem 1.1rem;border-radius:5px;background:#10191b;color:#fff;text-decoration:none;font-weight:600}a.alt{background:#fff;color:#10191b;border:1px solid #d6ddda}</style>
</head>
<body><main>
<p>410</p>
<h1>${fr ? "Cette page a été retirée" : "This page has been removed"}</h1>
<p>${fr ? "Nous l'avons retirée volontairement et elle ne reviendra pas. Les dernières nouvelles en IA sont à la une." : "We took it down on purpose and it won't be coming back. The latest AI news is on the front page."}</p>
<a href="${fr ? "/fr" : "/"}">${fr ? "Aller à la une" : "Go to the front page"}</a><a class="alt" href="${fr ? "/fr/glossary" : "/glossary"}">${fr ? "Glossaire de l'IA" : "AI glossary"}</a>
</main></body></html>`;

/** The branded 410 response for a retired path. */
export function goneResponse(pathname: string): Response {
  return new Response(page(isFrPath(pathname)), {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "public, max-age=3600" },
  });
}
