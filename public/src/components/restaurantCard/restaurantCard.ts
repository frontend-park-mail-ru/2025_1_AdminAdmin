import { router } from '@modules/routing';

import template from './restaurantCard.hbs';

import { BaseRestaurant } from '@myTypes/restaurantTypes';

/**
 * Класс карточки ресторана
 */
export class RestaurantCard {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props: BaseRestaurant;
  private readonly isSearchCard: boolean;
  /**
   * Создает экземпляр карточки ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   * @param isSearchCard
   */
  constructor(parent: HTMLElement, props: BaseRestaurant, isSearchCard = false) {
    this.parent = parent;
    this.props = props;
    this.isSearchCard = isSearchCard;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    return document.getElementById(this.props.id) as HTMLElement;
  }

  /**
   * Обработчик нажатия на карточку.
   * @private
   */
  private handleClick = () => {
    router.goToPage('restaurantPage', this.props.id);
  };

  /**
   * Отображает карточку на странице.
   * @param pushDirection {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} - Определяет, куда вставлять карточку относительно родителя.
   */
  render(pushDirection: InsertPosition = 'beforeend') {
    const html = template(this.props);
    this.parent.insertAdjacentHTML(pushDirection, html);
    if (this.isSearchCard) this.self.classList.add('restaurant__search-card');
    this.self.addEventListener('click', this.handleClick);
  }

  /**
   * Удаляет карточку ресторана со страницы и снимает обработчики событий.
   */
  remove() {
    this.self.removeEventListener('click', this.handleClick);
  }
}
