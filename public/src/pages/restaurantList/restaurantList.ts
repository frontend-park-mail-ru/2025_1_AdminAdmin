import { AppRestaurantRequests } from '@modules/ajax';
import { RestaurantCard } from '@components/restaurantCard/restaurantCard';
import throttle from '@modules/throttle';
import template from './restaurantList.hbs';
import { BaseRestaurant } from '@myTypes/restaurantTypes';

// Константы
const LOAD_COUNT = 16;
const SCROLL_MARGIN = 100;
const REMOVE_THRESHOLD = 4;
const SCROLL_THRESHOLD = 2;

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  private parent: HTMLElement;
  private restaurantList: BaseRestaurant[];
  private renderedIds: Set<string>;
  private observer: IntersectionObserver;
  private firstCardId: number;
  private lastCardId: number;
  private _deletionScheduled: boolean;
  private readonly loadMoreEndThrottle: () => void;
  private readonly deleteFromDomThrottle: () => void;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.restaurantList = [];
    this.renderedIds = new Set();
    this.firstCardId = -1;
    this.lastCardId = -1;
    this._deletionScheduled = false;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('upper-sentinel')) {
              this.loadMoreBeg();
            } else if (entry.target.classList.contains('lower-sentinel')) {
              this.loadMoreEndThrottle();
            }
          }
        });
      },
      { rootMargin: `${SCROLL_MARGIN}px` },
    );

    this.loadMoreEndThrottle = throttle(this.loadMoreEnd.bind(this), 500);
    this.deleteFromDomThrottle = throttle(this.deleteFromDom.bind(this), 10);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLButtonElement | null {
    const element = document.querySelector('.restaurant__container');
    if (!element) {
      throw new Error(`Error: can't find restaurantList`);
    }
    return element as HTMLButtonElement;
  }

  /**
   * Рендерит список ресторанов в родительский элемент.
   */
  async render(): Promise<void> {
    try {
      this.parent.innerHTML = template();

      await this.loadMoreEnd();

      const lowerSentinel = document.querySelector('.lower-sentinel');
      if (lowerSentinel) this.observer.observe(lowerSentinel);

      const upperSentinel = document.querySelector('.upper-sentinel');
      if (upperSentinel) this.observer.observe(upperSentinel);

      document.addEventListener('scroll', this.deleteFromDomThrottle);
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  /**
   * Добавляет карточки при прокрутке вверх
   */
  private loadMoreBeg(): void {
    const begCount = Math.max(this.firstCardId - LOAD_COUNT, 0);
    for (let i = this.firstCardId - 1; i >= begCount; i--) {
      const card = new RestaurantCard(this.self, this.restaurantList[i]);
      card.render('afterbegin');
    }

    this.firstCardId = begCount;
  }

  /**
   * Добавляет карточки при прокрутке вниз
   */
  private async loadMoreEnd(): Promise<void> {
    const startCount = this.lastCardId + 1;
    let endCount = startCount + LOAD_COUNT;

    if (endCount >= this.restaurantList.length) {
      try {
        const newRestaurants: BaseRestaurant[] = await AppRestaurantRequests.GetAll({
          count: `${LOAD_COUNT}`,
          offset: startCount.toString(),
        });

        if (!newRestaurants) return;

        const uniqueRestaurants = newRestaurants.filter((r) => !this.renderedIds.has(r.id));
        this.restaurantList.push(...uniqueRestaurants);
        uniqueRestaurants.forEach((r) => this.renderedIds.add(r.id));
      } catch (err) {
        console.error(err);
      }
    }

    endCount = Math.min(endCount, this.restaurantList.length);

    for (let i = startCount; i < endCount; i++) {
      const card = new RestaurantCard(this.self, this.restaurantList[i]);
      card.render('beforeend');
    }

    this.lastCardId = endCount - 1;
  }

  /**
   * Удаляет лишние карточки из DOM-а
   */
  private deleteFromDom = (): void => {
    if (this._deletionScheduled) return;
    this._deletionScheduled = true;

    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.restaurant__card');
      if (cards.length < REMOVE_THRESHOLD) {
        this._deletionScheduled = false;
        return;
      }

      const firstFour = Array.from(cards).slice(0, REMOVE_THRESHOLD);
      if (firstFour[0].getBoundingClientRect().bottom < -window.innerHeight * SCROLL_THRESHOLD) {
        firstFour.forEach((card) => card.remove());
        this.firstCardId += firstFour.length;
      }

      const lastFour = Array.from(cards).slice(-REMOVE_THRESHOLD);
      if (lastFour[0].getBoundingClientRect().top > window.innerHeight * SCROLL_THRESHOLD) {
        lastFour.forEach((card) => card.remove());
        this.lastCardId -= lastFour.length;
      }

      this._deletionScheduled = false;
    });
  };

  /**
   * Удаляет список ресторанов и очищает содержимое родительского элемента.
   */
  remove(): void {
    // Удаление карточек и очистка DOM
    document.querySelectorAll('.restaurant__card').forEach((card) => card.remove());
    this.parent.innerHTML = '';

    // Отписка от событий и наблюдателей
    document.removeEventListener('scroll', this.deleteFromDomThrottle);
    this.observer.disconnect();

    // Сброс всех состояний
    this.restaurantList = [];
    this.renderedIds.clear();
    this.firstCardId = -1;
    this.lastCardId = -1;
    this._deletionScheduled = false;
  }
}
