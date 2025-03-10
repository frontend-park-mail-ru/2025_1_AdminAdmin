import { router } from '../../modules/routing.js';

/* Логотип */
export class Logo {
  #parent; // Родитель (где вызывается)
  #clickHandler;
  #props = {
    // Свойства лого
    image: '', // картинка логотипа
  };

  /* Конструктор */
  constructor(parent, image) {
    this.#parent = parent;
    this.#props = { image: image };
    this.#clickHandler = this.#handleClick.bind(this);
  }

  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  /* Действие при нажатии */
  #handleClick(event) {
    const logo = event.target.closest('.logo');
    if (logo) {
      router.goToPage('home');
    }
  }

  /* Рендер */
  render() {
    const template = window.Handlebars.templates['logo.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
    this.#addEventListeners();
  }

  /* При удалении объекта */
  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
