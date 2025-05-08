import throttle from '@modules/throttle';
import template from './searchPage.hbs';
import { SearchRestaurant } from '@myTypes/restaurantTypes';
import { SearchBlock } from '@components/searchBlock/searchBlock';
import { searchRestaurants } from '@modules/ajax';
import { router } from '@modules/routing';

// Константы
const LOAD_COUNT = 4;
const SCROLL_MARGIN = 200;

/**
 * Класс, представляющий список ресторанов.
 */
export default class SearchPage {
  private parent: HTMLElement;
  private restaurantList: SearchRestaurant[];
  private renderedIds: Set<string>;
  private observer: IntersectionObserver;
  private readonly query: string;
  private lastSearchBlockId: number;
  private searchBlocks: SearchBlock[] = [];
  private readonly loadMoreEndThrottle: () => void;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   * @param id
   * @param query
   */
  constructor(parent: HTMLElement, query: string) {
    this.parent = parent;
    this.restaurantList = [];
    this.renderedIds = new Set();
    this.lastSearchBlockId = -1;
    this.query = query;

    this.observer = new IntersectionObserver(
      () => {
        this.loadMoreEndThrottle();
      },
      { rootMargin: `${SCROLL_MARGIN}px` },
    );

    this.loadMoreEndThrottle = throttle(this.loadMoreEnd.bind(this), 500);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLButtonElement | null {
    const element = document.querySelector('.search_page__container');
    if (!element) {
      throw new Error(`Error: can't find restaurantList`);
    }
    return element as HTMLButtonElement;
  }

  /**
   * Рендерит список ресторанов в родительский элемент.
   */
  async render(): Promise<void> {
    if (!this.query) {
      router.goBack();
      return;
    }

    try {
      this.parent.innerHTML = template();

      const lowerSentinel = document.querySelector('.lower-sentinel');
      if (lowerSentinel) this.observer.observe(lowerSentinel);
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  /**
   * Добавляет карточки при прокрутке вниз
   */
  private async loadMoreEnd(): Promise<void> {
    const startCount = this.lastSearchBlockId + 1;
    let endCount = startCount + LOAD_COUNT;

    if (endCount >= this.restaurantList.length) {
      try {
        const newRestaurants: SearchRestaurant[] = await searchRestaurants(
          this.query,
          LOAD_COUNT,
          this.restaurantList.length,
        );

        if (!newRestaurants) {
          this.showNoResults();
          return;
        }

        const uniqueRestaurants = newRestaurants.filter((r) => !this.renderedIds.has(r.id));
        this.restaurantList.push(...uniqueRestaurants);
        uniqueRestaurants.forEach((r) => this.renderedIds.add(r.id));
      } catch {
        this.showNoResults();
      }
    }

    endCount = Math.min(endCount, this.restaurantList.length);

    for (let i = startCount; i < endCount; i++) {
      const searchBlock = new SearchBlock(this.self, this.restaurantList[i]);
      searchBlock.render('beforeend');
      this.searchBlocks.push(searchBlock);
    }

    this.lastSearchBlockId = endCount - 1;
  }

  showNoResults() {
    if (!this.restaurantList.length) {
      const page = this.parent.querySelector('.search_page');
      page.classList.add('no-results');
    }
  }

  /**
   * Удаляет список ресторанов и очищает содержимое родительского элемента.
   */
  remove(): void {
    // Удаление карточек и очистка DOM
    document
      .querySelectorAll('.restaurant__searchBlock')
      .forEach((searchBlock) => searchBlock.remove());

    // Отписка от событий и наблюдателей
    this.observer.disconnect();

    // Сброс всех состояний
    this.restaurantList = [];
    this.renderedIds.clear();
    this.lastSearchBlockId = -1;

    this.searchBlocks.forEach((searchBlock) => searchBlock.remove());
    this.searchBlocks = [];

    this.parent.innerHTML = '';
  }
}
