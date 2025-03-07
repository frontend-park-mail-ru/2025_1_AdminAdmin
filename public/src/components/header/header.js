import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';
import { logo } from '../logo/logo.js';
import { button } from '../button/button.js';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  #parent;
  //#template;
  //#clickHandler;
  #logo;
  #loginButton;
  #logoutButton;

  /**
   * Создает экземпляр заголовка.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent) {
    this.#parent = parent;
    //this.#template = Handlebars.templates['header.hbs'];
    //this.#clickHandler = this.#handleClick.bind(this);

    // Подписываемся на изменения состояния пользователя
    userStore.subscribe(() => this.updateAuthState());
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.header');
  }

  /**
   * Отображает заголовок на странице.
   */
  render() {
    //this.#parent.innerHTML = this.#template();
    const template = window.Handlebars.templates["header.hbs"];
    const html = template();
    this.#parent.innerHTML = html;
    this.#logo = new logo(this.self, '/src/assets/logo.png');
    this.#logo.render();
    this.#loginButton = new button(
      document.querySelector('.header__buttons'),
      {id: 'login_button',
      text: 'Вход',
      onSubmit: () => {router.goToPage('loginPage');} // Переход на страницу логина
      },   
    );
    this.#loginButton.render();
    this.#logoutButton = new button(
      document.querySelector('.header__buttons'), {
        id: 'logout_button',
        text: 'Выход',
        onSubmit: () => {userStore.logout();},   // Переход на страницу регистрации
      },
    );
    this.#logoutButton.render();
    //this.#addEventListeners();
    this.updateAuthState();
  }

  /**
   * Добавляет обработчики событий.
   * @private
   */
  /*
  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }
  */

  /**
   * Обрабатывает клики по элементам заголовка.
   * Перенаправляет пользователя на соответствующие страницы или выполняет выход.
   * @param {Event} event - Событие клика.
   * @private
   */
  /*
  #handleClick(event) {
    const loginButton = event.target.closest('.login-button');
    const logoutButton = event.target.closest('.logout-button');

    if (loginButton) {
      router.goToPage('loginPage');
    }

    if (logoutButton) {
      userStore.logout();
    }
  }
  */

  /**
   * Обновляет состояние аутентификации в заголовке.
   * Показывает или скрывает кнопки входа/выхода в зависимости от состояния пользователя.
   */
  updateAuthState() {
    
    const loginButton = this.#loginButton.self;
    const logoutButton = this.#logoutButton.self;

    if (userStore.isAuth()) {
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'block';
    } else {
      if (loginButton) loginButton.style.display = 'block';
      if (logoutButton) logoutButton.style.display = 'none';
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove() {
    //document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
