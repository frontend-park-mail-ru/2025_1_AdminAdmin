import { AppRestaurantRequests } from '../../modules/ajax.js';
import { RestaurantCard } from '../../components/restaurantCard/restaurantCard.js';
import throttle from '../../modules/throttle.js';

// Константы
const LOAD_COUNT = 16;
const SCROLL_MARGIN = 100;
const REMOVE_THRESHOLD = 4;
const SCROLL_THRESHOLD = 2;

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;
  #observer;
  #firstCardId;
  #lastCardId;
  #loadMoreEndThrottle;

  /**
   * Создает экземпляр списка ресторанов.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
    this.#firstCardId = -1;
    this.#lastCardId = -1;
    this.#observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('upper-sentinel')) {
              this.#loadMoreBeg();
            } else if (entry.target.classList.contains('lower-sentinel')) {
              this.#loadMoreEndThrottle();
            }
          }
        });
      },
      { rootMargin: `${SCROLL_MARGIN}px` },
    );

    this.#loadMoreEndThrottle = throttle(this.#loadMoreEnd.bind(this), 500);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self() {
    return document.querySelector('.restaurant__container');
  }

  /**
   * Рендерит список ресторанов в родительский элемент.
   * Получает данные о ресторанах с сервера и отображает их на странице.
   * @returns {Promise<void>}
   */
  async render() {
    try {
      const template = window.Handlebars.templates['restaurantList.hbs'];
      this.#parent.innerHTML = template(undefined);

      const lowerSentinel = document.querySelector('.lower-sentinel');
      this.#observer.observe(lowerSentinel);

      const upperSentinel = document.querySelector('.upper-sentinel');
      this.#observer.observe(upperSentinel);

      document.addEventListener('scroll', this.#deleteFromDom);
    } catch (error) {
      console.error('Error rendering restaurant list:', error);
    }
  }

  /**
   * Добавляет карточки при прокрутке вверх
   * @private
   */
  #loadMoreBeg() {
    const begCount = Math.max(this.#firstCardId - LOAD_COUNT, 0);
    for (let i = this.#firstCardId - 1; i >= begCount; i--) {
      const card = new RestaurantCard(this.self, this.#restaurantList[i]);
      card.render('afterBegin');
    }

    this.#firstCardId = begCount;
  }

  /**
   * Добавляет карточки при прокрутке вниз
   * @private
   */
  async #loadMoreEnd() {
    const startCount = this.#lastCardId + 1;
    let endCount = startCount + LOAD_COUNT;
    if (endCount >= this.#restaurantList.length) {
      this.#restaurantList.push(
        ...(await AppRestaurantRequests.GetAll({ count: `${LOAD_COUNT}`, offset: startCount })),
      );
    }
    if (endCount > this.#restaurantList.length) {
      endCount = this.#restaurantList.length;
    }
    for (let i = startCount; i < endCount; i++) {
      const card = new RestaurantCard(this.self, this.#restaurantList[i]);
      card.render('beforeEnd');
    }

    this.#lastCardId = endCount - 1;
  }

  /**
   * Удаляет лишние карточка из DOM-а
   * @private
   */
  #deleteFromDom = () => {
    if (this._deletionScheduled) return;
    this._deletionScheduled = true;

    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.restaurant__card');
      if (cards.length < REMOVE_THRESHOLD) return;

      const firstFour = Array.from(cards).slice(0, REMOVE_THRESHOLD);
      if (firstFour[0].getBoundingClientRect().bottom < -window.innerHeight * SCROLL_THRESHOLD) {
        firstFour.forEach((card) => card.remove());
        this.#firstCardId += firstFour.length;
      }

      const lastFour = Array.from(cards).slice(-REMOVE_THRESHOLD);
      if (lastFour[0].getBoundingClientRect().top > window.innerHeight * SCROLL_THRESHOLD) {
        lastFour.forEach((card) => card.remove());
        this.#lastCardId -= lastFour.length;
      }

      this._deletionScheduled = false;
    });
  };

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove() {
    const cards = document.querySelectorAll('.restaurant__card');
    if (cards.length) {
      cards.forEach((card) => card.remove());
    }
    this.#parent.innerHTML = '';
    document.removeEventListener('scroll', this.#deleteFromDom);
    this.#observer.disconnect();
    this.#restaurantList = [];
  }
}
