import { AppRestaurantRequests } from '../../modules/ajax.js';
import { restaurantCard } from '../../components/restaurantCard/restaurantCard.js';

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
  }

  get self() {
    return document.querySelector('.restaurant__container');
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
      const template = window.Handlebars.templates["restaurantList.hbs"];
      const html = template();
      this.#parent.innerHTML = html;
      for (let restaurant of this.#restaurantList) {
        const card = new restaurantCard(this.self, restaurant);
        card.render();
      }
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  /**
   * Удаляет список ресторанов.
   */
  remove() {
    this.#parent.innerHTML = '';
  }
}
