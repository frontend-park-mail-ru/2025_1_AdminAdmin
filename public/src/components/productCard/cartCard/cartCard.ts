import template from './cartCard.hbs';
import { cartStore } from '@store/cartStore';
import { QuantityControls } from '@components/quantityControls/quantityControls';
import { CartProduct } from '@myTypes/cartTypes';
import { toasts } from '@modules/toasts';

/**
 * Класс карточки товара
 */
export class CartCard {
  private parent: HTMLElement;
  private readonly props: CartProduct;
  private quantityControls: QuantityControls;
  private binClickHandler: () => void;
  private unsubscribeFromStore: (() => void) | null = null;

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
    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateState());
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

    const total_price = (this.props.amount * this.props.price).toLocaleString('ru-RU');
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

  private async incrementAmount() {
    if (this.props.amount === 999) {
      return;
    }
    try {
      await cartStore.incrementProductAmount(this.props);
    } catch (error) {
      toasts.error(error.error);
    }
  }

  private async decrementAmount() {
    try {
      await cartStore.decrementProductAmount(this.props);
    } catch (error) {
      toasts.error(error.error);
    }
  }

  private async setAmount(amount: number) {
    if (amount !== this.props.amount) {
      try {
        await cartStore.setProductAmount(this.props.id, amount);
      } catch (error) {
        toasts.error(error.error);
      }
    }
  }

  private updateState() {
    const storeAmount = cartStore.getProductAmountById(this.props.id);
    if (storeAmount === this.props.amount) {
      return;
    }

    this.props.amount = storeAmount;
    this.input.value = storeAmount.toString();

    const totalPriceValue = this.self.querySelector(
      '.cart-card__content__total_price',
    ) as HTMLDivElement;
    const total = this.props.price * this.props.amount;
    totalPriceValue.textContent = total.toLocaleString('ru-RU');
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    this.quantityControls.remove();

    const binIcon = this.self.querySelector('.cart-card__bin_icon') as HTMLElement;
    binIcon.removeEventListener('click', this.binClickHandler);

    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    const element = this.self;
    element.remove();
  }
}
