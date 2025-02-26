import "./build/restaurantList.js";
import "./build/restaurantPage.js";
import "./build/loginPage.js";
import "./build/registerPage.js";
import "./build/header.js";
import "./build/restaurantCard.js";
import "./build/auxHeader.js";
import {initRouting} from "./src/modules/routing.js";

const rootElement = document.getElementById("root");

Handlebars.registerPartial("restaurantCard", Handlebars.templates["restaurantCard.hbs"]);

initRouting(rootElement);
