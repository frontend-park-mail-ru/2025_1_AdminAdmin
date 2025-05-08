import template from './profileTableRow.hbs';
import { I_OrderResponse, statusMap } from '@myTypes/orderTypes';
import { router } from '@modules/routing';
import { Button } from '@components/button/button';

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
  protected showOrderButton: Button;

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
    const date = new Date(this.props.created_at);
    const formattedDate = date.toLocaleDateString('ru-RU');
    this.props.created_at = formattedDate.replace(/\./g, '/');

    let products_amount = 0;

    for (const product of this.props.order_products.products) products_amount += product.amount;

    const status = statusMap[this.props.status].text;
    const productWord = this.getProductWordForm(products_amount);

    const html = template({
      ...this.props,
      products_amount,
      productWord,
      status,
      completed: status === statusMap.delivered.text,
    });

    this.parent.insertAdjacentHTML('beforeend', html);
    this.self.addEventListener('click', this.handleClick);

    const buttonWrapper: HTMLDivElement = this.self.querySelector('.show-order-button-wrapper');
    this.showOrderButton = new Button(buttonWrapper, {
      id: 'show-order-button',
      text: 'Посмотреть',
    });

    this.showOrderButton.render();
  }

  getProductWordForm(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return 'продукт';
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'продукта';
    return 'продуктов';
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
    this.showOrderButton.remove();
    element.removeEventListener('click', this.handleClick); // Удаляем обработчик
    element.remove();
  }
}
