import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';
import { FormInput } from '../formInput/formInput.js';
import { Button } from '../button/button.js';
import template from './loginForm.hbs';

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
  #parent;
  #config;

  #loginInput;
  #passwordInput;
  #submitBtn;

  /**
   * Конструктор класса
   * @constructor
   * @param parent {HTMLElement} - родительский элемент
   * @param config {Object} - пропсы
   */
  constructor(parent, config) {
    this.#parent = parent;
    this.#config = config;
  }

  /**
   * Получение HTML элемента формы
   * @returns {HTMLElement}
   */
  get self() {
    return document.getElementById(this.#config.id);
  }

  /**
   * Валидация данных
   */
  async validateData() {
    const isLoginValid = this.#loginInput.checkValue();
    const isPasswordValid = this.#passwordInput.checkValue();

    if (!(isLoginValid && isPasswordValid)) {
      return;
    }

    const login = this.#loginInput.value.trim();
    const password = this.#passwordInput.value;

    try {
      await userStore.login({ login, password });
      router.goToPage('home');
    } catch (err) {
      const errorMessage = err || 'Неверный логин или пароль';
      this.setError(errorMessage);
    }
  }

  /**
   * Отображает ошибку
   * @param {String} errorMessage - сообщение ошибки
   */
  setError(errorMessage) {
    const errorElement = this.#parent.querySelector('.form__error');

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    const errorElement = this.#parent.querySelector('.form__error');

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Рендеринг формы
   */
  render() {
    this.#parent.innerHTML = template();

    const loginContainer = document.getElementById('form__line_login');
    const passwordContainer = document.getElementById('form__line_password');
    const buttonContainer = document.getElementById('form__line_login_button');

    this.#loginInput = new FormInput(loginContainer, this.#config.inputs.login);
    this.#loginInput.render();

    this.#passwordInput = new FormInput(passwordContainer, this.#config.inputs.password);
    this.#passwordInput.render();

    this.#submitBtn = new Button(buttonContainer, {
      ...this.#config.buttons.submitBtn,
      onSubmit: () => {
        this.validateData();
      },
    });
    this.#submitBtn.render();
  }

  /**
   * Очистка
   */
  remove() {
    this.#loginInput.remove();
    this.#passwordInput.remove();
    this.#submitBtn.remove();
  }
}
