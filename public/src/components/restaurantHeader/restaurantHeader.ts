import template from './restaurantHeader.hbs';
import { RestaurantResponse } from '@myTypes/restaurantTypes';
/**
 * Класс хедера ресторана (шапка с названием и описанием)
 */
export class RestaurantHeader {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props: RestaurantResponse;

  /**
   * Создает экземпляр хедера ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться хедер.
   * @param {Object} props - Словарь данных для определения свойств хедера
   */
  constructor(parent: HTMLElement, props: RestaurantResponse) {
    this.parent = parent;
    this.props = props;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurant-header');
    if (!element) {
      throw new Error(`Error: can't find restaurant-header`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает хедер ресторана на странице.
   */
  render() {
    if (!template) {
      throw new Error('Error: restaurant-header template not found');
    }
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Удаляет хедер ресторана со страницы
   */
  remove(): void {
    const element = this.self;
    element.remove();
  }
}
