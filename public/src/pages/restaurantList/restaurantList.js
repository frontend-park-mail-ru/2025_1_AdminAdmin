import { router } from '../../modules/routing.js';
import { AppRestaurantRequests } from '../../modules/ajax.js';

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;
  #template;
  #page;
  #clickHandler;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
    this.#template = Handlebars.templates['restaurantList.hbs'];
    this.#page = null;
    this.#clickHandler = this.#handleClick.bind(this);
  }

  /**
   * Рендерит список ресторанов в родительский элемент.
   * Получает данные о ресторанах с сервера и отображает их на странице.
   * @returns {Promise<void>}
   */
  async render() {
    try {
      // Получаем список ресторанов
      this.#restaurantList = await AppRestaurantRequests.GetAll();
      if (!this.#restaurantList) throw new Error('Empty restaurant list');

      // Генерируем HTML с использованием шаблона
      this.#page = this.#template({ restaurantList: this.#restaurantList });
      this.#parent.innerHTML = this.#page;

      // Добавляем обработчики событий
      this.#addEventListeners();
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  /**
   * Добавляет обработчик событий для кликов по странице.
   */
  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  /**
   * Обрабатывает клики на карточки ресторанов.
   * При клике на карточку ресторана выполняется переход на страницу этого ресторана.
   * @param {MouseEvent} event - Событие клика
   */
  #handleClick(event) {
    const restaurantCard = event.target.closest('.restaurant-card');
    if (restaurantCard) {
      const restaurantId = restaurantCard.dataset.id;
      router.goToPage('restaurantPage', restaurantId);
    }
  }

  /**
   * Удаляет список ресторанов и очищает события.
   */
  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
