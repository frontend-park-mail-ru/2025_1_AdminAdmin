/* Хедер ресторана */
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

    /* Конструктор */
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

    /* Ссылка на объект */
    get self(){
        return document.querySelector(".restaurant__header");
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["restaurantHeader.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}
