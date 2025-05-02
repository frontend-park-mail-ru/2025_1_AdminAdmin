import { RestaurantReview } from './restaurantReview/restaurantReview';
import { Review } from '@myTypes/restaurantTypes';
import { RestaurantDetail, RestaurantDetailProps } from './restaurantDetail/restaurantDetail';
import { Button, ButtonProps } from '@components/button/button';

import template from './restaurantReviews.hbs';

import locationImg from '@assets/location.png';
import clockImg from '@assets/clock.png';

import type { WorkingMode } from '@myTypes/restaurantTypes';
import { modalController } from '@modules/modalController';
import { ReviewsModal } from '@components/reviewsModal/reviewsModal';
import { StarsWidget } from '@components/starsWidget/starsWidget';
import { toasts } from '@modules/toasts';
import { AppRestaurantRequests } from '@modules/ajax';

export interface RestaurantReviewsProps {
  id: string;
  rating: number;
  rating_count: number;
  reviews?: Review[];
  working_mode: WorkingMode;
  address: string;
}

/**
 * Класс блока отзывов на ресторан
 */
export class RestaurantReviews {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: RestaurantReviewsProps;
  protected moreButton: Button;
  private starsWidget: StarsWidget;

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
    this.props = props;
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
    const ratingString = this.getRatingText(this.props.rating_count);
    // Рендерим шаблончик с данными
    const html = template({ ...this.props, ratingString });
    this.parent.insertAdjacentHTML('beforeend', html);
    const starsContainer: HTMLElement = this.self.querySelector(
      '.restaurant-reviews__rating_stars',
    ) as HTMLElement;
    if (!starsContainer) {
      throw new Error(`Error: can't find rating in stars`);
    }

    this.starsWidget = new StarsWidget(starsContainer, this.props.rating, this.sendRating);
    this.starsWidget.render();

    // Заполняем
    const reviewsContainer = this.self.querySelector(
      '.restaurant-reviews__reviews-container',
    ) as HTMLElement;

    // Рендерим отзывы ресторана
    let moreReviewsProps: ButtonProps;
    if (Array.isArray(this.props.reviews) && this.props.reviews.length > 0) {
      this.props.reviews.forEach((reviewProps) => {
        const reviewComponent = new RestaurantReview(reviewsContainer, {
          ...reviewProps,
          isActive: false,
        });
        reviewComponent.render();
      });
      // Рендерим кнопку "Больше"
      moreReviewsProps = {
        id: 'more-reviews-button',
        text: 'Показать больше',
        onSubmit: () => {
          const reviewsModal = new ReviewsModal(
            this.props.id,
            this.props.rating,
            this.updateReviews,
          );
          modalController.openModal(reviewsModal);
        },
      };
    } else {
      moreReviewsProps = {
        id: 'more-reviews-button',
        text: 'Станьте первым, кто оставит отзыв!',
        onSubmit: () => {
          const reviewsModal = new ReviewsModal(
            this.props.id,
            this.props.rating,
            this.updateReviews,
          );
          modalController.openModal(reviewsModal);
        },
      };

      const noReviews: HTMLDivElement = this.self.querySelector('.restaurant-reviews__no_reviews');
      noReviews.style.display = 'block';
    }

    this.moreButton = new Button(reviewsContainer, moreReviewsProps);
    this.moreButton.render();

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
        ? `До ${this.formatHour(this.props.working_mode.to)}`
        : `До ${this.formatHour(this.props.working_mode.from)}`,
    };

    const hours = new RestaurantDetail(detailsContainer, hoursProps);
    hours.render();
  }

  sendRating = async (value: number) => {
    try {
      const newReview = await AppRestaurantRequests.SendReview(this.props.id, {
        review_text: '',
        rating: value,
      });
      this.updateReviews(newReview);
      toasts.success('Оценка успешно отправлена');
    } catch (error) {
      const message = error.message;
      toasts.error(
        message ? message.charAt(0).toUpperCase() + message.slice(1) : 'Не удалось отправить отзыв',
      );
    }
  };

  /**
   * Преобразует числовое значение часа в формат HH:MM
   * @param hour Час от 0 до 23
   * @returns строка в формате HH:MM
   */
  private formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  public updateReviews = (newReview: Review) => {
    if (this.props.reviews.length < 2) {
      this.props.reviews.push(newReview);
      const reviewsContainer: HTMLDivElement = this.self.querySelector(
        '.restaurant-reviews__reviews-container',
      );
      const reviewComponent = new RestaurantReview(reviewsContainer, {
        ...newReview,
        isActive: true,
      });
      reviewComponent.render('afterbegin');
      this.moreButton.setText('Показать больше');

      const noReviews: HTMLDivElement = this.self.querySelector('.restaurant-reviews__no_reviews');
      noReviews.style.display = 'none';
    }

    const { rating, rating_count } = this.props;

    const updatedRatingCount = rating_count + 1;
    const updatedRating = (rating * rating_count + newReview.rating) / updatedRatingCount;

    this.props.rating_count = updatedRatingCount;
    this.props.rating = updatedRating;

    const scoreElement = this.self.querySelector(
      '.restaurant-reviews__rating_score',
    ) as HTMLElement;
    if (scoreElement) {
      scoreElement.textContent = updatedRating.toFixed(1);
    }

    const amountElement = this.self.querySelector(
      '.restaurant-reviews__rating_amount',
    ) as HTMLElement;
    if (amountElement) {
      amountElement.textContent = this.getRatingText(updatedRatingCount);
    }

    setTimeout(() => this.starsWidget.setRating(updatedRating), 1500);
  };

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
    this.props.reviews = [];
    const element = this.self;
    this.moreButton?.remove();

    element.remove();
  }
}
