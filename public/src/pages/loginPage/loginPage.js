//import {input} from '../../components/input/input.js'

/**
 * Класс, представляющий страницу логина.
 */
export default class LoginPage {
  #parent;
  //#template;
  //#page;
  //#clickHandler;

  /**
   * Создает экземпляр страницы логина.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница
   */
  constructor(parent) {
    this.#parent = parent;
    //this.#template = Handlebars.templates['loginPage.hbs'];
    //this.#page = null;
    //this.#clickHandler = this.#handleClick.bind(this);
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.');
  }

  /**
   * Рендерит страницу логина в родительский элемент.
   * Добавляет обработчик событий для кликов по элементам страницы.
   */
  render() {
    const template = window.Handlebars.templates["loginPage.hbs"];
    const html = template();
    this.#parent.innerHTML = html;
    //this.#page = this.#template();
    //this.#parent.innerHTML = this.#page;
    //document.addEventListener('click', this.#clickHandler);
    //->const login_input = new input(this.self, "логин")
  }

  /**
   * Обрабатывает клики на странице.
   * Выполняет переход на страницу регистрации или отправку формы логина.
   * @param {MouseEvent} event - Событие клика
   */
  /*
  #handleClick(event) {
    const signupLink = event.target.closest('.signup-link');
    if (signupLink) {
      router.goToPage('registerPage');
    }

    const loginButton = event.target.closest('.login-form__login-button');
    if (loginButton) {
      event.preventDefault();

      const form = loginButton.closest('form');
      if (!form) return;

      const loginInput = form.querySelector('input[type="text"]');
      const passwordInput = form.querySelector('input[type="password"]');

      if (loginInput && passwordInput) {
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        userStore
          .login({ login, password })
          .then(() => {
            router.goToPage('home');
          })
          .catch((err) => {
            console.error('Login failed:', err);
          });
      }
    }
  }
  */

  /**
   * Удаляет страницу из родительского элемента и очищает события.
   */
  remove() {
    //document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
