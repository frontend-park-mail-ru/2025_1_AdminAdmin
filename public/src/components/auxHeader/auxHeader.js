import { router } from '../../modules/routing.js';

export default class AuxHeader {
  #parent;
  #template;
  #clickHandler;

  constructor(parent) {
    this.#parent = parent;
    this.#template = Handlebars.templates['auxHeader.hbs'];
    this.#clickHandler = this.#handleClick.bind(this);
  }

  render() {
    this.#parent.innerHTML = this.#template();
    this.#addEventListeners();
  }

  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  #handleClick(event) {
    const logo = event.target.closest('.logo');

    if (logo) {
      router.goToPage('home');
    }
  }

  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
