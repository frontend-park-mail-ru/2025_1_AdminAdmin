// Импорт js компонентов
import './build/logo.js';
import './build/button.js';
import './build/select.js'
//import './build/image.js';
// Импорт js сложных компонентов
import './build/header.js';
import './build/restaurantCard.js';
import './build/auxHeader.js';
import './build/formInput.js';
import './build/restaurantHeader.js';
// Импорт js страниц
import './build/restaurantList.js';
import './build/restaurantPage.js';
import './build/authPage.js';
import './build/loginForm.js';
import './build/registerForm.js';

import { initRouting } from './src/modules/routing.js';

const rootElement = document.getElementById('root');

initRouting(rootElement);
