import { RestaurantReview, RestaurantReviewProps } from './restaurantReview/restaurantReview';
import { RestaurantDetail, RestaurantDetailProps } from './restaurantDetail/restaurantDetail';
import { RatingProps } from '../../components/restaurantHeader/restaurantHeader';
import { Button, ButtonProps } from '../button/button';

import template from './restaurantReviews.hbs';

export interface RestaurantReviewsProps {
  rating: RatingProps; // Рейтинг (в числовом виде с количеством оценок)
  reviewsList?: Array<RestaurantReviewProps>; // Список ресторанов
  hours?: {
    // Время работы ресторана
    status: boolean; // 1 - открыто, 0 - закрыто
    open: string; // Время открытия
    close: string; // Время закрытия
  };
  address?: {
    // Адрес ресторана
    city: string; // Город
    street: string; // Адрес
  };
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
  constructor(parent: HTMLElement, props: RestaurantReviewsProps) {
    this.parent = parent;
    this.props = {
      rating: {
        score: props.rating.score,
        amount: props.rating.amount,
        // stars: '⭐'.repeat(Math.floor(props.rating.score)),
      },
      hours: {
        status: props.hours.status,
        open: props.hours.open,
        close: props.hours.close,
      },
      address: {
        city: props.address.city,
        street: props.address.street,
      },
    };
    if (props.reviewsList.length >= 2) {
      this.props.reviewsList = props.reviewsList.slice(0, 2);
    } else {
      this.props.reviewsList = props.reviewsList.slice();
    }
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
    // Заполняем
    const reviewsContainer = this.self.querySelector(
      '.restaurant-reviews__reviews-container',
    ) as HTMLElement;
    // Рендерим отзывы ресторана
    this.props.reviewsList.forEach((reviewProps) => {
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
    const detailsContainer = this.self.querySelector(
      '.restaurant-reviews__details-container',
    ) as HTMLElement;
    // Рендерим время работы ресторана
    const hoursProps: RestaurantDetailProps = {
      id: 'restaurant__hours',
      image: {
        src: 'clock.png',
      },
      mainText: this.props.hours.status ? 'Открыто' : 'Закрыто',
      addText: this.props.hours.status
        ? `До ${this.props.hours.close}`
        : `До ${this.props.hours.open}`,
    };
    const hours = new RestaurantDetail(detailsContainer, hoursProps);
    hours.render();
    // Рендерим адрес ресторана
    const addressProps: RestaurantDetailProps = {
      id: 'restaurant__address',
      image: {
        src: 'location.png',
      },
      mainText: this.props.address.city,
      addText: this.props.address.street,
    };
    const address = new RestaurantDetail(detailsContainer, addressProps);
    address.render();
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
    hoursElement.remove;
    const addressElement = document.getElementById('restaurant__hours');
    addressElement.remove;
    element.remove();
  }
}

import Handlebars from 'handlebars';

Handlebars.registerHelper('generateStars', function (score) {
  return '⭐'.repeat(Math.floor(score));
});
