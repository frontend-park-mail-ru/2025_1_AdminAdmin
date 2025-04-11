import template from './cartCard.hbs';
import { cartStore } from '@store/cartStore';
import { QuantityControls } from '@components/quantityControls/quantityControls';
import { CartProduct } from '@myTypes/cartTypes';

/**
 * Класс карточки товара
 */
export class CartCard {
  private parent: HTMLElement;
  private readonly props: CartProduct;
  private quantityControls: QuantityControls;
  private binClickHandler: () => void;

  /**
   * Создает экземпляр карточки товара.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: CartProduct) {
    if (!parent) {
      throw new Error('CartCard: no parent!');
    }
    this.parent = parent;
    this.props = props;
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

    this.props.amount = cartStore.getProductAmountById(this.props.id);

    const total_price = this.props.amount * this.props.price;
    const html = template({ total_price: total_price, ...this.props });
    this.parent.insertAdjacentHTML('beforeend', html);

    const quantityControlsWrapper: HTMLDivElement = this.self.querySelector(
      '.cart-card__content__quantity-controls-wrapper',
    );
    this.quantityControls = new QuantityControls(
      quantityControlsWrapper,
      this.props.id,
      this.props.amount,
      this.incrementAmount.bind(this),
      this.decrementAmount.bind(this),
      this.setAmount.bind(this),
    );

    this.quantityControls.render();

    const binIcon = this.self.querySelector('.cart-card__bin_icon') as HTMLElement;
    this.binClickHandler = () => cartStore.removeProduct(this.props.id);
    binIcon.addEventListener('click', this.binClickHandler);
  }

  get input(): HTMLInputElement {
    const element = this.self.querySelector('input');
    if (!element) {
      throw new Error(`Не найден инпут`);
    }
    return element;
  }

  private incrementAmount() {
    cartStore.incrementProductAmount(this.props);
  }

  private decrementAmount() {
    cartStore.decrementProductAmount(this.props);
  }

  private setAmount(amount: number) {
    if (amount !== this.props.amount) {
      cartStore.setProductAmount(this.props.id, amount);
    }
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    this.quantityControls.remove();

    const binIcon = this.self.querySelector('.cart-card__bin_icon') as HTMLElement;
    binIcon.removeEventListener('click', this.binClickHandler);

    const element = this.self;
    element.remove();
  }
}
