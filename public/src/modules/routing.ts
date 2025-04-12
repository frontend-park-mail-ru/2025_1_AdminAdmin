import RestaurantList from '@pages/restaurantList/restaurantList';
import RestaurantPage from '@pages/restaurantPage/restaurantPage';
import Header from '@components/header/header';
import auxHeader from '@components/auxHeader/auxHeader';
import { AuthPage } from '@pages/authPage/authPage';
import { userStore } from '@store/userStore';
import NotFoundPage from '@pages/404/404';
import ProfilePage from '@pages/profilePage/profilePage';
import OrderPage from '@pages/orderPage/orderPage';

interface RouteConfig {
  href: string;
  class: new (...args: any[]) => any;
  header: new (parent: HTMLElement) => any;
  options?: boolean;
}

/**
 * Класс для управления маршрутизацией в приложении.
 */
class Router {
  private parent: HTMLElement;
  private readonly headerElement: HTMLElement;
  private readonly pageElement: HTMLElement;
  private readonly toastBoxElement: HTMLElement;
  private currentHeader: Header | auxHeader | null = null;
  private currentPage: RestaurantList | RestaurantPage | AuthPage | null = null;
  private currentId: string | null = null;
  private readonly routes: Record<string, RouteConfig>;

  /**
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться контент.
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.headerElement = document.createElement('div');
    this.headerElement.classList.add('header');
    this.pageElement = document.createElement('main');
    this.toastBoxElement = document.createElement('div');
    this.toastBoxElement.classList.add('toastBox');
    this.parent.appendChild(this.headerElement);
    this.parent.appendChild(this.pageElement);
    this.parent.appendChild(this.toastBoxElement);
    this.routes = {
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
      profilePage: {
        href: '/profile',
        class: ProfilePage,
        header: Header,
        options: false,
      },
      orderPage: {
        href: '/order',
        class: OrderPage,
        header: auxHeader,
        options: false,
      },
      notFound: {
        href: '/404',
        class: NotFoundPage,
        header: auxHeader,
      },
    };

    userStore.checkUser();
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
    this.handleRouteChange();
  }
  /**
   * Обработчик изменения маршрута.
   * Определяет текущий путь и перенаправляет на соответствующую страницу.
   * @private
   */
  private handleRouteChange(): void {
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      this.goToPage('home', null, false);
      return;
    }
    for (const [page, { href }] of Object.entries(this.routes).slice(1)) {
      if (currentPath.startsWith(href)) {
        const id = currentPath.split('/')[2] || null;
        this.goToPage(page, id, false);
        return;
      }
    }

    this.goToPage('notFound', null, false);
  }
  /**
   * Переход на указанную страницу.
   * @param {string} page - Имя страницы, указанное в `routes`.
   * @param {string | null} [id=null] - Идентификатор ресурса, если требуется.
   * @param {boolean} [shouldPushState=true] - Нужно ли обновлять `history.pushState`.
   */
  goToPage(page: string, id: string | null = null, shouldPushState = true): void {
    const pageData = this.routes[page];
    if (!pageData) {
      console.error(`Page "${page}" not found in routes.`);
      return;
    }

    if (!(this.currentHeader instanceof pageData.header)) {
      this.currentHeader?.remove();
      this.currentHeader = new pageData.header(this.headerElement);
      this.currentHeader.render();
    }

    if (shouldPushState) {
      const newPath = id ? `${pageData.href}${id}` : pageData.href;
      if (window.location.pathname === newPath) {
        return;
      }
      history.pushState(id ? { id } : {}, '', newPath);
    }

    if (!(this.currentPage instanceof pageData.class) || (id && this.currentId !== id)) {
      this.currentPage?.remove();
      this.currentPage = new pageData.class(this.pageElement, id);
      this.currentId = id;
    }

    this.currentPage.render(pageData.options);
  }

  /**
   * Удаляет обработчики событий и очищает содержимое контейнера.
   */
  destroy(): void {
    window.removeEventListener('popstate', this.handleRouteChange);
    this.parent.innerHTML = '';
  }
}
/** @type {Router | null} */
let router: Router | null = null;
/**
 * Инициализирует маршрутизацию.
 * @param {HTMLElement} parent - Родительский элемент, в который будет встраиваться приложение.
 * @returns {Router} - Экземпляр класса `Router`.
 */
export function initRouting(parent: HTMLElement): Router {
  if (!router) {
    router = new Router(parent);
  }
  return router;
}
export { router };
