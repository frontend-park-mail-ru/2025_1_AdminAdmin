#!/bin/bash
mkdir -p public/build
handlebars -m public/src/pages/restaurantPage.hbs -f public/build/restaurantPage.js
handlebars -m public/src/pages/restaurantList.hbs -f public/build/restaurantList.js
handlebars -m public/src/components/header.hbs -f public/build/header.js
handlebars -m public/src/components/restaurantCard.hbs -f public/build/restaurantCard.js
