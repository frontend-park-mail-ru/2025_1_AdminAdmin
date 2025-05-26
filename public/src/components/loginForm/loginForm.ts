import { userStore } from '@store/userStore';
import { FormInput } from 'doordashers-ui-kit';
import { Button } from 'doordashers-ui-kit';
import { OTPInput } from '@components/OTPInput/OTPInput';
import template from './loginForm.hbs';
import { toasts } from 'doordashers-ui-kit';
import LoginFormConfig from './loginFormConfig';

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
  private parent: HTMLElement;
  private OTPInput: OTPInput;
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
      const result = await userStore.login({ login, password });

      if (typeof result === 'boolean') {
        this.handle2FA();
        this.submitBtn.enable();
        return;
      }

      toasts.success('Вы успешно вошли в систему!');
    } catch (err) {
      const errorMessage = err.message || 'Неверный логин или пароль';
      this.setError(errorMessage);
      toasts.error(errorMessage);
      this.submitBtn.enable();
    }
  }

  sendOTPCode = async () => {
    this.clearError();

    if (!this.OTPInput) {
      return;
    }

    const code = this.OTPInput.getValue();
    const OTPInputIsValid = code.length === 6;
    if (!OTPInputIsValid) {
      this.setError('Неверный OTP код');
      return;
    }

    const login = this.loginInput.value.trim();
    const password = this.passwordInput.value;
    this.submitBtn.disable();

    try {
      await userStore.OTPLogin({ login, password, code });
      toasts.success('Вы успешно вошли в систему!');
    } catch (err) {
      const errorMessage = err.message || 'Неверный OTP код';
      this.setError(errorMessage);
      toasts.error(errorMessage);
      this.submitBtn.enable();
    }
  };

  handle2FA() {
    const otpElement: HTMLDivElement = this.parent.querySelector('.login-form__otp-code');
    otpElement.style.display = 'flex';

    const otpContainer: HTMLDivElement = this.parent.querySelector('.login-form__otp-code__body');
    this.OTPInput = new OTPInput(otpContainer, {
      id: 'login-form-otp-input',
      digits: 6,
    });

    this.OTPInput.render();

    this.loginInput.disable();
    this.passwordInput.disable();

    this.submitBtn.setText('Подтверить');
    this.submitBtn.setOnSubmit(this.sendOTPCode);
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
        onSubmit: async () => {
          await this.validateData();
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
    this.OTPInput?.remove();
  }
}
