import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';

/**
 * Класс, представляющий страницу регистрации.
 */
export default class RegisterPage {
  #parent;
  #template;
  #page;
  #clickHandler;

  /**
   * Создает экземпляр страницы регистрации.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница
   */
  constructor(parent) {
    this.#parent = parent;
    this.#template = Handlebars.templates['registerPage.hbs'];
    this.#page = null;
    this.#clickHandler = this.#handleClick.bind(this);
  }

  /**
   * Рендерит страницу регистрации в родительский элемент.
   * Добавляет обработчики событий для кликов по элементам страницы.
   */
  render() {
    this.#page = this.#template();
    this.#addEventListeners();
    this.#parent.innerHTML = this.#page;
  }

  /**
   * Добавляет обработчик событий для кликов по странице.
   */
  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  /**
   * Обрабатывает клики на странице.
   * Выполняет переход на страницу логина или отправку формы регистрации.
   * @param {MouseEvent} event - Событие клика
   */
  #handleClick(event) {
    const signinLink = event.target.closest('.signin-link');
    if (signinLink) {
      router.goToPage('loginPage');
    }

    const registerButton = event.target.closest('.register-form__register-button');
    if (registerButton) {
      event.preventDefault();

      const form = registerButton.closest('form');
      if (!form) return;

      const loginInput = form.querySelector('input[type="text"]');
      const passwordInput = form.querySelector('input[type="password"]');

      if (loginInput && passwordInput) {
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        userStore
          .register({ login, password })
          .then(() => {
            router.goToPage('home');
          })
          .catch((err) => {
            console.error('Register failed:', err);
          });
      }
    }
  }

  /**
   * Удаляет страницу из родительского элемента и очищает события.
   */
  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
