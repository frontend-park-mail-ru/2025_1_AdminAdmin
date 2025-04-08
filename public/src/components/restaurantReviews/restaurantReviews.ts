import { RestaurantReview, RestaurantReviewProps } from './restaurantReview/restaurantReview';
import { RestaurantDetail, RestaurantDetailProps } from './restaurantDetail/restaurantDetail';
import { Button, ButtonProps } from '@components/button/button';

import template from './restaurantReviews.hbs';

import locationImg from '@assets/location.png';
import clockImg from '@assets/clock.png';

import type { WorkingMode } from '@myTypes/restaurantTypes';

export interface RestaurantReviewsProps {
  rating: number;
  rating_count: string;
  reviews_list?: Array<RestaurantReviewProps>;
  working_mode: WorkingMode;
  address: string;
}

/**
 * Класс блока отзывов на ресторан
 */
export class RestaurantReviews {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: RestaurantReviewsProps;

  /**
   * Создает экземпляр блока отзывов на ресторан
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться блок отзывов на ресторан.
   * @param {Object} props - Словарь данных для определения свойств блока отзывов на ресторан
   */
  constructor(
    parent: HTMLElement,
    props: {
      rating: number;
      rating_count: number;
      reviews_list?: Array<RestaurantReviewProps>;
      working_mode: WorkingMode;
      address: string;
    },
  ) {
    if (!parent) {
      throw new Error('RestaurantReviews: no parent!');
    }
    this.parent = parent;
    this.props = {
      rating: props.rating,
      rating_count: this.getRatingText(props.rating_count),
      reviews_list: props?.reviews_list || null,
      working_mode: props.working_mode,
      address: props.address,
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurant-reviews');
    if (!element) {
      throw new Error(`Error: can't find restaurant-reviews`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает блок отзывов на ресторан на странице
   */
  render() {
    if (!template) {
      throw new Error('Error: restaurant-reviews template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    const ratingInStars = this.self.querySelector(
      '.restaurant-reviews__rating_stars__foreground',
    ) as HTMLElement;
    if (!ratingInStars) {
      throw new Error(`Error: can't find rating in stars`);
    }
    ratingInStars.style.width = `${(this.props.rating / 5) * 100}%`;
    // Заполняем
    const reviewsContainer = this.self.querySelector(
      '.restaurant-reviews__reviews-container',
    ) as HTMLElement;
    // Рендерим отзывы ресторана
    if (this.props.reviews_list) {
      this.props.reviews_list.forEach((reviewProps) => {
        const reviewComponent = new RestaurantReview(reviewsContainer, reviewProps);
        reviewComponent.render();
      });
      // Рендерим кнопку "Больше"
      const moreReviewsProps: ButtonProps = {
        id: 'more-reviews-button', // Id для идентификации
        text: 'Больше', // text для отображения
      };
      const moreReviews = new Button(reviewsContainer, moreReviewsProps);
      moreReviews.render();
    } else {
      const noReviews: HTMLDivElement = this.self.querySelector('.restaurant-reviews__no_reviews');
      noReviews.style.display = 'block';
    }

    const detailsContainer = this.self.querySelector(
      '.restaurant-reviews__details-container',
    ) as HTMLElement;

    // Рендерим адрес ресторана
    const fullAddress = this.props.address;
    const addressParts = fullAddress.split(',');
    const city = addressParts[0]?.trim();
    const streetAndNumber = addressParts.slice(1).join(',').trim();

    const addressProps: RestaurantDetailProps = {
      id: 'restaurant__address',
      image: {
        src: locationImg,
      },
      mainText: streetAndNumber,
      addText: city,
    };

    const address = new RestaurantDetail(detailsContainer, addressProps);
    address.render();

    // Рендерим время работы ресторана
    const hoursProps: RestaurantDetailProps = {
      id: 'restaurant__hours',
      image: {
        src: clockImg,
      },
      mainText: this.getOpenStatus() ? 'Открыто' : 'Закрыто',
      addText: this.getOpenStatus()
        ? `До ${this.props.working_mode.to}`
        : `До ${this.props.working_mode.from}`,
    };

    const hours = new RestaurantDetail(detailsContainer, hoursProps);
    hours.render();
  }

  getRatingText(ratingCount: number): string {
    const lastDigit = ratingCount % 10;
    const lastTwoDigits = ratingCount % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${ratingCount} оценок`;
    }

    if (lastDigit === 1) {
      return `${ratingCount} оценка`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${ratingCount} оценки`;
    }

    return `${ratingCount} оценок`;
  }

  /**
   * Проверяет, открыт ли ресторан в данный момент.
   * @returns {boolean} - true, если ресторан открыт, иначе false.
   */
  private getOpenStatus(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const { from, to } = this.props.working_mode;

    if (currentHour > from && currentHour < to) {
      return true;
    }

    if (currentHour === from && currentMinute >= 0) {
      return true;
    }

    if (currentHour === to && currentMinute === 0) {
      return false;
    }

    return false;
  }

  /**
   * Удаляет блок отзывов и снимает обработчики событий.
   */
  remove() {
    const element = this.self;
    const reviews = document.querySelectorAll('.restaurant-review');
    if (reviews.length) {
      reviews.forEach((reviewElement) => {
        reviewElement.remove();
      });
    }
    const moreButtonElement = document.getElementById('more-reviews');
    moreButtonElement.remove();
    // Снять обработчик событий;
    const hoursElement = document.getElementById('restaurant__hours');
    hoursElement.remove();
    const addressElement = document.getElementById('restaurant__hours');
    addressElement.remove();
    element.remove();
  }
}
