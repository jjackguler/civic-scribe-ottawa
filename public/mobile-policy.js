/* Shared by the worker and Node tests. Public navigation gets an offline fallback;
   dynamic HTML, API responses, authentication and private data are NEVER stored. */
(function(root) {
  const pages = /^\/(?:news|saved|more|cover|search|dispatch(?:\/[\w%-]+)?|story\/[\w%.-]+|article\/[\w%.-]+|originals(?:\/[\w%-]+)?|labs(?:\/[\w%-]+)*|glossary(?:\/[\w%-]+)?|quiz|watch|listen|standards|privacy|about|values|tools|learn(?:\/[\w%-]+)?|showcase|interviews|ministry|government|funding|newsletter|advertise|corrections|terms)?\/?$/;
  function classify(req, origin) {
    if (!req || req.method !== 'GET') return null;
    let u; try { u = new URL(req.url); } catch { return null; }
    if (u.origin !== origin || u.username || u.password) return null;
    const h = req.headers;
    if (h?.get?.('authorization') || h?.get?.('x-tsr-serverfn') || h?.get?.('range')) return null;
    for (const key of u.searchParams.keys()) if (!['section', 'q', 'source'].includes(key)) return null;
    const path = u.pathname.replace(/^\/fr(?=\/|$)/, '') || '/';
    if (/^\/(api|_serverFn|_server|editor|auth|admin|login|dev|cdn-cgi)(\/|$)/i.test(path)) return null;
    if (/^\/assets\/[\w./-]+\.(?:js|css|woff2?|png|svg|webp|jpe?g|ico)$/i.test(path) && !u.search) return 'asset';
    if (/^\/icons\/[\w-]+\.png$/.test(path) || path === '/favicon.svg' || path === '/offline') return 'asset';
    if (req.mode === 'navigate' && pages.test(path)) return 'page';
    return null;
  }
  function storable(res, origin) {
    if (!res || !res.ok || res.status !== 200 || res.type === 'opaque' || res.redirected) return false;
    if (/private|no-store/i.test(res.headers.get('cache-control') || '')) return false;
    if (res.headers.get('set-cookie')) return false;
    if (Number(res.headers.get('content-length') || 0) > 5_000_000) return false;
    if (res.url && classify({ method: 'GET', url: res.url, headers: new Headers() }, origin) !== 'asset') return false;
    return /(?:javascript|text\/css|font\/|image\/|application\/(?:font|x-font|octet-stream)|text\/html)/i.test(res.headers.get('content-type') || '');
  }
  const api = { classify, storable };
  if (typeof module !== 'undefined') module.exports = api; else root.MobilePolicy = api;
})(typeof self !== 'undefined' ? self : this);


