import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isFrPath, stripFr } from "./lib/seo";

export const getRouter = () => {
  const queryClient = new QueryClient();
  // French pages live under /fr. The router sees the path without the prefix,
  // and puts it back on every link it builds while the reader is in French.
  // One router per request on the server, one per tab in the browser.
  let french = false;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => {
        french = isFrPath(url.pathname);
        if (!french) return undefined;
        url.pathname = stripFr(url.pathname);
        return url;
      },
      output: ({ url }) => {
        if (!french || isFrPath(url.pathname)) return undefined;
        url.pathname = url.pathname === "/" ? "/fr" : `/fr${url.pathname}`;
        return url;
      },
    },
  });

  return router;
};
