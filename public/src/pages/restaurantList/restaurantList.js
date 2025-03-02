import { AppRestaurantRequests } from '../../modules/ajax.js';
import { restaurantCard } from '../../components/restaurantCard/restaurantCard.js';

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;
  #template;
  #page;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
    this.#template = Handlebars.templates['restaurantList.hbs'];
    this.#page = null;
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
      this.#page = this.#template({ restaurantList: this.#restaurantList });
      this.#parent.innerHTML = this.#page;
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
