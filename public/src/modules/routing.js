import RestaurantList from '../pages/restaurantList/restaurantList.js';
import RestaurantPage from '../pages/restaurantPage/restaurantPage.js';
import LoginPage from '../pages/loginPage/loginPage.js';
import RegisterPage from '../pages/registerPage/registerPage.js';
import Header from '../../src/components/header/header.js';
import auxHeader from '../components/auxHeader/auxHeader.js';

class Router {
  #parent;
  #headerElement;
  #pageElement;
  #currentHeader = null;
  #currentPage = null;
  #routes;

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

    window.addEventListener('popstate', this.#handleRouteChange.bind(this));
    this.#handleRouteChange();
  }

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

  destroy() {
    window.removeEventListener('popstate', this.#handleRouteChange);
    this.#parent.innerHTML = '';
  }
}

let router = null;

export function initRouting(parent) {
  if (!router) {
    router = new Router(parent);
  }
  return router;
}

export { router };
