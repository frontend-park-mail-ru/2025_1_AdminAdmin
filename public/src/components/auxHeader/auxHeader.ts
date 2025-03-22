import { Logo } from '../logo/logo';
import template from './auxHeader.hbs';

/**
 * Класс AuxHeader представляет заголовок страниц логина и авторизации.
 */
export default class AuxHeader {
  private parent: HTMLElement;
  private logo?: Logo;

  /**
   * Создает экземпляр заголовка.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement | null {
    return document.querySelector('.aux_header');
  }

  /**
   * Отображает заголовок на странице.
   */
  render(): void {
    this.parent.innerHTML = template(undefined);
    const logoElement = this.self;
    if (logoElement) {
      this.logo = new Logo(logoElement, '/src/assets/logo.png');
      this.logo.render();
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    this.logo?.remove();
    this.parent.innerHTML = '';
  }
}
