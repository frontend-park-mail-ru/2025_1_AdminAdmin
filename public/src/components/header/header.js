import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';
import { Logo } from '../logo/logo.js';
import { Button } from '../button/button.js';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  #parent;
  #logo;
  #loginButton;
  #logoutButton;

  /**
   * Создает экземпляр заголовка.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent) {
    this.#parent = parent;

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
    const template = window.Handlebars.templates["header.hbs"];
    const html = template();
    this.#parent.innerHTML = html;
    this.#logo = new Logo(this.self, '/src/assets/logo.png');
    this.#logo.render();
    this.#loginButton = new Button(
      document.querySelector('.header__buttons'),
      {id: 'login_button',
      text: 'Вход',
      onSubmit: () => {router.goToPage('loginPage');}
      },   
    );
    this.#loginButton.render();
    this.#logoutButton = new Button(
      document.querySelector('.header__buttons'), {
        id: 'logout_button',
        text: 'Выход',
        onSubmit: () => {userStore.logout();}
      },
    );
    this.#logoutButton.render();
    this.updateAuthState();
  }


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
    this.#parent.innerHTML = '';
  }
}
