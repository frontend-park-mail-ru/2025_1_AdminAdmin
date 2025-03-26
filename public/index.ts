import './index.scss'

import { initRouting } from './src/modules/routing';

const rootElement = document.getElementById('root');

initRouting(rootElement);


/*
if ('serviceWorker' in navigator) {
    (async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service worker registered', registration);
        } catch (err) {
            console.error('Service worker registration failed', err);
        }
    })();
}*/
