import { AppRestaurantRequests } from '../../modules/ajax.js';

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  #parent;
  #id;
  #restaurantDetail;
  #page;

  /**
   * Создает экземпляр страницы ресторана.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться информация о ресторане
   * @param {number} id - Идентификатор ресторана, который нужно отобразить
   */
  constructor(parent, id) {
    this.#parent = parent;
    this.#id = id;
    this.#restaurantDetail = null;
    this.#page = null;
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   * @returns {Promise<void>}
   */
  async render() {
    try {
      // Получаем список всех ресторанов
      const restaurants = await AppRestaurantRequests.GetAll();
      if (!Array.isArray(restaurants)) {
        throw new Error('Expected an array of restaurants');
      }

      // Ищем ресторан по ID
      this.#restaurantDetail = restaurants.find((r) => r.id === this.#id);

      // Генерируем HTML с использованием шаблона
      const template = Handlebars.templates['restaurantPage.hbs'];
      this.#page = template({ restaurantDetail: this.#restaurantDetail });
      this.#parent.innerHTML = this.#page;
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  /*  /!**
   * Получает статус открытия ресторана.
   * Проверяет текущее время и сравнивает его с рабочими часами ресторана.
   * @returns {string} - Статус работы ресторана, может быть "Open" или "Closed"
   *!/
  #getOpenStatus() {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (
      this.#restaurantDetail.workingHours.open < currentTime &&
      this.#restaurantDetail.workingHours.closed > currentTime
    ) {
      return 'Open';
    } else {
      return 'Closed';
    }
  }*/

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove() {
    this.#parent.innerHTML = '';
  }
}
