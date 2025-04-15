import './index.scss'

import { initRouting } from '@modules/routing';

const rootElement = document.getElementById('root');

initRouting(rootElement);



/*if ('serviceWorker' in navigator) {
    (async () => {
        try {
            await navigator.serviceWorker.register('/sw.js');
        } catch (err) {
            console.error('Service worker registration failed', err);
        }
    })();
}*/
