import { AppRestaurantRequests } from '../../modules/ajax.js';
import { restaurantCard } from '../../components/restaurantCard/restaurantCard.js';

/**
 * Класс, представляющий список ресторанов.
 */
export default class RestaurantList {
  #parent;
  #restaurantList;
  #observer;

  /**
   * Создает экземпляр списка ресторанов.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список ресторанов
   */
  constructor(parent) {
    this.#parent = parent;
    this.#restaurantList = [];
    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('upper-sentinel')) {
            this.#loadMoreBeg();
          } else if (entry.target.classList.contains('lower-sentinel')) {
            this.#loadMoreEnd();
          }
        }
      });
    }, { rootMargin: '100px' });
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
      this.#restaurantList = await AppRestaurantRequests.GetAll();

      if (!this.#restaurantList || this.#restaurantList.length === 0) throw new Error('Empty restaurant list');

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
    const cards = Array.from(document.querySelectorAll('.restaurant__card'));
    if (!cards.length) return;

    const firstCard = cards[0];
    let firstElemId = this.#restaurantList.findIndex(restaurant => restaurant.id === firstCard.id);
    if (firstElemId <= 0) return;

    const begCount = Math.max(firstElemId - 16, 0);
    for (let i = firstElemId - 1; i >= begCount; i--) {
      const card = new restaurantCard(this.self, this.#restaurantList[i]);
      card.render('afterBegin');
    }
  }

  #loadMoreEnd() {
    const cards = Array.from(document.querySelectorAll('.restaurant__card'));
    let lastElemId = -1;
    if (cards.length) {
      const lastCard = cards.at(-1);
      lastElemId = this.#restaurantList.findIndex(restaurant => restaurant.id === lastCard.id);
    }
    lastElemId += 1;

    const endCount = Math.min(lastElemId + 16, this.#restaurantList.length);
    for (let i = lastElemId; i < endCount; i++) {
      const card = new restaurantCard(this.self, this.#restaurantList[i]);
      card.render('beforeEnd');
    }
  }


  #deleteFromDom() {
    if (this._deletionScheduled) return;
    this._deletionScheduled = true;

    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.restaurant__card');
      if (cards.length < 4) return;

      const firstFour = Array.from(cards).slice(0, 4);
      if (firstFour[0].getBoundingClientRect().bottom < -window.innerHeight * 2) {
        firstFour.forEach(card => card.remove());
      }

      const lastFour = Array.from(cards).slice(-4);
      if (lastFour[0].getBoundingClientRect().top > window.innerHeight * 2) {
        lastFour.forEach(card => card.remove());
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
}
