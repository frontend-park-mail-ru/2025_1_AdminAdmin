import { AppRestaurantRequests } from '../../modules/ajax.js';
import { restaurantCard } from '../../components/restaurantCard/restaurantCard.js';

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;
  #observer;
  #firstCardId;
  #lastCardId;
  #loadMoreEndDebounced;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
    this.#firstCardId = -1;
    this.#lastCardId = -1;
    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('upper-sentinel')) {
            this.#loadMoreBeg();
          } else if (entry.target.classList.contains('lower-sentinel')) {
            this.#loadMoreEndDebounced();
          }
        }
      });
    }, { rootMargin: '100px' });

    this.#loadMoreEndDebounced = this.#debounce(this.#loadMoreEnd.bind(this), 500);
  }

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
      const template = window.Handlebars.templates["restaurantList.hbs"];
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

  #loadMoreBeg() {
    const begCount = Math.max(this.#firstCardId - 16, 0);
    for (let i = this.#firstCardId - 1; i >= begCount; i--) {
      const card = new restaurantCard(this.self, this.#restaurantList[i]);
      card.render('afterBegin');
    }

    this.#firstCardId = begCount;
  }

  async #loadMoreEnd() {
    const startCount = this.#lastCardId + 1;
    let endCount = startCount + 16;
    if (endCount >= this.#restaurantList.length) {
      this.#restaurantList.push(...await AppRestaurantRequests.GetAll({count: "16", offset: startCount}));
    }
    if (endCount > this.#restaurantList.length) {
      endCount = this.#restaurantList.length;
    }
    for (let i = startCount; i < endCount; i++) {
      const card = new restaurantCard(this.self, this.#restaurantList[i]);
      card.render('beforeEnd');
    }

    this.#lastCardId = endCount - 1;
  }

  #deleteFromDom = () => {
    if (this._deletionScheduled) return;
    this._deletionScheduled = true;

    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.restaurant__card');
      if (cards.length < 4) return;

      const firstFour = Array.from(cards).slice(0, 4);
      if (firstFour[0].getBoundingClientRect().bottom < -window.innerHeight * 2) {
        firstFour.forEach(card => card.remove());
        this.#firstCardId += firstFour.length;
      }

      const lastFour = Array.from(cards).slice(-4);
      if (lastFour[0].getBoundingClientRect().top > window.innerHeight * 2) {
        lastFour.forEach(card => card.remove());
        this.#lastCardId -= lastFour.length;
      }

      this._deletionScheduled = false;
    });
  }

  /**
   * Удаляет список ресторанов.
   */
  remove() {
    const cards = document.querySelectorAll('.restaurant__card');
    if (cards.length) {
      cards.forEach(card => card.remove());
    }
    this.#parent.innerHTML = '';
    document.removeEventListener('scroll', this.#deleteFromDom);
    this.#observer.disconnect();
    this.#restaurantList = [];
  }

  /**
   * Функция debounce
   * @param {Function} func - Функция, которую нужно выполнить после задержки
   * @param {number} wait - Время задержки в миллисекундах
   * @returns {Function} - Возвращает новую функцию с debounce логикой
   */
  #debounce(func, wait) {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
  }
}
