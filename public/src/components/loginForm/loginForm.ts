import { router } from '../../modules/routing';
import { userStore } from '../../store/userStore';
import { FormInput } from '../formInput/formInput';
import { Button } from '../button/button';
import template from './loginForm.hbs';
import { toasts } from '../../modules/toasts';

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
  private parent: HTMLElement;
  private config: any;

  private loginInput: FormInput;
  private passwordInput: FormInput;
  private submitBtn: Button;

  /**
   * Конструктор класса
   * @constructor
   * @param parent {HTMLElement} - родительский элемент
   * @param config {Object} - пропсы
   */
  constructor(parent: HTMLElement, config: any) {
    this.parent = parent;
    this.config = config;
  }

  /**
   * Получение HTML элемента формы
   * @returns {HTMLElement | null}
   */
  get self(): HTMLElement | null {
    return document.getElementById(this.config.id);
  }

  /**
   * Валидация данных
   */
  async validateData() {
    const isLoginValid = this.loginInput.checkValue();
    const isPasswordValid = this.passwordInput.checkValue();

    if (!(isLoginValid && isPasswordValid)) {
      return;
    }

    const login = this.loginInput.value.trim();
    const password = this.passwordInput.value;

    try {
      await userStore.login({ login, password });
      toasts.success('Вы успешно вошли в систему!');
    } catch (err) {
      const errorMessage = err.message || 'Неверный логин или пароль';
      this.setError(errorMessage);
      toasts.error(errorMessage);
    }
  }

  /**
   * Отображает ошибку
   * @param {String} errorMessage - сообщение ошибки
   */
  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Рендеринг формы
   */
  render() {
    this.parent.innerHTML = template();

    const loginContainer = document.getElementById('form__line_login')!;
    const passwordContainer = document.getElementById('form__line_password')!;
    const buttonContainer = document.getElementById('form__line_login_button')!;

    this.loginInput = new FormInput(loginContainer, this.config.inputs.login);
    this.loginInput.render();

    this.passwordInput = new FormInput(passwordContainer, this.config.inputs.password);
    this.passwordInput.render();

    this.submitBtn = new Button(buttonContainer, {
      ...this.config.buttons.submitBtn,
      onSubmit: () => {
        this.validateData();
      },
    });
    this.submitBtn.render();
  }

  /**
   * Очистка
   */
  remove() {
    this.loginInput.remove();
    this.passwordInput.remove();
    this.submitBtn.remove();
  }
}
