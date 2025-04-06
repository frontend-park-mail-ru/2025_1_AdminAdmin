import { QuantityButton, QuantityButtonProps } from '@components/quantityButton/quantityButton';
import template from './cartCard.hbs';
import { orderStore } from '@store/orderStore';
import ModalController from '@modules/modalController';
import { ConfirmRestaurantModal } from '@components/confirmRestaurantModal/confirmRestaurantModal';
import { Product } from '@myTypes/orderTypes';

/**
 * Класс карточки товара
 */
export class CartCard {
  private parent: HTMLElement;
  private readonly props: Product;
  private amount: number = 0;

  /**
   * Создает экземпляр карточки товара.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   * @param amount
   */
  constructor(parent: HTMLElement, props: Product, amount: number) {
    if (!parent) {
      throw new Error('CartCard: no parent!');
    }
    this.parent = parent;
    this.props = props;
    this.amount = amount;
    if (this.props.price < 0 || this.props.weight < 0) {
      throw new Error('CartCard: price, and weight must be non-negative values!');
    }
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(`cart-card-${this.props.id}`);
    if (!element) {
      throw new Error(`Не найдена карточка cart-card-${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает карточку товара на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: cartCard template not found');
    }

    this.amount = orderStore.getProductAmountById(this.props.id);

    const total_price = this.amount * this.props.price;
    const html = template({ total_price: total_price, ...this.props });
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  private incrementAmount() {
    orderStore.incrementProductAmount(this.props);
  }

  private decrementAmount() {
    orderStore.decrementProductAmount(this.props);
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    const element = this.self;
    element.remove();
  }
}
