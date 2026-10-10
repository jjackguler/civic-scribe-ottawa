import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";

import appCss from "../styles.css?url";
// Self-hosted variable fonts (SIL OFL): the two Latin files every page needs are preloaded.
import grotesk from "../fonts/schibsted-grotesk-latin-wght-normal.woff2?url";
import newsreader from "../fonts/newsreader-latin-opsz-normal.woff2?url";
import { LocaleProvider } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { isFrPath } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

// The consent bar only exists once an ad network is configured; until then it costs nothing.
const ConsentBanner = ADSENSE_CLIENT ? lazy(() => import("@/components/ConsentBanner")) : null;

const useFr = () => useRouterState({ select: st => isFrPath(st.location.publicHref ?? st.location.href) });

/** Answers with HTTP 404 (TanStack Start sets the status for unmatched routes and thrown notFound()). No ads here. */
function NotFoundComponent() {
  const fr = useFr();
  const href = (p: string) => (fr ? (p === "/" ? "/fr" : `/fr${p}`) : p);
  const links: [string, string, string][] = [
    ["/news", "Latest AI news", "Dernières nouvelles en IA"],
    ["/glossary", "AI glossary", "Glossaire de l'IA"],
    ["/guides", "Guides", "Guides"],
    ["/labs", "Learn AI (Labs)", "Apprendre l'IA (Labs)"],
    ["/search", "Search", "Rechercher"],
  ];
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <main className="max-w-lg text-center">
        <p className="topic">404</p>
        <h1 className="hl text-5xl mt-2">{fr ? "Cette page n'est pas dans l'édition du jour" : "This page isn't in today's paper"}</h1>
        <p className="dek mt-4">{fr ? "Elle a peut-être été déplacée, ou l'adresse contient une faute. Voici où aller ensuite." : "It may have moved, or the address has a typo. Here's where to go next."}</p>
        <a href={href("/")} className="inline-flex mt-6 bg-ink text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-lake">
          {fr ? "Aller à la une" : "Go to the front page"}
        </a>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.98rem]">
          {links.map(([p, en, frl]) => (
            <li key={p}><a href={href(p)} className="text-lake font-semibold hover:underline">{fr ? frl : en}</a></li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const fr = useFr();
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <main className="max-w-md text-center">
        <h1 className="hl text-3xl">{fr ? "Cette page ne s'est pas chargée" : "This page didn't load"}</h1>
        <p className="mt-2 text-sm text-muted-ink">{error instanceof Error ? error.message : String(error)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold">{fr ? "Réessayer" : "Try again"}</button>
          <a href={fr ? "/fr" : "/"} className="border border-ink px-4 py-2 rounded-[5px] font-semibold">{fr ? "Accueil" : "Go home"}</a>
        </div>
      </main>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // The language comes from the URL: /fr/... is French, everything else English.
  beforeLoad: ({ location }) => ({ locale: (isFrPath(location.publicHref ?? location.href) ? "fr" : "en") as Locale }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Fallbacks; every page sets its own through seoHead().
      { title: `${SITE.name} — ${SITE.tagline.en}` },
      { name: "description", content: SITE.description.en },
      { name: "theme-color", content: "#0B2A2F" },
      { property: "og:site_name", content: SITE.name },
      ...(SITE.social.x ? [{ name: "twitter:site", content: `@${String(SITE.social.x).replace(/\/+$/, "").split("/").pop()}` }] : []),
      // AdSense site verification without loading any ad code in <head>.
      ...(ADSENSE_CLIENT ? [{ name: "google-adsense-account", content: ADSENSE_CLIENT }] : []),
    ],
    links: [
      { rel: "preload", href: grotesk, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: newsreader, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon-96.png?v=news-spark", type: "image/png", sizes: "96x96" },
      { rel: "icon", href: "/favicon.svg?v=news-spark", type: "image/svg+xml", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=news-spark", sizes: "180x180" },
      { rel: "alternate", type: "application/rss+xml", title: `${SITE.name} (English)`, href: "/rss.xml" },
      { rel: "alternate", type: "application/rss+xml", title: `${SITE.name} (français)`, href: "/fr/rss.xml" },
    ],
    scripts: [
      // Cloudflare Web Analytics: cookieless, no personal data. Off until a token is set.
      ...(SITE.cloudflareAnalyticsToken
        ? [{ src: "https://static.cloudflareinsights.com/beacon.min.js", defer: true, "data-cf-beacon": JSON.stringify({ token: SITE.cloudflareAnalyticsToken }) }]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const fr = useFr();
  return (
    <html lang={fr ? "fr-CA" : "en-CA"}>
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <Outlet />
        {ConsentBanner && <Suspense fallback={null}><ConsentBanner /></Suspense>}
      </LocaleProvider>
    </QueryClientProvider>
  );
}
