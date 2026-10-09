import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LocaleProvider } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { isFrPath } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

function NotFoundComponent() {
  const fr = useRouterState({ select: st => isFrPath(st.location.publicHref ?? st.location.href) });
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="topic">404</p>
        <h1 className="hl text-5xl mt-2">{fr ? "Cette page n'est pas dans l'édition du jour" : "This page isn't in today's paper"}</h1>
        <p className="dek mt-4">{fr ? "Elle a peut-être été déplacée. Les dernières nouvelles en IA sont à la une." : "It may have moved. The latest AI news is on the front page."}</p>
        <Link to="/" className="inline-flex mt-6 bg-ink text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-lake">
          {fr ? "Aller à la une" : "Go to the front page"}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="hl text-3xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-ink">{error instanceof Error ? error.message : String(error)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold">Try again</button>
          <a href="/" className="border border-ink px-4 py-2 rounded-[5px] font-semibold">Go home</a>
        </div>
      </div>
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
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/logo-512.png" },
      { rel: "alternate", type: "application/rss+xml", title: `${SITE.name} (English)`, href: "/rss.xml" },
      { rel: "alternate", type: "application/rss+xml", title: `${SITE.name} (français)`, href: "/fr/rss.xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..700&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap",
      },
    ],
    scripts: [
      ...(ADSENSE_CLIENT
        ? [{ src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, async: true, crossOrigin: "anonymous" as const }]
        : []),
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
  const fr = useRouterState({ select: st => isFrPath(st.location.publicHref ?? st.location.href) });
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
      </LocaleProvider>
    </QueryClientProvider>
  );
}
