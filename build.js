import { execSync } from "child_process";
import fs from "fs";
import path from "path";

fs.mkdirSync(path.join("public", "build"), { recursive: true });

const commands = [
    `npx handlebars -m ${path.join("public", "src", "pages", "restaurantPage", "restaurantPage.hbs")} -f ${path.join("public", "build", "restaurantPage.js")}`,
    `npx handlebars -m ${path.join("public", "src", "pages", "restaurantList", "restaurantList.hbs")} -f ${path.join("public", "build", "restaurantList.js")}`,
    `npx handlebars -m ${path.join("public", "src", "pages", "loginPage", "loginPage.hbs")} -f ${path.join("public", "build", "loginPage.js")}`,
    `npx handlebars -m ${path.join("public", "src", "pages", "registerPage", "registerPage.hbs")} -f ${path.join("public", "build", "registerPage.js")}`,
    `npx handlebars -m ${path.join("public", "src", "components", "header", "header.hbs")} -f ${path.join("public", "build", "header.js")}`,
    `npx handlebars -m ${path.join("public", "src", "components", "restaurantCard.hbs")} -f ${path.join("public", "build", "restaurantCard.js")}`,
    `npx handlebars -m ${path.join("public", "src", "components", "auxHeader", "auxHeader.hbs")} -f ${path.join("public", "build", "auxHeader.js")}`,
];

commands.forEach(cmd => execSync(cmd, { stdio: "inherit", shell: true }));