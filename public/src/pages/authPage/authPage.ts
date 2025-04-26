import LoginForm from '@components/loginForm/loginForm';
import RegisterForm from '@components/unifiedForm/unifiedForm';
import { router } from '@modules/routing';
import template from './authPage.hbs';
import { userStore } from '@store/userStore';
import { Slider, SliderProps } from '@//components/slider/slider';

/**
 * Класс страницы авторизации
 */
export class AuthPage {
  private loginForm?: LoginForm;
  private registerForm?: RegisterForm;
  private parent: HTMLElement;
  //private loginButton?: Button;
  //private registerButton?: Button;
  private slider: Slider;

  private unsubscribeFromUserStore: (() => void) | null = null;
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
    this.unsubscribeFromUserStore = userStore.subscribe(() => this.updateAuthState());
  }

  /**
   * Отображает страницу авторизации.
   */
  render = (isLoginPage: boolean): void => {
    if (!this.slider) {
      this.parent.innerHTML = template();

      const formLine = this.parent.querySelector(this.formLineSelector) as HTMLElement;

      const sliderProps: SliderProps = {
        id: 'auth-page__slider',
        buttonsProps: [
          {
            id: 'form__tab_login',
            text: 'Вход',
            onSubmit: this.toggleLoginForm,
          },
          {
            id: 'form__tab_register',
            text: 'Регистрация',
            onSubmit: this.toggleRegisterForm,
          },
        ],
        activeButtonIndex: 0,
      };
      this.slider = new Slider(formLine, sliderProps);
      this.slider.render();
    }
    /*
    if (!this.registerButton) {
      this.parent.innerHTML = template();

      const formLine = this.parent.querySelector(this.formLineSelector) as HTMLElement;

      this.registerButton = new Button(formLine, {
        id: 'form__tab_register',
        text: 'Регистрация',
        style: 'form__button',
        onSubmit: this.toggleRegisterForm,
      });
      this.registerButton.render();

      this.loginButton = new Button(formLine, {
        id: 'form__tab_login',
        text: 'Вход',
        style: 'form__button',
        onSubmit: this.toggleLoginForm,
      });
      this.loginButton.render();
    }
    */

    if (isLoginPage) this.renderLoginForm();
    else this.renderRegisterForm();
  };

  /**
   * Отображение формы входа
   */
  renderLoginForm = (): void => {
    this.toggleForms(true);
    if (!this.loginForm) {
      this.loginForm = new LoginForm(
        this.parent.querySelector(this.loginFormSelector) as HTMLElement,
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
        false,
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

    loginFormElement.style.display = isLogin ? 'flex' : 'none';
    registerFormElement.style.display = isLogin ? 'none' : 'flex';
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
    if (this.unsubscribeFromUserStore) {
      this.unsubscribeFromUserStore();
      this.unsubscribeFromUserStore = null;
    }

    this.loginForm?.remove();
    this.registerForm?.remove();
    //this.loginButton?.remove();
    //this.registerButton?.remove();
    this.slider.remove();
    this.parent.innerHTML = '';
  }
}
