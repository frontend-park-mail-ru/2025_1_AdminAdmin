import { router } from '../../modules/routing.js';
import template from './restaurantCard.hbs';

/**
 * Класс карточки ресторана
 */
export class RestaurantCard {
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

  /**
   * Создает экземпляр карточки ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   */
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

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self() {
    return document.getElementById(this.#props.id);
  }

  /**
   * Обработчик нажатия на карточку.
   * @private
   */
  #handleClick() {
    this.self.addEventListener('click', (event) => {
      event.preventDefault();
      router.goToPage('restaurantPage', this.#props.id);
    });
  }

  /**
   * Отображает карточку на странице.
   * @param {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} pushDirection
   *        Определяет, куда вставлять карточку относительно родителя.
   */
  render(pushDirection) {
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML(pushDirection, html);
    this.#handleClick();
  }

  /**
   * Удаляет карточку ресторана со страницы и снимает обработчики событий.
   */
  remove() {
    this.self.removeEventListener('click', (event) => {
      event.preventDefault(); // Отменяем дефолтное дейтсвие
      router.goToPage('restaurantPage', this.#props.id); // Переход на страницу ресторана
    });
  }
}
