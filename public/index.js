import "./build/restaurantList.js";
import "./build/restaurantPage.js";
import "./build/loginPage.js";
import "./build/registerPage.js";
import "./build/header.js";
import "./build/restaurantCard.js";
import {initRouting} from "./src/modules/routing.js";
import Header from "./src/components/header/header.js";

const rootElement = document.getElementById("root");
const pageElement = document.createElement("main");
rootElement.appendChild(pageElement);

Handlebars.registerPartial("restaurantCard", Handlebars.templates["restaurantCard.hbs"]);

initRouting(pageElement);

const header = new Header(rootElement);
header.render();
