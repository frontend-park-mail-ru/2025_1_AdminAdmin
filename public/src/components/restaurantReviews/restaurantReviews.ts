import { RestaurantReview, RestaurantReviewProps } from './restaurantReview/restaurantReview';
import {
  RestaurantDetail,
  RestaurantDetailProps,
  ImageProps,
} from './restaurantDetail/restaurantDetail';
import { RatingProps } from '../../components/restaurantHeader/restaurantHeader';
import { Button, ButtonProps } from '../button/button';

import Handlebars from 'handlebars';
Handlebars.registerHelper('generateStars', function (score) {
  return '⭐'.repeat(Math.floor(score));
});
import template from './restaurantReviews.hbs';

export interface RestaurantReviewsProps {
  rating: RatingProps; // Рейтинг (в числовом виде с количеством оценок)
  reviewsList?: Array<RestaurantReviewProps>; // Список ресторанов
  hours?: {
    // Время работы ресторана
    status: boolean; // 1 - открыто, 0 - закрыто
    open: string; // Время открытия
    close: string; // Время закрытия
    image?: ImageProps; // Иконка часов
  };
  address?: {
    // Адрес ресторана
    city: string; // Город
    street: string; // Адрес
    image?: ImageProps; // Иконка адреса
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
    if (!parent) {
      throw new Error('RestaurantReviews: no parent!');
    }
    this.parent = parent;
    this.props = {
      rating: {
        score: props.rating.score ?? 0,
        amount: props.rating.amount ?? 0,
      },
      hours: {
        status: props.hours.status,
        open: props.hours.open,
        close: props.hours.close,
        image: {
          src: props.hours.image?.src || '/src/assets/clock.png',
        },
      },
      address: {
        city: props.address.city,
        street: props.address.street,
        image: {
          src: props.address.image?.src || '/src/assets/location.png',
        },
      },
    };
    if (props.reviewsList.length >= 2) {
      this.props.reviewsList = props.reviewsList.slice(0, 2);
    } else {
      this.props.reviewsList = props.reviewsList.slice();
    }
    console.log(
      `Создан элемент класса RestaurantReviews со следующими пропсами: ${JSON.stringify(this.props)}`,
    );
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
    console.log('Рендерим шаблончик');
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    const ratingInStars = this.self.querySelector(
      '.restaurant-reviews__rating_stars__foreground',
    ) as HTMLElement;
    if (!ratingInStars) {
      throw new Error(`Error: can't find rating in stars`);
    }
    ratingInStars.style.width = `${(this.props.rating.score / 5) * 100}%`;
    console.log(ratingInStars.style.width);
    // Заполняем
    console.log('Рендерим компонентами');
    const reviewsContainer = this.self.querySelector(
      '.restaurant-reviews__reviews-container',
    ) as HTMLElement;
    // Рендерим отзывы ресторана
    this.props.reviewsList.forEach((reviewProps) => {
      console.log(
        `Рендерим отзывы ресторана, вызываем конструктор для RestaurantReview со следующими пропсами: ${JSON.stringify(reviewProps)}`,
      );
      const reviewComponent = new RestaurantReview(reviewsContainer, reviewProps);
      reviewComponent.render();
    });
    // Рендерим кнопку "Больше"
    const moreReviewsProps: ButtonProps = {
      id: 'more-reviews-button', // Id для идентификации
      text: 'Больше', // text для отображения
    };
    console.log(
      `Рендерим кнопку больше, вызываем конструктор для Button со следующими пропсами: ${JSON.stringify(moreReviewsProps)}`,
    );
    const moreReviews = new Button(reviewsContainer, moreReviewsProps);
    moreReviews.render();
    const detailsContainer = this.self.querySelector(
      '.restaurant-reviews__details-container',
    ) as HTMLElement;
    // Рендерим время работы ресторана
    const hoursProps: RestaurantDetailProps = {
      id: 'restaurant__hours',
      image: {
        src: '/src/assets/clock.png',
      },
      mainText: this.props.hours.status ? 'Открыто' : 'Закрыто',
      addText: this.props.hours.status
        ? `До ${this.props.hours.close}`
        : `До ${this.props.hours.open}`,
    };
    console.log(
      `Рендерим время работы ресторана, вызываем конструктор для RestaurantDetail со следующими пропсами: ${JSON.stringify(hoursProps)}`,
    );
    const hours = new RestaurantDetail(detailsContainer, hoursProps);
    hours.render();
    // Рендерим адрес ресторана
    const addressProps: RestaurantDetailProps = {
      id: 'restaurant__address',
      image: {
        src: '/src/assets/location.png',
      },
      mainText: this.props.address.city,
      addText: this.props.address.street,
    };
    console.log(
      `Рендерим адрес ресторана, вызываем конструктор для RestaurantDetail со следующими пропсами: ${JSON.stringify(addressProps)}`,
    );
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
