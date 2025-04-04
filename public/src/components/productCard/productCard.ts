import { QuantityButton, QuantityButtonProps } from '../quantityButton/quantityButton';
import template from './productCard.hbs';

// Структура класса карточки
export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  weight: number;
  amount: number;
}

/**
 * Класс карточки товара
 */
export class ProductCard {
  private parent: HTMLElement;
  private props: ProductCardProps;

  /**
   * Создает экземпляр карточки товара.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: ProductCardProps) {
    if (!parent) {
      throw new Error('ProductCard: no parent!');
    }
    this.parent = parent;
    this.props = props;
    if (document.getElementById(this.props.id)) {
      throw new Error(`ProductCard: id=${this.props.id} is already in use!`);
    }
    if (this.props.price < 0 || this.props.amount < 0 || this.props.weight < 0) {
      throw new Error('ProductCard: price, amount, and weight must be non-negative values!');
    }
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find product-card with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает карточку товара на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: productCard template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    // Кнопка уменьшения количества
    const minusButtonWrapper = this.self.querySelector(
      '.product-card__minus-button__wrapper',
    ) as HTMLElement;
    const minusButton = new QuantityButton(minusButtonWrapper, {
      id: `${this.props.id}__minus-button`,
      text: '-',
      onSubmit: () => {
        console.log('-1');
      },
    });

    minusButton.render();

    // Кнопка увеличения количества
    const plusButtonWrapper = this.self.querySelector(
      '.product-card__plus-button__wrapper',
    ) as HTMLElement;
    const plusButton = new QuantityButton(plusButtonWrapper, {
      id: `${this.props.id}__plus-button`,
      text: '+',
      onSubmit: () => {
        console.log('+1');
      },
    });

    plusButton.render();
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    const element = this.self;
    document.getElementById(`${this.props.id}__minus-button`)?.remove();
    document.getElementById(`${this.props.id}__plus-button`)?.remove();
    element.remove();
  }
}
