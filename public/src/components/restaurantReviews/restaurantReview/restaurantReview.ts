import template from './restaurantReview.hbs';

// Структура класса отзыва ресторана (нужно для конструктора)
export interface RestaurantReviewProps {
  // ? - необязательное поле
  id: string; // Id для идентификации     | Обязательное поле
  text?: string; // Текст отзыва          | Может быть не задано (как оценка, а не отзыв)
  rating: number; // Поставленная оценка  | Обязательное поле
  author: string; // Автор отзыва         | Обязательное поле
  date: string; // Дата отзыва            | Обязательное поле
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
    this.props = {
      id: props.id,
      text: props.text || null,
      rating: props.rating,
      author: props.author,
      date: props.date,
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find restaurant-review with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает отзыв ресторана на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: restaurant-review template not found');
    }
    // Рендерим шаблончик
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    const ratingInStars = this.self.querySelector(
      '.restaurant-review__rating_stars__foreground',
    ) as HTMLElement;
    if (!ratingInStars) {
      throw new Error(`Error: can't find rating in stars`);
    }
    ratingInStars.style.width = `${(this.props.rating / 5) * 100}%`;
  }

  /**
   * Удаляет блок отзывов и снимает обработчики событий.
   */
  remove(): void {
    const element = this.self;
    element.remove();
  }
}
