import { Button } from '../../components/button/button.js';
import config from './authPageConfig.js';
import LoginForm from '../../components/loginForm/loginForm.js';
import RegisterForm from '../../components/registerForm/registerForm.js';
import { router } from '../../modules/routing.js';

/**
 * Класс страницы авторизации
 */
export class AuthPage {
  #loginForm;
  #registerForm;
  #parent;
  #loginButton;
  #registerButton;

  #loginFormSelector = '.authPage__login';
  #registerFormSelector = '.authPage__register';
  #formLineSelector = '.authPage__line';

  /**
   * Создает экземпляр страницы авторизации.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница авторизации
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /**
   * Отображает страницу авторизации.
   */
  render = (isLoginPage) => {
    if (!this.#registerButton) {
      const template = window.Handlebars.templates['authPage.hbs'];
      this.#parent.innerHTML = template(undefined);

      const formLine = this.#parent.querySelector(this.#formLineSelector);

      this.#registerButton = new Button(formLine, {
        ...config.buttons.register,
        onSubmit: this.toggleRegisterForm,
      });
      this.#registerButton.render();

      this.#loginButton = new Button(formLine, {
        ...config.buttons.login,
        onSubmit: this.toggleLoginForm,
      });
      this.#loginButton.render();
    }

    isLoginPage ? this.renderLoginForm() : this.renderRegisterForm();
  };

  /**
   * Отображение формы входа
   */
  renderLoginForm = () => {
    this.#toggleForms(true);
    if (!this.#loginForm) {
      this.#loginForm = new LoginForm(
        this.#parent.querySelector(this.#loginFormSelector),
        config.forms.login,
      );
      this.#loginForm.render();
    }
  };

  /**
   * Отображение формы регистрации
   */
  renderRegisterForm = () => {
    this.#toggleForms(false);
    if (!this.#registerForm) {
      this.#registerForm = new RegisterForm(
        this.#parent.querySelector(this.#registerFormSelector),
        config.forms.register,
      );
      this.#registerForm.render();
    }
  };

  /**
   * Переключение между формами
   * @param {boolean} isLogin - Если true, показывается форма входа, иначе — регистрации.
   */
  #toggleForms(isLogin) {
    this.#parent.querySelector(this.#loginFormSelector).style.display = isLogin
      ? 'contents'
      : 'none';
    this.#parent.querySelector(this.#registerFormSelector).style.display = isLogin
      ? 'none'
      : 'contents';
    this.#loginButton.toggleClass(
      isLogin ? 'button_inactive' : 'button_active',
      isLogin ? 'button_active' : 'button_inactive',
    );
    this.#registerButton.toggleClass(
      isLogin ? 'button_active' : 'button_inactive',
      isLogin ? 'button_inactive' : 'button_active',
    );
  }

  /**
   * Переход на страницу входа
   */
  toggleLoginForm = () => {
    router.goToPage('loginPage');
  };

  /**
   * Переход на страницу регистрации
   */
  toggleRegisterForm = () => {
    router.goToPage('registerPage');
  };

  /**
   * Удаляет страницу и очищает содержимое родительского элемента.
   */
  remove() {
    this.#loginForm?.remove();
    this.#registerForm?.remove();
    this.#loginButton.remove();
    this.#registerButton.remove();
    this.#parent.innerHTML = '';
  }
}
