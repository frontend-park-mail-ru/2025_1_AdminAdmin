import template from './profileTableRow.hbs';
import { I_OrderResponse } from '@myTypes/orderTypes';
import { router } from '@modules/routing';

//Интерфейс картинки ресторана
export interface ImageProps {
  src: string;
  alt?: string;
}

// Интерфейс компонента (нужен для рендера)
export interface RestaurantProps {
  name: string;
  image?: ImageProps | string; // Будем передавать как строку, а преобразовывать как ImageProps
}

export class ProfileTableRow {
  protected parent: HTMLElement;
  protected props: I_OrderResponse;

  /**
   * @constructor Создает экземпляр строки таблицы на странице профиля
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться строка таблицы
   * @param {TableRowProps} props - Словарь данных для определения свойств строки таблицы
   */
  constructor(parent: HTMLElement, props: I_OrderResponse) {
    if (!parent) {
      throw new Error('TableRow: no parent!');
    }
    this.parent = parent;
    this.props = props;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Category: can't find profile-table-row with id=${this.props.id}`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Функция рендера категории на странице
   */
  render(): void {
    if (!template) {
      throw new Error('ProfileTableRow: profile-table-row template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    this.self.addEventListener('click', this.handleClick);
  }

  /**
   * Обработчик нажатия на строку таблицы
   * @private
   */
  handleClick = () => {
    router.goToPage('orderPage', this.props.id);
  };

  /**
   * Удаляет строку из таблицы и убирает обработчики
   */
  remove(): void {
    const element = this.self;
    element.removeEventListener('click', this.handleClick); // Удаляем обработчик
    element.remove();
  }
}
