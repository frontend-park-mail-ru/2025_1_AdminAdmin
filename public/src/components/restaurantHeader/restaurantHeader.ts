import template from './restaurantHeader.hbs';
import restaurantHeaderImg from '@assets/header.png';
import burgerKingImg from '@assets/burgerking.png';

// Структура класса хедера ресторана
export interface RestaurantHeaderProps {
  name: string;
  banner_url: string;
  description?: string;
  tags: string[];
  rating: number;
  rating_count: number;
  background?: string;
  icon?: string;
}

/**
 * Класс хедера ресторана (шапка с названием и описанием)
 */
export class RestaurantHeader {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props: RestaurantHeaderProps;

  /**
   * Создает экземпляр хедера ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться хедер.
   * @param {Object} props - Словарь данных для определения свойств хедера
   */
  constructor(parent: HTMLElement, props: RestaurantHeaderProps) {
    this.parent = parent;
    this.props = {
      name: props.name,
      description: props.description ?? 'Описание ресторана',
      tags: props.tags ?? ['Кухня ресторана'],
      rating: props.rating ?? 0,
      rating_count: props.rating_count ?? 0,
      banner_url: props.banner_url,
      background: props.background || restaurantHeaderImg,
      icon: props.icon || burgerKingImg,
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurant-header');
    if (!element) {
      throw new Error(`Error: can't find restaurant-header`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает хедер ресторана на странице.
   */
  render() {
    if (!template) {
      throw new Error('Error: restaurant-header template not found');
    }
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Удаляет хедер ресторана со страницы
   */
  remove(): void {
    const element = this.self;
    element.remove();
  }
}
