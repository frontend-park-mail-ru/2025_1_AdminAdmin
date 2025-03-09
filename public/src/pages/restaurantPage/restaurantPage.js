import { restaurantHeader } from '../../components/restaurantHeader/restaurantHeader.js';
import { AppRestaurantRequests } from '../../modules/ajax.js';

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  #parent;
  #props = {            // Свойства ресторана
    id: "",
    name: "",           // Название ресторана
    description: "",    // Описание ресторана
    rating: {
        score: "",      // Оценка
        //amount: "",     // Кол-во отзывов
    },
    background: "",     // Фоновое изображение (шапка)
    icon: "",           // Иконка ресторана
  };

  /**
   * Создает экземпляр страницы ресторана.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться информация о ресторане
   * @param {number} id - Идентификатор ресторана, который нужно отобразить
   */
  constructor(parent, id) {
    this.#parent = parent;
    this.#props.id = id;
  }

  get self() {
    return document.querySelector('.restaurantPage__body');
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
        throw new Error('RestaurantPage: Нет ресторанов!');
      }

      // Ищем ресторан по ID. Получаем его данные
      const restaurantDetails = restaurants.find((r) => r.id === this.#props.id);
      this.#props.name = restaurantDetails.name;
      this.#props.description = restaurantDetails.description;
      this.#props.type = restaurantDetails.type;
      this.#props.rating.score = restaurantDetails.rating;
      //this.#props.background = "/src/assets/burgerking.png";
      //this.#props.icon = "/src/assets/burgerking.png";
      // Генерируем HTML с использованием шаблона
      const template = window.Handlebars.templates["restaurantPage.hbs"];
      const html = template();
      this.#parent.innerHTML = html;
      const restaurant__header = new restaurantHeader(this.self, this.#props);
      restaurant__header.render(); 
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
