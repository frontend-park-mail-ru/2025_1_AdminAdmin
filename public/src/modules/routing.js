import RestaurantList from '../pages/restaurantList/restaurantList.js';
import RestaurantPage from '../pages/restaurantPage/restaurantPage.js';
import Header from '../../src/components/header/header.js';
import auxHeader from '../components/auxHeader/auxHeader.js';
import { AuthPage } from '../pages/authPage/authPage.js';
import { userStore } from '../store/userStore.js';

/**
 * Класс для управления маршрутизацией в приложении.
 */
class Router {
  /** @type {HTMLElement} */
  #parent;
  /** @type {HTMLElement} */
  #headerElement;
  /** @type {HTMLElement} */
  #pageElement;
  /** @type {Header | auxHeader | null} */
  #currentHeader = null;
  /** @type {RestaurantList | RestaurantPage | AuthPage | null} */
  #currentPage = null;
  /** @type {Object.<string, { href: string, class: any, header: any, options?: any }>} */
  #routes;

  /**
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться контент.
   */
  constructor(parent) {
    this.#parent = parent;

    this.#headerElement = document.createElement('header-container');
    this.#pageElement = document.createElement('main');
    this.#pageElement.style.paddingTop = '50px';

    this.#parent.appendChild(this.#headerElement);
    this.#parent.appendChild(this.#pageElement);

    this.#routes = {
      home: {
        href: '/',
        class: RestaurantList,
        header: Header,
      },
      restaurantPage: {
        href: '/restaurants/',
        class: RestaurantPage,
        header: Header,
      },
      loginPage: {
        href: '/login',
        class: AuthPage,
        header: auxHeader,
        options: true,
      },
      registerPage: {
        href: '/register',
        class: AuthPage,
        header: auxHeader,
        options: false,
      },
    };

    userStore.checkUser();
    window.addEventListener('popstate', this.#handleRouteChange.bind(this));
    this.#handleRouteChange();
  }

  /**
   * Обработчик изменения маршрута.
   * Определяет текущий путь и перенаправляет на соответствующую страницу.
   * @private
   */
  #handleRouteChange() {
    const currentPath = window.location.pathname;

    if (currentPath === '/') {
      this.goToPage('home', null, false);
      return;
    }

    for (const [page, { href }] of Object.entries(this.#routes).slice(1)) {
      if (currentPath.startsWith(href)) {
        const id = currentPath.split('/')[2] || null;
        this.goToPage(page, id, false);
        return;
      }
    }
  }

  /**
   * Переход на указанную страницу.
   * @param {string} page - Имя страницы, указанное в `#routes`.
   * @param {string | null} [id=null] - Идентификатор ресурса, если требуется.
   * @param {boolean} [shouldPushState=true] - Нужно ли обновлять `history.pushState`.
   */
  goToPage(page, id = null, shouldPushState = true) {
    const pageData = this.#routes[page];

    if (!(this.#currentHeader instanceof pageData.header)) {
      this.#currentHeader?.remove();
      this.#currentHeader = new pageData.header(this.#headerElement);
      this.#currentHeader.render();
    }

    if (shouldPushState) {
      const newPath = id ? `${pageData.href}${id}` : pageData.href;
      history.pushState(id ? { id } : {}, '', newPath);
    }

    if (!(this.#currentPage instanceof pageData.class)) {
      this.#currentPage?.remove();
      this.#currentPage = new pageData.class(this.#pageElement, id);
    }

    this.#currentPage.render(pageData.options);
  }

  /**
   * Удаляет обработчики событий и очищает содержимое контейнера.
   */
  destroy() {
    window.removeEventListener('popstate', this.#handleRouteChange);
    this.#parent.innerHTML = '';
  }
}

/** @type {Router | null} */
let router = null;

/**
 * Инициализирует маршрутизацию.
 * @param {HTMLElement} parent - Родительский элемент, в который будет встраиваться приложение.
 * @returns {Router} - Экземпляр класса `Router`.
 */
export function initRouting(parent) {
  if (!router) {
    router = new Router(parent);
  }
  return router;
}

export { router };
