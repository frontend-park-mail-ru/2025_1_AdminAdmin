import './index.scss'

import { initRouting } from './src/modules/routing';

const rootElement = document.getElementById('root');

initRouting(rootElement);

const apiKey = process.env.YANDEX_API_KEY;
const script = document.createElement("script");
script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
document.body.appendChild(script);


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
