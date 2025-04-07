import { QuantityButton } from '@components/quantityButton/quantityButton';
import template from './productCard.hbs';
import { orderStore } from '@store/orderStore';
import ModalController from '@modules/modalController';
import { ConfirmRestaurantModal } from '@components/confirmRestaurantModal/confirmRestaurantModal';
import { Product } from '@myTypes/restaurantTypes';

/**
 * Класс карточки товара
 */
export class ProductCard {
  private parent: HTMLElement;
  private readonly restaurantId: string;
  private readonly restaurantName: string;
  private readonly props: Product;
  private modalController: ModalController;
  private amount: number = 0;
  private unsubscribeFromStore: (() => void) | null = null;

  /**
   * Создает экземпляр карточки товара.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param restaurantId
   * @param restaurantName
   * @param {Object} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, restaurantId: string, restaurantName: string, props: Product) {
    if (!parent) {
      throw new Error('ProductCard: no parent!');
    }
    this.restaurantId = restaurantId;
    this.restaurantName = restaurantName;
    this.parent = parent;
    this.props = props;
    if (document.getElementById(this.props.id)) {
      throw new Error(`ProductCard: id=${this.props.id} is already in use!`);
    }
    if (this.props.price < 0 || this.props.weight < 0) {
      throw new Error('ProductCard: price, and weight must be non-negative values!');
    }
    this.unsubscribeFromStore = orderStore.subscribe(() => this.updateState());
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
    this.amount = orderStore.getProductAmountById(this.props.id);

    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    this.toggleState();

    // Кнопка уменьшения количества
    const minusButtonWrapper = this.self.querySelector(
      '.product-card__minus-button__wrapper',
    ) as HTMLElement;

    const minusButton = new QuantityButton(minusButtonWrapper, {
      id: `${this.props.id}__minus-button`,
      style: 'card-quantity-button',
      text: '−',
      onSubmit: this.decrementAmount.bind(this),
    });

    minusButton.render();

    // Кнопка увеличения количества
    const plusButtonWrapper = this.self.querySelector(
      '.product-card__plus-button__wrapper',
    ) as HTMLElement;
    const plusButton = new QuantityButton(plusButtonWrapper, {
      id: `${this.props.id}__plus-button`,
      style: 'card-quantity-button',
      text: '+',
      onSubmit: this.incrementAmount.bind(this),
    });

    plusButton.render();
  }

  private incrementAmount() {
    if (!orderStore.getState().restaurantId) {
      orderStore.setRestaurant(this.restaurantId, this.restaurantName);
    }

    if (orderStore.getState().restaurantId !== this.restaurantId) {
      this.modalController = new ModalController();
      const confirmRestaurantModal = new ConfirmRestaurantModal(
        this.restaurantName,
        orderStore.getState().restaurantName,
        this.onSubmit,
        this.onCancel,
      );
      this.modalController.openModal(confirmRestaurantModal);
    } else {
      orderStore.incrementProductAmount(this.props);
    }
  }

  private decrementAmount() {
    orderStore.decrementProductAmount(this.props);
  }

  private onSubmit = () => {
    orderStore.clearOrder();
    orderStore.setRestaurant(this.restaurantId, this.restaurantName);
    this.incrementAmount();
    this.modalController.closeModal();
  };

  private onCancel = () => {
    this.modalController.closeModal();
  };

  private updateState() {
    const storeAmount = orderStore.getProductAmountById(this.props.id);
    if (storeAmount != this.amount) {
      this.amount = storeAmount;
      this.toggleState();
    }
  }

  toggleState() {
    // Кнопка уменьшения количества
    const minusButtonWrapper = this.self.querySelector(
      '.product-card__minus-button__wrapper',
    ) as HTMLElement;

    const footerContainer: HTMLDivElement = this.self.querySelector(
      '.product-card__footer-container',
    );
    const priceContainer: HTMLDivElement = this.self.querySelector('.product-card__price');

    if (!this.amount) {
      this.self.classList.remove('active');
      minusButtonWrapper.style.display = 'none';
      footerContainer.style.display = 'none';
      priceContainer.style.display = 'block';
    } else {
      const amountContainer: HTMLDivElement = this.self.querySelector('.product-card__amount');
      const totalPriceContainer: HTMLDivElement = this.self.querySelector(
        '.product-card__total-price',
      );

      amountContainer.innerText = this.amount.toString() + ' шт';
      totalPriceContainer.innerText = (this.props.price * this.amount).toString() + ' ₽';

      this.self.classList.add('active');
      minusButtonWrapper.style.display = 'block';
      footerContainer.style.display = 'flex';
      priceContainer.style.display = 'none';
    }
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    const element = this.self;
    document.getElementById(`${this.props.id}__minus-button`)?.remove();
    document.getElementById(`${this.props.id}__plus-button`)?.remove();
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    element.remove();
  }
}
