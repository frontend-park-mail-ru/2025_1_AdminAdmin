import './index.scss'

import { initRouting } from '@modules/routing';

const rootElement = document.getElementById('root');

initRouting(rootElement);



if ('serviceWorker' in navigator) {
    (async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');

            if (registration.active) {
                registration.active.postMessage('CLEAR_DYNAMIC_CACHE');
            } else {
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage('CLEAR_DYNAMIC_CACHE');
                    }
                });
            }
        } catch (err) {
            console.error('Service worker registration failed', err);
        }
    })();
}
