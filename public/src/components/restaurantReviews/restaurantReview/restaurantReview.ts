import template from './restaurantReview.hbs';
import { Review } from '@myTypes/restaurantTypes';

interface RestaurantReviewProps extends Review {
  isActive: boolean;
}

/**
 * Класс отзыва ресторана
 */
export class RestaurantReview {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: RestaurantReviewProps;

  /**
   *Создает экземпляр отзыва ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться отзыв ресторана.
   * @param {Object} props - Словарь данных для определения свойств отзыв ресторана
   */
  constructor(parent: HTMLElement, props: RestaurantReviewProps) {
    if (!parent) {
      throw new Error('Review: no parent!');
    }
    this.parent = parent;
    this.props = props;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const selector = `#review-${this.props.id}`;
    const element: HTMLDivElement = this.parent.querySelector(selector);
    if (!element) {
      throw new Error(`Error: can't find restaurant-review with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает отзыв ресторана на странице
   */
  render(position: InsertPosition = 'beforeend'): void {
    if (!template) {
      throw new Error('Error: restaurant-review template not found');
    }

    const date = new Date(this.props.created_at);
    const formattedDate = date.toLocaleDateString('ru-RU');
    const formattedDateSlashes = formattedDate.replace(/\./g, '/');

    const propsForTemplate = {
      ...this.props,
      created_at: formattedDateSlashes,
    };

    // Рендерим шаблончик
    const html = template(propsForTemplate);
    this.parent.insertAdjacentHTML(position, html);

    const ratingInStars = this.self.querySelector(
      '.restaurant-review__rating_stars__foreground',
    ) as HTMLElement;

    if (!ratingInStars) {
      throw new Error(`Error: can't find rating in stars`);
    }

    ratingInStars.style.width = `${(this.props.rating / 5) * 100}%`;

    if (this.props.isActive) {
      this.self.style.backgroundColor = 'var(--light-grey)';
    }
  }

  /**
   * Удаляет блок отзывов и снимает обработчики событий.
   */
  remove(): void {
    const element = this.self;
    element.remove();
  }
}
