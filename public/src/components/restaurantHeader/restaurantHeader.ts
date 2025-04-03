import template from './restaurantHeader.hbs';
import restaurantHeaderImg from '@assets/header.png';
import burgerKingImg from '@assets/burgerking.png';

// Структура класса рейтинга
export interface RatingProps {
  // ? - необязательное поле
  score?: number; // Числовая оценка    | Если не задан, то 0
  amount?: number; // Количество оценок  | Если не задан, то 0
}
// Структура класса хедера ресторана
export interface RestaurantHeaderProps {
  // ? - необязательное поле
  name: string; // Название ресторана       | Обязательное поле
  description?: string; // Описание ресторана       | Если не задано, то "Описание ресторана"
  type?: string; // Кухня ресторана          | Если не задано, то "Кухня ресторана"
  rating?: RatingProps; // Общий рейтинг ресторана  | Если не задано, то {score: 0, amount: 0}
  background?: string; // Фон шапки                | Если не задано, то header.png
  icon?: string; // Иконка ресторана         | Если не задано, то burgerking.png
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
      type: props.type ?? 'Кухня ресторана',
      rating: {
        score: props.rating.score ?? 0,
        amount: props.rating.amount ?? 0,
      },
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
