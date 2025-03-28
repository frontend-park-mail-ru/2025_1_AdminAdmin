import template from './404.hbs';

/**
 * Класс 404 страницы
 */
export default class NotFoundPage {
  protected parent: HTMLElement;

  /**
   * Создает экземпляр 404 страницы.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться 404 страница
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.not-found-page');
    if (!element) {
      throw new Error(`Error: can't find 404 page`);
    }
    return element as HTMLElement;
  }

  /**
   * Рендерит 404 страницу
   * @returns {void}
   */
  render(): void {
    if (!template) {
      throw new Error('Error: 404 page template not found');
    }
    try {
      this.parent.innerHTML = template();
    } catch (error) {
      console.error('Error rendering 404 page:', error);
    }
  }

  /**
   * Удаляет 404 страницу и очищает содержимое родительского элемента.
   */
  remove() {
    const element = this.self;
    element.remove();
  }
}
