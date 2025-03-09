/* Поле ввода */
export class FormInput {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        label: "",          // Заголовок поля ввода (перед полем ввода)
        error: "",    // Дополнительная информация (ошибка или подсказка)
        placeholder: "",    // начальный текст
        type: "",           // Тип поля ввода
        required: false     // Обязательное поле или нет
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
            error: props.error,
            placeholder: props.placeholder,
            type: props.type,
            required: props.required
        }
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["formInput.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}
