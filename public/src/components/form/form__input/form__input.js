import { input } from "../../input/input.js";

/* Поле ввода */
export class form__input {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        label: "",          // Заголовок поля ввода (перед полем ввода)
        description: "",    // Дополнительная информация (ошибка или подсказка)
        props: "",    // Пропсы для строки ввода
    };

    /* Ссылка на объект */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /* Конструктор */
    constructor(parent, props) {
        if (!parent) {
            throw new Error("Form__input: no parent!");
        }
        this.#parent = parent;
        this.#props = {
            id: props.id, 
            label: props.label,
            description: props.description,
            props: props.props,
        }
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["form__input.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        if (!this.self) {
            throw new Error("Form__input: invalid self!");
        }
        const component_input = new input(this.self, this.#props.props);
        component_input.render();
    }
}
