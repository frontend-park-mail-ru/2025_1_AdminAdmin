import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';
import { Logo } from '../logo/logo.js';
import { Button } from '../button/button.js';
import template from './header.hbs';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  #parent;
  #logo;
  #loginButton;
  #logoutButton;
  #handleScrollBound;

  /**
   * Создает экземпляр заголовка.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent) {
    this.#parent = parent;
    this.#handleScrollBound = this.#handleScroll.bind(this);
    userStore.subscribe(() => this.updateAuthState());
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self() {
    return document.querySelector('.header');
  }

  /**
   * Отображает заголовок на странице.
   */
  render() {
    this.#parent.innerHTML = template();
    this.#logo = new Logo(this.self, '/src/assets/logo.png');
    this.#logo.render();
    this.#loginButton = new Button(document.querySelector('.header__buttons'), {
      id: 'login_button',
      text: 'Вход',
      onSubmit: () => {
        router.goToPage('loginPage');
      },
    });
    this.#loginButton.render();
    this.#logoutButton = new Button(document.querySelector('.header__buttons'), {
      id: 'logout_button',
      text: 'Выход',
      onSubmit: () => {
        userStore.logout();
      },
    });
    this.#logoutButton.render();
    this.updateAuthState();

    window.addEventListener('scroll', this.#handleScrollBound);
    this.#handleScroll();
  }

  /**
   * Обработчик события прокрутки страницы.
   * Добавляет или удаляет класс тени в зависимости от прокрутки.
   * @private
   */
  #handleScroll() {
    if (!this.self) return;
    if (window.scrollY > 0) {
      this.self.classList.add('header--scrolled');
    } else {
      this.self.classList.remove('header--scrolled');
    }
  }

  /**
   * Обновляет состояние аутентификации в заголовке.
   * Показывает или скрывает кнопки входа/выхода в зависимости от состояния пользователя.
   */
  updateAuthState() {
    const loginButton = this.#loginButton.self;
    const logoutButton = this.#logoutButton.self;
    const loginContainer = document.querySelector('.header__login');

    if (userStore.isAuth()) {
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'block';

      if (loginContainer) {
        loginContainer.textContent = userStore.getState().login || '';
      }
    } else {
      if (loginButton) loginButton.style.display = 'block';
      if (logoutButton) logoutButton.style.display = 'none';

      if (loginContainer) {
        loginContainer.textContent = '';
      }
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove() {
    this.#logo.remove();
    this.#loginButton.remove();
    this.#logoutButton.remove();
    this.#parent.innerHTML = '';
    window.removeEventListener('scroll', this.#handleScrollBound);
  }
}
