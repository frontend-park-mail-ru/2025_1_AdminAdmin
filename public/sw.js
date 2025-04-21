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
            await cache.addAll(images);
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
            debugger
            const response = await fetch(event.request);

            if (response.ok) {
                const cache = await caches.open('dynamic');
                await cache.put(event.request.url, response.clone());
            }

            return response;
        } catch (err) {
            const cachedResponse = await caches.match(event.request);
            return cachedResponse || new Response('Resource not found', { status: 404 });
        }
    })());
});

