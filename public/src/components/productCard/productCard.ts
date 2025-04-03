import { QuantityButton, QuantityButtonProps } from '@components/quantityButton/quantityButton';

import template from './productCard.hbs';
import whopperImg from '@assets/whopper.png';

// Структура класса карточки
export interface ProductCardProps {
  // ? - необязательное поле
  id?: string; // Идентификатор карточки                          | если не задан, то product-card-${name}
  image?: string; // Картинка продукта                            | если не задан, то whopper.png
  name: string; // Название товара                                | обязательное поле
  inCart?: boolean; // true - карточка активна (есть в корзине)   | если не задан, то false
  price?: number; // Цена товара (за единицу или общая)           | если не задан, то 0
  amount?: number; // Количество товара в корзине                 | если не задан, то 0)
}
/**
 * Класс карточки товара
 */
export class ProductCard {
  private parent: HTMLElement; // Родитель (где вызывается)
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
    this.props = {
      id: props.id || `product-card-${props.name}`,
      image: props.image || whopperImg,
      name: props.name,
      inCart: props.inCart ?? false,
      price: props.price ?? 0,
      amount: props.amount ?? 0,
    };
    if (document.getElementById(this.props.id)) {
      throw new Error(`ProductCard: id=${this.props.id} is already use!`);
    }
    if (this.props.price < 0) {
      throw new Error(`ProductCard: price < 0!`);
    }
    if (this.props.amount < 0) {
      throw new Error(`ProductCard: amount < 0!`);
    }
    if (!Number.isInteger(this.props.amount)) {
      throw new Error(`ProductCard: amount=${this.props.amount} must be int!`);
    }
    if (this.props.inCart && this.props.amount === 0) {
      // Предупреждение
      console.warn(`ProductCard: inCart=true, but amount=0. Now inCart=false!`);
      this.props.inCart = false;
    }
    if (this.props.inCart) {
      // Если карточка в корзине, то в price конечная сумма
      this.props.price *= this.props.amount;
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
    // Заполняем
    if (this.props.inCart) {
      // Карточка активного товара (в корзине)
      // кнопка минуса
      const minusButtonProps: QuantityButtonProps = {
        id: `${this.props.id}__minus-button`, // Id для идентификации
        text: '-', // text для отображения
        onSubmit: () => {
          console.log('-1');
        }, // Функция при нажатии
      };
      const minustButtonWrapper = this.self.querySelector(
        '.product-card__minus-button__wrapper',
      ) as HTMLElement;
      const minusButton = new QuantityButton(minustButtonWrapper, minusButtonProps);
      minusButton.render(); // рендерим кнопку минус
    }
    // Кнопка плюс
    const plusButtonProps: QuantityButtonProps = {
      id: `${this.props.id}__plus-button`, // Id для идентификации
      text: '+', // text для отображения
      onSubmit: () => {
        console.log('+1');
      }, // Функция при нажатии
    };
    const plusButtonWrapper = this.self.querySelector(
      '.product-card__plus-button__wrapper',
    ) as HTMLElement;
    const plusButton = new QuantityButton(plusButtonWrapper, plusButtonProps);
    plusButton.render(); // рендерим кнопку плюс
  }

  remove() {
    const element = this.self;
    const plusButton = document.getElementById(`${this.props.id}__minus-button`);
    plusButton.remove();
    const minusButton = document.getElementById(`${this.props.id}__plus-button`);
    minusButton.remove();
    element.remove();
  }
}
