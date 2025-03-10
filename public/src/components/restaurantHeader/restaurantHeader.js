/**
 * Класс хедера ресторана (шапка с название и описанием)
 */
export class restaurantHeader {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства хедера
        name: "",           // Название ресторана
        description: "",    // Описание ресторана
        type: "",           // Тип ресторана (кухня)
        rating: {
            score: "",      // Оценка
            //amount: "",     // Кол-во отзывов
        },
        background: "",     // Фоновое изображение (шапка)
        icon: "",           // Иконка ресторана
    };

    /**
     * Создает экземпляр хедера ресторана
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться хедер.
     * @param {Object} props - Словарь данных для определения свойств хедера
     */
    constructor(parent, props) {
        this.#parent = parent;
        this.#props = {
            name: props.name,
            description: props.description,
            type: props.type,
            rating: {
                score: props.rating.score,
                //amount: props.rating.amount,
            },
            background: props.background || "/src/assets/header.png",
            icon: props.icon || "/src/assets/burgerking.png",
        };
    }

    /**
     * Ссылка на объект
     * @returns {HTMLElement} - ссылка на объект 
     */
    get self(){
        return document.querySelector(".restaurant__header");
    }

    /**
     * Отображает хедер ресторана на странице.
     */
    render(){
        const template = window.Handlebars.templates["restaurantHeader.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}
