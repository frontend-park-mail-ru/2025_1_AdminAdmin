import RestaurantList from '../pages/restaurantList/restaurantList.js';
import RestaurantPage from '../pages/restaurantPage/restaurantPage.js';
import LoginPage from '../pages/loginPage/loginPage.js';
import RegisterPage from '../pages/registerPage/registerPage.js';
import Header from '../../src/components/header/header.js';
import auxHeader from '../components/auxHeader/auxHeader.js';

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
  /** @type {RestaurantList | RestaurantPage | LoginPage | RegisterPage | null} */
  #currentPage = null;
  /** @type {Object.<string, { href: string, class: any, header: any }>} */
  #routes;

  /**
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться контент.
   */
  constructor(parent) {
    this.#parent = parent;

    this.#headerElement = document.createElement('header');
    this.#pageElement = document.createElement('main');

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
        class: LoginPage,
        header: auxHeader,
      },
      registerPage: {
        href: '/register',
        class: RegisterPage,
        header: auxHeader,
      },
    };

    window.addEventListener('popstate', this.#handleRouteChange);
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
    if (!(this.#currentHeader instanceof this.#routes[page].header)) {
      this.#currentHeader?.remove();
      this.#currentHeader = new this.#routes[page].header(this.#headerElement);
      this.#currentHeader.render();
    }

    if (shouldPushState) {
      const newPath = id ? `${this.#routes[page].href}${id}` : this.#routes[page].href;
      history.pushState(id ? { id } : {}, '', newPath);
    }

    this.#currentPage?.remove();
    this.#currentPage = new this.#routes[page].class(this.#pageElement, id);
    this.#currentPage.render();
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
