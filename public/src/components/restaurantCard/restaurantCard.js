/* Логотип */
export class restaurantCard {
    #parent;                // Родитель (где вызывается)
    #props = {              // Свойства лого
        id: "",             // Идентификатор карточки
        name: "",           // Название ресторана
        description: "",    // Описание ресторана
        deliveryTime: "",   // Время доставки
        rating: {
            score: "",      // Оценка
            amount: "",     // Кол-во отзывов
        },
        image: "",
    };

    /* Конструктор */
    constructor(parent, props) {
        this.#parent = parent;
        this.#props = {
            id: props.id,
            name: props.name,
            description: props.description,
            deliveryTime: props.deliveryTime,
            rating: {
                score: props.score,
                amount: props.amount,
            },
            image: props.image,
        }
    }

    /* Действие при нажатии */
    #handleClick() {
        this.self.addEventListener("click", (event) => {
            event.preventDefault(); // Отменяем дефолтное дейтсвие 
            router.goToPage('restaurantPage', this.#props.id);;   // Переход на страницу ресторана
        });
    }

    /* Рендер */
    render(){
        template = window.Handlebars.templates["restaurantCard.hbs"];
        html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        this.#handleClick();
    }

    /* При удалении объекта */
    #destructor(){
        this.self.removeEventListener("click", (event) => {
            event.preventDefault(); // Отменяем дефолтное дейтсвие 
            router.goToPage('restaurantPage', this.#props.id);;   // Переход на страницу ресторана
        });
    } 
}