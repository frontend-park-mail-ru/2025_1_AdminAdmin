import { router } from '../../modules/routing.js';

/**
 * Класс AuxHeader представляет заголовок страниц логина и авторизации.
 */
export default class AuxHeader {
  #parent;
  #template;
  #clickHandler;

  /**
   * Создает экземпляр заголовка.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent) {
    this.#parent = parent;
    this.#template = Handlebars.templates['auxHeader.hbs'];
    this.#clickHandler = this.#handleClick.bind(this);
  }

  /**
   * Отображает заголовок на странице.
   */
  render() {
    this.#parent.innerHTML = this.#template();
    this.#addEventListeners();
  }

  /**
   * Добавляет обработчики событий.
   * @private
   */
  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  /**
   * Обрабатывает клик по элементам заголовка.
   * Перенаправляет на главную страницу при клике на логотип.
   * @param {Event} event - Событие клика.
   * @private
   */
  #handleClick(event) {
    const logo = event.target.closest('.logo');

    if (logo) {
      router.goToPage('home');
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
