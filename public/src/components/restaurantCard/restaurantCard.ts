import { router } from '@modules/routing';

import template from './restaurantCard.hbs';

import burgerKingImg from '@assets/burgerking.png';

interface RestaurantProps {
  id: string;
  name: string;
  description: string;
  type: string;
  rating: string;
  amount: string;
  image?: string;
}

/**
 * Класс карточки ресторана
 */
export class RestaurantCard {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props = {
    id: '', // Идентификатор карточки
    name: '', // Название ресторана
    description: '', // Описание ресторана
    type: '', // Тип ресторана (Кухня)
    rating: {
      score: '', // Оценка
      amount: '', // Кол-во отзывов
    },
    image: '', // Изображение
  };

  /**
   * Создает экземпляр карточки ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: RestaurantProps) {
    this.parent = parent;
    this.props = {
      id: props.id,
      name: props.name,
      description: props.description,
      type: props.type,
      rating: {
        score: props.rating,
        amount: props.amount,
      },
      image: props.image || burgerKingImg,
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    return document.getElementById(this.props.id) as HTMLElement;
  }

  /**
   * Обработчик нажатия на карточку.
   * @private
   */
  private handleClick() {
    this.self.addEventListener('click', (event: Event) => {
      event.preventDefault();
      router.goToPage('restaurantPage', this.props.id);
    });
  }

  /**
   * Отображает карточку на странице.
   * @param pushDirection {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} - Определяет, куда вставлять карточку относительно родителя.
   */
  render(pushDirection: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend') {
    const html = template(this.props);
    this.parent.insertAdjacentHTML(pushDirection, html);
    this.handleClick();
  }

  /**
   * Удаляет карточку ресторана со страницы и снимает обработчики событий.
   */
  remove() {
    this.self.removeEventListener('click', (event: Event) => {
      event.preventDefault();
      router.goToPage('restaurantPage', this.props.id);
    });
  }
}
