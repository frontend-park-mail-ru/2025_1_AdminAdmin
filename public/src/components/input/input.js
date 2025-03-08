/* Поле ввода */
export class Input {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        placeholder: "",    // начальный текст
        type: "",           // Тип поля ввода
        required: false     // Обязательное поле или нет
    };

    /* Конструктор */
    constructor(parent, props) {
        if (!parent) {
            throw new Error("Input: no parent!");
        }
        this.#parent = parent;
        this.#props = {
            id: props.id,
            placeholder: props.placeholder,
            type: props.type,
            required: props.required ?? false
        };
    }

    /* Ссылка на объект */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["input.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}
