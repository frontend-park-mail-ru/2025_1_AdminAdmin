import { AppRestaurantRequests } from '@modules/ajax';
import { RestaurantCard } from '@components/restaurantCard/restaurantCard';
import throttle from '@modules/throttle';
import template from './restaurantList.hbs';
import { BaseRestaurant } from '@myTypes/restaurantTypes';
import { Carousel } from '@components/productsCarousel/productsCarousel';
import { PromotionCard } from '@components/promotionCard/promotionCard';

// Константы
const LOAD_COUNT = 16;
const SCROLL_MARGIN = 100;
const SCROLL_THRESHOLD = 2;
const REMOVE_THRESHOLD = 4;

const promotions = [
  {
    text: 'Мы открылись!',
    colorStart: '#FF4D00',
    colorEnd: '#FF9366',
  },
  {
    text: 'Получайте промокоды',
    colorStart: '#4D9EFF',
    colorEnd: '#90C5FF',
    subText: 'с каждым заказом',
  },
  {
    text: 'Бесплатная доставка',
    colorStart: '#FF4C4C',
    colorEnd: '#FF9E9E',
    subText: 'из всех ресторанов',
  },
  {
    text: 'Экспресс-доставка',
    colorStart: '#ffa43b',
    colorEnd: '#fdea35',
    subText: 'для всех',
  },
  {
    text: 'Подключите 2FA',
    colorStart: '#00a368',
    colorEnd: '#48ffc2',
    subText: 'в настройках профиля',
  },
  {
    text: 'Еще больше нового',
    colorStart: '#7070f3',
    colorEnd: '#a7a7e4',
    subText: 'в следующих обновлениях',
  },
];

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  private parent: HTMLElement;
  private restaurantList: BaseRestaurant[];
  private renderedIds: Set<string>;
  private observer: IntersectionObserver;
  private lastCardId: number;
  private _deletionScheduled: boolean;
  private readonly loadMoreEndThrottle: () => void;
  private readonly deleteFromDomThrottle: () => void;
  private restauransCarousels: Carousel<BaseRestaurant>[] = [];
  private cards: RestaurantCard[] = [];

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.restaurantList = [];
    this.renderedIds = new Set();
    this.lastCardId = -1;
    this._deletionScheduled = false;

    this.observer = new IntersectionObserver(
      () => {
        this.loadMoreEndThrottle();
      },
      { rootMargin: `${SCROLL_MARGIN}px` },
    );

    this.loadMoreEndThrottle = throttle(this.loadMoreEnd, 500);
    this.deleteFromDomThrottle = throttle(this.deleteFromDom, 10);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLDivElement | null {
    return document.querySelector('.restaurant__container');
  }

  /**
   * Рендерит список ресторанов в родительский элемент.
   */
  async render(): Promise<void> {
    this.parent.innerHTML = template();

    const container: HTMLDivElement = this.parent.querySelector('.restaurant__promotions__wrapper');

    promotions.forEach((promo) => {
      new PromotionCard(
        container,
        promo.text,
        promo.colorStart,
        promo.colorEnd,
        promo?.subText,
      ).render();
    });

    try {
      await this.renderRestaurantsCarousel();
      await this.loadMoreEnd();

      const lowerSentinel = document.querySelector('.lower-sentinel');
      if (lowerSentinel) this.observer.observe(lowerSentinel);

      document.addEventListener('scroll', this.deleteFromDomThrottle);
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  private async renderRestaurantsCarousel(): Promise<void> {
    let startCount = 0;
    let endCount = 6;

    for (let i = 0; i < 2; i++) {
      try {
        const newRestaurants: BaseRestaurant[] = await AppRestaurantRequests.GetAll({
          count: `${6}`,
          offset: startCount.toString(),
        });

        if (!newRestaurants) return;

        const uniqueRestaurants = newRestaurants.filter((r) => !this.renderedIds.has(r.id));
        this.restaurantList.push(...uniqueRestaurants);

        const carouselWrapper: HTMLDivElement = this.parent.querySelector(
          '.restaurant__carousel__wrapper',
        );
        const restauransCarousel = new Carousel(
          i.toString(),
          carouselWrapper,
          uniqueRestaurants,
          (container, restaurant) => new RestaurantCard(container, restaurant),
        );

        restauransCarousel.render();
        this.restauransCarousels.push(restauransCarousel);

        if (!i) {
          const payAttentionHeader = document.createElement('h1');
          payAttentionHeader.style.marginTop = '20px';
          payAttentionHeader.innerText = 'Обратите внимание';
          carouselWrapper.appendChild(payAttentionHeader);
        }

        this.lastCardId = endCount - 1;
        startCount = endCount;
        endCount += 6;
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Добавляет карточки при прокрутке вниз
   */
  private loadMoreEnd = async () => {
    if (!this.self) {
      return;
    }
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

      this.cards.push(card);
    }

    this.lastCardId = endCount - 1;
  };

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

      const lastFour = Array.from(cards).slice(-REMOVE_THRESHOLD);
      if (lastFour[0].getBoundingClientRect().top > window.innerHeight * SCROLL_THRESHOLD) {
        lastFour.forEach((card) => {
          card.remove();
          this.cards.pop();
        });
        this.lastCardId -= lastFour.length;
      }

      this._deletionScheduled = false;
    });
  };

  /**
   * Удаляет список ресторанов и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.observer.disconnect();
    this.cards.forEach((card) => {
      card.remove();
    });
    this.cards = [];

    // Отписка от событий и наблюдателей
    document.removeEventListener('scroll', this.deleteFromDomThrottle);

    this.restauransCarousels?.forEach((carousel) => carousel.remove());
    this.restauransCarousels = [];
    // Сброс всех состояний
    this.restaurantList = [];
    this.renderedIds.clear();
    this.lastCardId = -1;
    this._deletionScheduled = false;

    // Удаление карточек и очистка DOM
    this.parent.innerHTML = '';
  }
}
