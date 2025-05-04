import RestaurantList from '@pages/restaurantList/restaurantList';
import RestaurantPage from '@pages/restaurantPage/restaurantPage';
import Header from '@components/header/header';
import auxHeader from '@components/auxHeader/auxHeader';
import { AuthPage } from '@pages/authPage/authPage';
import NotFoundPage from '@pages/404/404';
import ProfilePage from '@pages/profilePage/profilePage';
import OrderPage from '@pages/orderPage/orderPage';
import SearchPage from '@pages/searchPage/searchPage';

interface RouteConfig {
  href: string;
  class: new (...args: any[]) => any;
  header: new (parent: HTMLElement) => any;
  searchAll?: boolean;
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
  private currentQuery: string | null = null;
  private readonly routes: Record<string, RouteConfig>;
  private historyStack: { pageClass: string; path: string }[] = [];

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
        searchAll: true,
      },
      restaurantPage: {
        href: '/restaurants/',
        class: RestaurantPage,
        header: Header,
        searchAll: false,
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
        header: auxHeader,
      },
      orderPage: {
        href: '/order',
        class: OrderPage,
        header: auxHeader,
      },
      searchPage: {
        href: '/search',
        class: SearchPage,
        header: Header,
        searchAll: true,
      },
      notFound: {
        href: '/404',
        class: NotFoundPage,
        header: auxHeader,
      },
    };

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
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query');

    if (currentPath === '/') {
      this.goToPage('home', null, query, false);
      return;
    }

    for (const [page, { href }] of Object.entries(this.routes).slice(1)) {
      if (currentPath.startsWith(href)) {
        const id = currentPath.split('/')[2] || null;
        this.goToPage(page, id, query, false);
        return;
      }
    }

    this.goToPage('notFound', null, null, false);
  }

  goToPage(
    page: string,
    id: string | null = null,
    query: string | null = null,
    shouldPushState = true,
  ): void {
    window.scrollTo(0, 0);
    const pageData = this.routes[page];
    if (!pageData) {
      return this.handleMissingRoute(page);
    }

    this.updateHeader(pageData, query);
    this.updateHistory(pageData, id, query, shouldPushState);
    this.updatePage(pageData, id, query);
  }

  private handleMissingRoute(page: string): void {
    console.error(`Page "${page}" not found in routes.`);
  }

  private updateHeader(pageData: RouteConfig, query: string | null = null): void {
    if (!(this.currentHeader instanceof pageData.header)) {
      this.currentHeader?.remove();
      this.currentHeader = new pageData.header(this.headerElement);
      this.currentHeader.render();
    }

    if (this.currentHeader instanceof Header) {
      this.currentHeader.setQuery(query);
      this.currentHeader.updateHeader(pageData.searchAll);
    }
  }

  private updateHistory(
    pageData: RouteConfig,
    id: string | null,
    query: string | null = null,
    shouldPush: boolean,
  ): void {
    if (!shouldPush) return;

    const newPath = id ? `${pageData.href}${id}` : pageData.href;
    const fullNewPath = query ? `${newPath}?query=${encodeURIComponent(query)}` : newPath;

    const currentFullPath = window.location.pathname + window.location.search;

    if (currentFullPath !== fullNewPath) {
      this.historyStack.push({
        pageClass: this.currentPage?.constructor.name || '',
        path: currentFullPath,
      });
      history.pushState({}, '', fullNewPath);
    }
  }

  private updatePage(pageData: RouteConfig, id: string | null, query: string | null = null): void {
    if (this.pageChanged(pageData, id, query)) {
      this.removeCurrentPage();
      this.createNewPage(pageData, id, query);
      this.currentId = id;
      this.currentQuery = query;
      this.updateHeaderIfNeeded(pageData);
      this.currentPage.render(pageData.options);
      return;
    }

    if (this.currentPage instanceof AuthPage) {
      this.currentPage.render(pageData.options);
    }
  }

  private pageChanged(pageData: RouteConfig, id: string | null, query: string | null): boolean {
    return (
      !(this.currentPage instanceof pageData.class) ||
      (id && this.currentId !== id) ||
      (query && this.currentQuery !== query)
    );
  }

  private removeCurrentPage(): void {
    this.currentPage?.remove();
  }

  private createNewPage(pageData: RouteConfig, id: string | null, query: string | null): void {
    if (id && query) {
      this.currentPage = new pageData.class(this.pageElement, id, query);
    } else if (id && !query) {
      this.currentPage = new pageData.class(this.pageElement, id);
    } else {
      this.currentPage = new pageData.class(this.pageElement, query);
    }
  }

  private updateHeaderIfNeeded(pageData: RouteConfig): void {
    if (this.currentHeader instanceof Header) {
      this.currentHeader.updateHeader(pageData.searchAll);
    }
  }

  /**
   * Возврат на предыдущую страницу.
   */
  goBack(): void {
    if (this.currentPage instanceof NotFoundPage) {
      this.goToPage('home');
      return;
    }

    while (this.historyStack.length > 0) {
      const previous = this.historyStack.pop();
      if (!previous) break;

      const isAuthPage = this.currentPage instanceof AuthPage;
      const wasAuthPage = previous.pageClass === 'AuthPage';

      if (!(isAuthPage && wasAuthPage)) {
        history.pushState({}, '', previous.path);
        this.handleRouteChange();
        return;
      }
    }

    this.goToPage('home');
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
