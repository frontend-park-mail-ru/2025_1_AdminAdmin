/* Поле ввода */
export class FormInput {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства поля ввода
        id: "",             // Id для идентификации
        label: "",          // Заголовок поля ввода (перед полем ввода)
        error: "",          // Дополнительная информация (ошибка или подсказка)
        placeholder: "",    // начальный текст
        type: "",           // Тип поля ввода
        required: false     // Обязательное поле или нет
    };

    /**
     *Создает экземпляр поля ввода.
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться поле ввода.
     * @param {Object} props - Словарь данных для определения свойств поля ввода
     */
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

    /**
     * Ссылка на объект
     * @returns {HTMLElement} - ссылка на объект 
     */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /**
     * Ссылка на поле ввода
     * @returns {HTMLElement} - ссылка на объект 
     */
    get input() {
        return this.self.querySelector("input");
    }

    /**
     * Отображает поле ввода на странице.
     */
    render(){
        const template = window.Handlebars.templates["formInput.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }

    /**
     * Отображает ошибку рядом с полем ввода.
     * @param {String} errorMessage - сообщение ошибки
     */
    setError(errorMessage) {
        const errorElement = this.#parent.querySelector(`#${this.#props.id}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = "block";
        }

        if (this.input) {
            this.input.classList.add("error");
        }
    }

    /**
     * Убирает отображение ошибки
     */
    clearError() {
        const errorElement = this.#parent.querySelector(`#${this.#props.id}-error`);
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }

        if (this.input) {
            this.input.classList.remove("error");
        }
    }

    /**
     * Возвращает значение в поле ввода
     * @returns {String} - введенная строка 
     */
    get value() {
        return this.input ? this.input.value : "";
    }
}
