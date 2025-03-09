import { FormInput } from "../formInput/formInput.js";
import { Button } from "../../button/button.js";
import { Select } from "../../select/select.js";

/* строка в форме */
export class FormLine {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        components: "",     // Те компоненты, которые будут в form_line
        style: "",         // Дополнительный класс css
    };

    /* Конструктор */
    constructor(parent, props) {
        if (!parent) {
            throw new Error("Form_line: no parent!");
        }
        this.#parent = parent;
        this.#props = {
            id: props.id,
            components: props.components,
            style: props.style,
        }
    }

    /* Ссылка на объект */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /* Рендер */
    render = () => {
        const template = window.Handlebars.templates["formLine.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        if (!this.self) {
            throw new Error("Form_line: invalid self!");
        }
        if (this.#props.style) {
            this.self.classList.add(...this.#props.style.split(' '));
        }
        for (let form__component of this.#props.components) {
        }
    }
}
