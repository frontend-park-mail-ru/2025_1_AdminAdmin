import { userStore } from '@store/userStore';
import { FormInput } from '@components/formInput/formInput';
import { Button } from '@components//button/button';
import template from './loginForm.hbs';
import { toasts } from '@modules/toasts';
import LoginFormConfig from './loginFormConfig';

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
  private parent: HTMLElement;

  private loginInput: FormInput;
  private passwordInput: FormInput;
  private submitBtn: Button;

  /**
   * Конструктор класса
   * @constructor
   * @param parent {HTMLElement} - родительский элемент
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
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
    this.submitBtn.disable();

    try {
      await userStore.login({ login, password });
      toasts.success('Вы успешно вошли в систему!');
    } catch (err) {
      const errorMessage = err.error || 'Неверный логин или пароль';
      this.setError(errorMessage);
      toasts.error(errorMessage);
      this.submitBtn.enable();
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

    const loginContainer = document.getElementById('form__line_login');
    const passwordContainer = document.getElementById('form__line_password');
    const buttonContainer = document.getElementById('form__line_login_button_container');

    if (loginContainer && passwordContainer && buttonContainer) {
      this.loginInput = new FormInput(loginContainer, LoginFormConfig.inputs.login);
      this.loginInput.render();

      this.passwordInput = new FormInput(passwordContainer, LoginFormConfig.inputs.password);
      this.passwordInput.render();

      this.submitBtn = new Button(buttonContainer, {
        ...LoginFormConfig.buttons.submitBtn,
        onSubmit: () => {
          this.validateData();
        },
      });
      this.submitBtn.render();
    } else {
      console.error('Missing required DOM elements');
    }
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
