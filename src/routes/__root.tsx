import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LocaleProvider } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { ADSENSE_CLIENT } from "@/lib/ads";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="topic">404</p>
        <h1 className="hl text-5xl mt-2">This page isn't in today's paper</h1>
        <p className="dek mt-4">It may have moved. The latest AI news is on the front page.</p>
        <Link to="/" className="inline-flex mt-6 bg-ink text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-lake">
          Go to the front page
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="hl text-3xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-ink">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold">Try again</button>
          <a href="/" className="border border-ink px-4 py-2 rounded-[5px] font-semibold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} — ${SITE.tagline.en}` },
      { name: "description", content: SITE.description.en },
      { name: "theme-color", content: "#0B2A2F" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline.en}` },
      { property: "og:description", content: SITE.description.en },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "fr_CA" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..700&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          name: SITE.name,
          url: `https://${SITE.domain}`,
          logo: `https://${SITE.domain}/favicon.svg`,
          description: SITE.description.en,
          inLanguage: ["en", "fr"],
          publishingPrinciples: `https://${SITE.domain}/standards`,
          correctionsPolicy: `https://${SITE.domain}/standards`,
          email: SITE.email.editor,
        }),
      },
      ...(ADSENSE_CLIENT
        ? [{ src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, async: true, crossOrigin: "anonymous" as const }]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
