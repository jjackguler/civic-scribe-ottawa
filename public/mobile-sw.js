importScripts('/mobile-policy.js');
const CACHE = 'broadsheet-mobile-assets-v2';
const MAX_ENTRIES = 128, MAX_AGE = 30 * 86400_000;
const SHELL = ['/offline', '/icons/icon-192.png', '/favicon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    for (const path of SHELL) {
      const response = await fetch(path, { cache: 'reload' });
      if (!self.MobilePolicy.storable(response, self.location.origin)) throw new Error('Offline asset unavailable');
      await cache.put(path, response);
    }
  }));
  // Updates wait for the reader to choose when to reload.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n.startsWith('broadsheet-mobile-assets-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
async function store(cache, request, response) {
  if (!self.MobilePolicy.storable(response, self.location.origin)) return;
  const headers = new Headers(response.headers); headers.set('x-ab-stored', String(Date.now()));
  await cache.put(request, new Response(await response.blob(), { status: response.status, headers }));
  const keys = (await cache.keys()).filter(k => !SHELL.includes(new URL(k.url).pathname));
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES)).map(k => cache.delete(k)));
}
self.addEventListener('fetch', event => {
  const kind = self.MobilePolicy.classify(event.request, self.location.origin);
  if (!kind) return;
  if (kind === 'page') {
    // SSR documents may contain personalised state. Never cache them.
    event.respondWith(fetch(event.request).catch(async () => (await caches.match('/offline', { cacheName: CACHE })) || new Response('Offline', { status: 503 })));
    return;
  }
  const work = (async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(event.request);
    const at = Number(hit?.headers.get('x-ab-stored') || 0);
    if (hit && (SHELL.includes(new URL(event.request.url).pathname) || (at && Date.now() - at < MAX_AGE))) return hit;
    const response = await fetch(event.request);
    await store(cache, event.request, response.clone()).catch(() => {});
    return response;
  })();
  event.respondWith(work);
  event.waitUntil(work.then(() => undefined, () => undefined));
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });

