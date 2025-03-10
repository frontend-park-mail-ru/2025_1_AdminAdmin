import { Logo } from '../logo/logo.js';

/**
 * Класс AuxHeader представляет заголовок страниц логина и авторизации.
 */
export default class AuxHeader {
  #parent;
  #logo;

  /**
   * Создает экземпляр заголовка.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.aux_header');
  }

  /**
   * Отображает заголовок на странице.
   */
  render() {
    const template = window.Handlebars.templates['auxHeader.hbs'];
    this.#parent.innerHTML = template(undefined);
    this.#logo = new Logo(this.self, '/src/assets/logo.png');
    this.#logo.render();
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove() {
    this.#logo.remove();
    this.#parent.innerHTML = '';
  }
}
