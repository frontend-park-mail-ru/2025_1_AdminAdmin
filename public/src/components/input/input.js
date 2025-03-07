/* Поле ввода */
export class input {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        placeholder: "",    // начальный текст
    };

    /* Ссылка на объект */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /* Конструктор */
    constructor(parent, props) {
        this.#parent = parent;
        this.#props = {id: props.id, placeholder: props.placeholder}
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["input.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}
