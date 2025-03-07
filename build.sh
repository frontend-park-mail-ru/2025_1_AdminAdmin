#!/bin/bash
mkdir -p public/build
handlebars -m public/src/pages/restaurantPage/restaurantPage.hbs -f public/build/restaurantPage.js
handlebars -m public/src/pages/restaurantList/restaurantList.hbs -f public/build/restaurantList.js
handlebars -m public/src/pages/loginPage/loginPage.hbs -f public/build/loginPage.js
handlebars -m public/src/pages/registerPage/registerPage.hbs -f public/build/registerPage.js

handlebars -m public/src/components/header/header.hbs -f public/build/header.js
handlebars -m public/src/components/auxHeader/auxHeader.hbs -f public/build/auxHeader.js
handlebars -m public/src/components/button/button.hbs -f public/build/button.js
handlebars -m public/src/components/logo/logo.hbs -f public/build/logo.js
handlebars -m public/src/components/input/input.hbs -f public/build/input.js
handlebars -m public/src/components/restaurantCard/restaurantCard.hbs -f public/build/restaurantCard.js
handlebars -m public/src/components/form/form__line/form__line.hbs -f public/build/form__line.js
handlebars -m public/src/components/form/form__input/form__input.hbs -f public/build/form__input.js
handlebars -m public/src/components/form/form.hbs -f public/build/form.js
