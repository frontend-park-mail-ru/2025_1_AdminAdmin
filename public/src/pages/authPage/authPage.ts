import { Button } from '../../components/button/button';
import config from './authPageConfig';
import LoginForm from '../../components/loginForm/loginForm';
import RegisterForm from '../../components/registerForm/registerForm';
import { router } from '../../modules/routing';
import template from './authPage.hbs';
import { userStore } from '../../store/userStore';

/**
 * Класс страницы авторизации
 */
export class AuthPage {
  private loginForm?: LoginForm;
  private registerForm?: RegisterForm;
  private parent: HTMLElement;
  private loginButton?: Button;
  private registerButton?: Button;

  private readonly loginFormSelector = '.authPage__login';
  private readonly registerFormSelector = '.authPage__register';
  private readonly formLineSelector = '.authPage__line';

  /**
   * Создает экземпляр страницы авторизации.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться страница авторизации
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    userStore.subscribe(() => this.updateAuthState());
  }

  /**
   * Отображает страницу авторизации.
   */
  render = (isLoginPage: boolean): void => {
    if (!this.registerButton) {
      this.parent.innerHTML = template();

      const formLine = this.parent.querySelector(this.formLineSelector) as HTMLElement;

      this.registerButton = new Button(formLine, {
        ...config.buttons.register,
        onSubmit: this.toggleRegisterForm,
      });
      this.registerButton.render();

      this.loginButton = new Button(formLine, {
        ...config.buttons.login,
        onSubmit: this.toggleLoginForm,
      });
      this.loginButton.render();
    }

    isLoginPage ? this.renderLoginForm() : this.renderRegisterForm();
  };

  /**
   * Отображение формы входа
   */
  renderLoginForm = (): void => {
    this.toggleForms(true);
    if (!this.loginForm) {
      this.loginForm = new LoginForm(
        this.parent.querySelector(this.loginFormSelector) as HTMLElement,
        config.forms.login,
      );
      this.loginForm.render();
    }
  };

  /**
   * Отображение формы регистрации
   */
  renderRegisterForm = (): void => {
    this.toggleForms(false);
    if (!this.registerForm) {
      this.registerForm = new RegisterForm(
        this.parent.querySelector(this.registerFormSelector) as HTMLElement,
        config.forms.register,
      );
      this.registerForm.render();
    }
  };

  /**
   * Переключение между формами
   * @param isLogin - Если true, показывается форма входа, иначе — регистрации.
   */
  private toggleForms(isLogin: boolean): void {
    const loginFormElement = this.parent.querySelector(this.loginFormSelector) as HTMLElement;
    const registerFormElement = this.parent.querySelector(this.registerFormSelector) as HTMLElement;

    loginFormElement.style.display = isLogin ? 'contents' : 'none';
    registerFormElement.style.display = isLogin ? 'none' : 'contents';

    this.loginButton?.toggleClass(
      isLogin ? 'button_inactive' : 'button_active',
      isLogin ? 'button_active' : 'button_inactive',
    );
    this.registerButton?.toggleClass(
      isLogin ? 'button_active' : 'button_inactive',
      isLogin ? 'button_inactive' : 'button_active',
    );
  }

  /**
   * Переход на страницу входа
   */
  toggleLoginForm = (): void => {
    router.goToPage('loginPage');
  };

  /**
   * Переход на страницу регистрации
   */
  toggleRegisterForm = (): void => {
    router.goToPage('registerPage');
  };

  private updateAuthState(): void {
    if (userStore.isAuth()) {
      router.goToPage('home');
    }
  }

  /**
   * Удаляет страницу и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.loginForm?.remove();
    this.registerForm?.remove();
    this.loginButton?.remove();
    this.registerButton?.remove();
    this.parent.innerHTML = '';
  }
}
