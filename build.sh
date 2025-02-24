#!/bin/bash
mkdir -p public/build
handlebars -m public/src/pages/restaurantPage/restaurantPage.hbs -f public/build/restaurantPage.js
handlebars -m public/src/pages/restaurantList/restaurantList.hbs -f public/build/restaurantList.js
handlebars -m public/src/pages/loginPage/loginPage.hbs -f public/build/loginPage.js
handlebars -m public/src/pages/registerPage/registerPage.hbs -f public/build/registerPage.js
handlebars -m public/src/components/header/header.hbs -f public/build/header.js
handlebars -m public/src/components/restaurantCard.hbs -f public/build/restaurantCard.js
