import RegisterForm from "../../components/registerForm/registerForm.js";

/**
 * Класс, представляющий страницу регистрации.
 */
export default class RegisterPage {
  #parent;
  #registerForm;

  /**
   * Создает экземпляр страницы регистрации.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.registerPage__body');
  }

  /**
   * Рендерит страницу регистрации в родительский элемент.
   * Добавляет обработчики событий для кликов по элементам страницы.
   */
  render() {
    const template = window.Handlebars.templates["registerPage.hbs"];
    this.#parent.innerHTML = template();
    this.#registerForm = new RegisterForm(document.querySelector('.registerPage__body'));
    this.#registerForm.render();
  }

  
  remove() {
    this.#parent.innerHTML = '';
  }
}
