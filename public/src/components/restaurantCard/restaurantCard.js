import { router } from '../../modules/routing.js';

/* Карточка ресторана */
export class restaurantCard {
  #parent; // Родитель (где вызывается)
  #props = {
    // Свойства лого
    id: '', // Идентификатор карточки
    name: '', // Название ресторана
    description: '', // Описание ресторана
    type: '', // Тип ресторана (Кухня)
    //deliveryTime: "",   // Время доставки
    rating: {
      score: '', // Оценка
      amount: '', // Кол-во отзывов
    },
    image: '', // Изображение
  };

  /* Конструктор */
  constructor(parent, props) {
    this.#parent = parent;
    this.#props = {
      id: props.id,
      name: props.name,
      description: props.description,
      type: props.type,
      //deliveryTime: props.deliveryTime, // Убрать?
      rating: {
        score: props.rating,
        amount: props.amount,
      },
      image: props.image || '/src/assets/burgerking.png',
    };
  }

  /* Ссылка на объект */
  get self() {
    return document.getElementById(this.#props.id);
  }

  /* Действие при нажатии */
  #handleClick() {
    this.self.addEventListener('click', (event) => {
      event.preventDefault();
      router.goToPage('restaurantPage', this.#props.id);
    });
  }

  /* Рендер */
  render(pushDirection) {
    const template = window.Handlebars.templates['restaurantCard.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML(pushDirection, html);
    this.#handleClick();
  }

  /* При удалении объекта */
  remove() {
    this.self.removeEventListener('click', (event) => {
      event.preventDefault(); // Отменяем дефолтное дейтсвие
      router.goToPage('restaurantPage', this.#props.id); // Переход на страницу ресторана
    });
  }
}
