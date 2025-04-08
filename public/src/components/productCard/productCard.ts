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
  private amount = -1;
  private unsubscribeFromStore: (() => void) | null = null;
  private minusButton: QuantityButton;
  private plusButton: QuantityButton;

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

    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    // Кнопка уменьшения количества
    const footerContainer = this.self.querySelector('.product-card__footer') as HTMLDivElement;

    this.minusButton = new QuantityButton(footerContainer, {
      id: `${this.props.id}__minus-button`,
      style: 'card-quantity-button',
      insert: 'afterbegin',
      isPlus: false,
      onSubmit: this.decrementAmount.bind(this),
    });

    this.minusButton.render();

    this.plusButton = new QuantityButton(footerContainer, {
      id: `${this.props.id}__plus-button`,
      style: 'card-quantity-button',
      isPlus: true,
      onSubmit: this.incrementAmount.bind(this),
    });

    this.plusButton.render();
    this.updateState();
  }

  private incrementAmount() {
    if (!orderStore.getState().totalPrice) {
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
    if (storeAmount === this.amount) {
      return;
    }

    this.amount = storeAmount;

    const footerContainer = this.self.querySelector(
      '.product-card__footer-container',
    ) as HTMLDivElement;

    const priceContainer = this.self.querySelector('.product-card__price') as HTMLDivElement;

    if (!this.amount) {
      this.self.classList.remove('active');
      this.minusButton.hide();
      footerContainer.style.display = 'none';
      priceContainer.style.display = 'block';
    } else {
      const amountValue = this.self.querySelector(
        '.product-card__amount .amount-value',
      ) as HTMLSpanElement;

      const totalPriceValue = this.self.querySelector(
        '.product-card__total-price .total-price-value',
      ) as HTMLDivElement;

      if (amountValue) {
        amountValue.textContent = this.amount.toString();
      }

      if (totalPriceValue) {
        totalPriceValue.textContent = (this.props.price * this.amount).toString();
      }

      this.self.classList.add('active');
      this.minusButton.show();
      footerContainer.style.display = 'flex';
      priceContainer.style.display = 'none';
    }
  }

  /**
   * Удаляет карточку товара
   */
  remove() {
    const element = this.self;
    this.minusButton.remove();
    this.plusButton.remove();
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    element.remove();
  }
}
