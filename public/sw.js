self.addEventListener('install', event => {
    console.log('Installing [Service Worker]', event);

    event.waitUntil((async () => {
        try {
            const cache = await caches.open('static');
            console.log('[Service Worker] Precaching App Shell');
            await cache.addAll([
                '/',
                '/index.html',
                '/index.ts',
                '/index.scss',
            ]);
        } catch (err) {
            console.error('[Service Worker] Precaching failed', err);
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== 'static') {
                    return caches.delete(cacheName);
                }
            })
        );
    })());
});


self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            const response = await fetch(event.request);
            const cache = await caches.open('dynamic');
            await cache.put(event.request.url, response.clone());
            return response;
        } catch (err) {
            console.error('[Service Worker] Fetch failed', err);
        }
    })());
});

