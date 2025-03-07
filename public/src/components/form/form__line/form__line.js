import { form__input } from "../form__input/form__input.js";
import { button } from "../../button/button.js";

/* строка в форме */
export class form__line {
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
        console.log(props);
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
        const template = window.Handlebars.templates["form__line.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        if (!this.self) {
            throw new Error("Form_line: invalid self!");
        }
        this.self.classList += ` ${this.#props.style}`;
        for (let form__component of this.#props.components) {
            /*
            form__component = {
                type: "form__input",
                props: {...},
            }
            или
            form__component = {
                type: "button",
                props: {...},
            }
            */
           switch (form__component.type){
                case "form__input": {
                    const form__component_input = new form__input(this.self, form__component.props);
                    form__component_input.render(); 
                    break;
                }
                case "button": {
                    const form__component_button = new button(this.self, form__component.props);
                    form__component_button.render();
                    break;
                }
                default:
                    console.log(`form_line id=${this.#props.id} : Неправильные данные, тип ${this.#props.load.type} не поддерживается`)
           }
        }

    }
}
