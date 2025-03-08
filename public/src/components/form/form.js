import { FormLine } from "./formLine/formLine.js";
 
/* Форма */
export class Form {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        tabs: [],           // Кнопки сверху
        lines: [],          // Внутренности формы
    };

    /* Ссылка на объект */
    get self() {
        return document.querySelector('.form');
    }

    /* Конструктор */
    constructor(parent, props) {
        this.#parent = parent;
        this.#props = {
            tabs: props.tabs,
            lines: props.lines,
        }
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["form.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        for (let tab_props of this.#props.tabs) {
            if (tab_props.type !== "button") {
                tab_props.type = "button";
            }
        }
        const form__tabs = new FormLine(this.self, {id:"form__tabs", components:this.#props.tabs, style:"form__line_tabs"});
        form__tabs.render();
        document.getElementById("form__tabs").style.marginBottom = "15px";
        for (let line_props of this.#props.lines) {
            const line = new FormLine(this.self, line_props);
            line.render();
        }
    }
}
