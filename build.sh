#!/bin/bash
mkdir -p public/build
handlebars -m public/src/pages/restaurantDetail.hbs -f public/build/restaurantDetail.js
handlebars -m public/src/pages/restaurantList.hbs -f public/build/restaurantList.js
