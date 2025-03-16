import './index.scss';

import { initRouting } from './src/modules/routing.js';

const rootElement = document.getElementById('root');
Handlebars.registerHelper("eq", (a, b) => a === b);

initRouting(rootElement);