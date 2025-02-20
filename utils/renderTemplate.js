import fs from "fs";
import Handlebars from "handlebars";

function renderTemplate(templatePath, data) {
    const source = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(source);
    return template(data);
}

export default renderTemplate;