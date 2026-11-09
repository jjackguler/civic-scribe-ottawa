/**
 * Give a server-rendered page the right HTTP status.
 *
 * Search engines read the status code, not the words on the page. A "withdrawn"
 * or "not available right now" page answered with 200 is reported by Google as
 * a soft 404, so those pages answer 410 (gone for good) or 503 (try again later).
 * In the browser (client navigation) this does nothing.
 */
import { createIsomorphicFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

/**
 * Private header that carries the status to src/server.ts: the router picks the
 * status of an SSR render itself (200 unless notFound/redirect), so the Worker
 * entry applies this one afterwards and removes the header.
 */
export const PAGE_STATUS_HEADER = "x-aib-page-status";

export const setPageStatus = createIsomorphicFn()
  .server((code: number, retryAfterSeconds?: number) => {
    try {
      setResponseHeader(PAGE_STATUS_HEADER, String(code));
      if (retryAfterSeconds) setResponseHeader("retry-after", String(retryAfterSeconds));
    } catch {
      /* outside a request (prerender): nothing to set */
    }
  })
  .client(() => {});
