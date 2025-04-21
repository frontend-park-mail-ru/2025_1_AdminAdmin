self.addEventListener('install', event => {
    console.log('[SW] Install event fired');

    event.waitUntil((async () => {
        try {
            const cache = await caches.open('static');
            console.log('[SW] Opened static cache');

            const appShell = [
                '/',
                '/index.html',
                '/index.ts',
                '/index.scss',
            ];

            console.log('[SW] Adding app shell to cache:', appShell);
            await cache.addAll(appShell);

            const images = [
                '/src/assets/background.jpg',
                '/src/assets/bin.png',
                '/src/assets/clock.png',
                '/src/assets/close.png',
                '/src/assets/default_product.jpg',
                '/src/assets/default_restaurant.jpg',
                '/src/assets/detail.png',
                '/src/assets/empty.png',
                '/src/assets/error.svg',
                '/src/assets/eye.png',
                '/src/assets/favicon.ico',
                '/src/assets/header.png',
                '/src/assets/hide.png',
                '/src/assets/info.svg',
                '/src/assets/location.png',
                '/src/assets/logo.png',
                '/src/assets/maps-and-flags.png',
                '/src/assets/map_location.png',
                '/src/assets/navigation.png',
                '/src/assets/profile.png',
                '/src/assets/right-arrow.png',
                '/src/assets/search-interface-symbol.png',
                '/src/assets/success.svg',
                '/src/assets/whopper.png',
                '/src/assets/yandex-maps-logo.png',
            ];

            console.log('[SW] Adding image assets to cache:', images);
            await cache.addAll(images);
            console.log('[SW] Precaching complete');
        } catch (err) {
            console.error('[SW] Precaching failed:', err);
        }
    })());
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate event fired');
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        console.log('[SW] Existing caches:', cacheNames);
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== 'static') {
                    console.log(`[SW] Deleting old cache: ${cacheName}`);
                    return caches.delete(cacheName);
                }
                return null;
            })
        );
        await self.clients.claim();
        console.log('[SW] Activation complete');
    })());
});

self.addEventListener('fetch', event => {
    console.log(`[SW] Fetch event for: ${event.request.url}`);

    event.respondWith((async () => {
        try {
            const response = await fetch(event.request);
            console.log(`[SW] Fetched from network: ${event.request.url}`);

            const staticCache = await caches.open('static');
            const cachedStatic = await staticCache.match(event.request);

            if (!cachedStatic && response.ok) {
                const dynamicCache = await caches.open('dynamic');
                await dynamicCache.put(event.request, response.clone());
                console.log(`[SW] Cached in dynamic: ${event.request.url}`);
            } else if (cachedStatic) {
                console.log(`[SW] Not caching in dynamic, already in static: ${event.request.url}`);
            }

            return response;
        } catch (err) {
            console.warn(`[SW] Network failed, checking cache: ${event.request.url}`, err);

            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                console.log(`[SW] Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }

            console.error(`[SW] Not found in any cache: ${event.request.url}`);
            return new Response('Resource not found', { status: 404 });
        }
    })());
});

