import { execSync } from "child_process";

const commands = [
    "mkdir -p public/build",
    "handlebars -m public/src/pages/restaurantPage/restaurantPage.hbs -f public/build/restaurantPage.js",
    "handlebars -m public/src/pages/restaurantList/restaurantList.hbs -f public/build/restaurantList.js",
    "handlebars -m public/src/pages/loginPage/loginPage.hbs -f public/build/loginPage.js",
    "handlebars -m public/src/pages/registerPage/registerPage.hbs -f public/build/registerPage.js",
    "handlebars -m public/src/components/header/header.hbs -f public/build/header.js",
    "handlebars -m public/src/components/restaurantCard.hbs -f public/build/restaurantCard.js",
    "handlebars -m public/src/components/auxHeader/auxHeader.hbs -f public/build/auxHeader.js",
];

commands.forEach(cmd => execSync(cmd, { stdio: "inherit" }));
