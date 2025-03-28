import template from './restaurantHeader.hbs';

/**
 * Класс хедера ресторана (шапка с названием и описанием)
 */
export class RestaurantHeader {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props = {
    name: '', // Название ресторана
    description: '', // Описание ресторана
    type: '', // Тип ресторана (кухня)
    rating: {
      score: '', // Оценка
    },
    background: '', // Фоновое изображение (шапка)
    icon: '', // Иконка ресторана
  };

  /**
   * Создает экземпляр хедера ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться хедер.
   * @param {Object} props - Словарь данных для определения свойств хедера
   */
  constructor(
    parent: HTMLElement,
    props: {
      name: string;
      description: string;
      type: string;
      rating: { score: string };
      background?: string;
      icon?: string;
    },
  ) {
    this.parent = parent;
    this.props = {
      name: props.name,
      description: props.description,
      type: props.type,
      rating: {
        score: props.rating.score,
      },
      background: props.background || '/src/assets/header.png',
      icon: props.icon || '/src/assets/burgerking.png',
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement | null {
    return document.querySelector('.restaurant__header');
  }

  /**
   * Отображает хедер ресторана на странице.
   */
  render() {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }
}
