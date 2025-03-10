import { router } from '../../modules/routing.js';

/**
 * Класс логотипа
 */
export class Logo {
  #parent;      // Родитель (где вызывается)
  #clickHandler;
  #props = {    // Свойства лого
    image: '',  // картинка логотипа
  };

  /**
   * Создает экземпляр лого
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться лого
   * @param {String} image - Путь до картинки лого
   */
  constructor(parent, image) {
    this.#parent = parent;
    this.#props = { image: image };
    this.#clickHandler = this.#handleClick.bind(this);
  }

  /**
    * Обработчик нажатия на лого
    * @private
    */
  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  /**
    * Действие при нажатии на лого
    * @private
    */
  #handleClick(event) {
    const logo = event.target.closest('.logo');
    if (logo) {
      router.goToPage('home');
    }
  }

  /**
   * Отображает лого на странице
   */
  render() {
    const template = window.Handlebars.templates['logo.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
    this.#addEventListeners();
  }

  /**
   * Удаляет лого со страницы и снимает обработчики событий.
   */
  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
