export class Button {
    #parent;  // Родитель (где вызывается)
    #clickHandler;
    #props = {                // Свойства кнопки:
        id: '',               // Id для идентификации
        text: '',             // text для отображения
        style: '',            // Дополнительный стиль css
        onSubmit: undefined,  // Функция при нажатии
        disabled: false,      // Состояние кнопки
    };

    /**
     *Создает экземпляр кнопки.
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться кнопка.
     * @param {Object} props - Словарь данных для определения свойств кнопки
     */
    constructor(parent, props) {
        if (!parent) {
            throw new Error("Button: no parent!");
        }
        this.#parent = parent;
        this.#props = {
            id: props.id,
            text: props.text,
            type: props.type,
            style: props.style,
            onSubmit: props.onSubmit,
            disabled: props.disabled || false,
        };

        this.#clickHandler = this.#handleClick.bind(this);
    }

    /**
     * Ссылка на объект
     * @returns {HTMLElement} - ссылка на объект 
     */
    get self() {
        return document.getElementById(this.#props.id);
    }

    /**
     * Обработчик нажатия на кнопку.
     * @private
     */
    #handleClick(event) {
        event.preventDefault();
        if (this.#props.onSubmit !== undefined) {
            this.#props.onSubmit();
        }
    }

    /**
     * Отображает кнопку на странице.
     */
    render = () => {
        const template = window.Handlebars.templates['button.hbs'];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML('beforeend', html);
        if (!this.#parent) {
            throw new Error("Button: invalid self!");
        }
        if (this.#props.style) {
            this.self.classList.add(...this.#props.style.split(' '));
        }
        this.self.disabled = this.#props.disabled;
        this.self.addEventListener('click', this.#clickHandler);
    }

    /**
     * Удаляет кнопку со страницы и снимает обработчики событий.
     */
    remove() {
        if (this.self) {
            this.self.removeEventListener("click", this.#clickHandler);  // Удаляем обработчик
            this.self.remove();
        }
    }

    /**
     * Метод для переключения класса
     * @param {CSSStyleSheet} oldCalss - текущий класс css который нужно заменить.
     * @param {CSSStyleSheet} oldCalss - новый класс css взамен старого.
     * */
    toggleClass(oldClass, newClass) {
        if (this.self) {
            this.self.classList.remove(oldClass);
            this.self.classList.add(newClass);
        }
    }
}
