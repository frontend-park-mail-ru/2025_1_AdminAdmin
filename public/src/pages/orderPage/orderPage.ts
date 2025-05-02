import template from './orderPage.hbs';
import { FormInput } from '@components/formInput/formInput';
import inputsConfig from './orderPageConfig';
import { cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { userStore } from '@store/userStore';
import { CartProduct } from '@myTypes/cartTypes';
import { toasts } from '@modules/toasts';
import { Button } from '@components/button/button';
import { AppOrderRequests } from '@modules/ajax';
import { CreateOrderPayload, I_OrderResponse } from '@myTypes/orderTypes';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';
import YouMoneyForm from '@components/youMoneyForm/youMoneyForm';
import { router } from '@modules/routing';

export default class OrderPage {
  private parent: HTMLElement;
  private readonly orderId: string;
  private inputs: Record<string, FormInput> = {};
  private cartCards = new Map<string, CartCard>();
  private submitButton: Button;
  private unsubscribeFromStore: (() => void) | null = null;
  private youMoneyForm: YouMoneyForm = null;
  private isRemoved = false;

  constructor(parent: HTMLElement, orderId?: string) {
    if (!parent) {
      throw new Error('OrderPage: no parent!');
    }
    this.parent = parent;
    this.orderId = orderId;
  }

  get self(): HTMLElement | null {
    const element = this.parent.querySelector('.order-page');
    return element as HTMLElement | null;
  }

  async render(): Promise<void> {
    let restaurantName, address;
    if (this.orderId) {
      try {
        const order = await AppOrderRequests.getOrderById(this.orderId);
        restaurantName = order.order_products.restaurant_name;
        address = order.address;
      } catch {
        router.goToPage('home');
        return;
      }
    } else {
      restaurantName = cartStore.getState().restaurant_name;
      address = userStore.getActiveAddress();
    }
    this.parent.innerHTML = template({ restaurantName: restaurantName, address: address });

    const inputsContainer = document.getElementById('form__line_order-page_address');

    if (inputsContainer) {
      for (const [key, config] of Object.entries(inputsConfig.addressInputs)) {
        const inputComponent = new FormInput(inputsContainer, config);
        inputComponent.render();

        this.inputs[key] = inputComponent;
      }
    } else {
      console.error('OrderPage: контейнер не найден');
    }

    const orderPageComment: HTMLDivElement = this.self.querySelector('.order-page__comment');
    if (orderPageComment) {
      const inputComponent = new FormInput(orderPageComment, inputsConfig.commentInput);
      inputComponent.render();

      this.inputs['orderPageComment'] = inputComponent;
    }

    const bin = this.self.querySelector('.order-page__products__header__clear');
    if (bin) {
      bin.addEventListener('click', this.handleClear);
    }

    const submitButtonContainer: HTMLDivElement = this.self.querySelector('.order-page__summary');
    if (submitButtonContainer) {
      if (userStore.isAuth()) {
        this.submitButton = new Button(submitButtonContainer, {
          id: 'order-page__submit__button',
          text: 'Оформить заказ',
          style: 'button_active',
          onSubmit: async () => {
            if (cartStore.getState().total_price > 100000) {
              toasts.error(
                'Сумма заказа не должна превышать 100 000 ₽. Разделите его на несколько',
              );
              return;
            }
            try {
              this.submitButton.disable();
              await this.sendOrder();
            } catch (error) {
              console.error(error);
              toasts.error(error.message);
            } finally {
              this.submitButton.enable();
            }
          },
        });
      } else {
        toasts.error('Для формирования заказа нужно авторизоваться');
        this.submitButton = new Button(submitButtonContainer, {
          id: 'order-page__submit__button',
          text: 'Авторизоваться',
          style: 'button_active',
          onSubmit: () => {
            router.goToPage('loginPage');
          },
        });
      }
      this.submitButton.render();
    }

    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateCards());
    this.updateCards();
    this.createProductCards();
  }

  private createProductCards(): void {
    this.updateTotalPrice();

    const container = this.self.querySelector('.order-page__products') as HTMLDivElement;
    if (!container) return;

    const state = cartStore.getState();
    for (const product of state.products) {
      const card = new CartCard(container, product);
      card.render();
      this.cartCards.set(product.id, card);
    }
  }

  private updateTotalPrice() {
    const totalPrice: number = cartStore.getState().total_price;

    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = totalPrice.toLocaleString('ru-RU');
  }

  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }
  }

  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  async sendOrder() {
    const formValues: Record<string, string> = {};

    this.clearError();

    for (const [key, input] of Object.entries(this.inputs)) {
      formValues[key] = input.value;
      const validationResult = input.checkValue();
      if (typeof input.checkValue() === 'string') {
        this.setError(validationResult.toString());
        return;
      }
    }

    const state = cartStore.getState();
    const final_price = state.total_price;
    const address = userStore.getActiveAddress();

    if (!address) {
      const mapModal = new MapModal(async (newAddress: string) => {
        userStore.setAddress(newAddress);
        modalController.closeModal();
        await this.sendOrder();
      });

      modalController.openModal(mapModal);
      return;
    }

    const checkbox = this.self.querySelector<HTMLInputElement>('.order-page__checkbox');
    const leaveAtDoor = checkbox?.checked ?? false;

    const payload: CreateOrderPayload = {
      status: 'new',
      address,
      apartment_or_office: formValues.flat,
      intercom: formValues.doorPhone,
      entrance: formValues.porch,
      floor: formValues.floor,
      courier_comment: formValues.orderPageComment,
      leave_at_door: leaveAtDoor,
      final_price,
    };

    try {
      const newOrder = await AppOrderRequests.CreateOrder(payload);
      toasts.success('Заказ успешно оформлен!');

      this.handleCreation(newOrder);
    } catch (err) {
      toasts.error(err.message || 'Не удалось оформить заказ');
    }
  }

  private handleCreation(newOrder: I_OrderResponse) {
    window.history.replaceState({}, '', `/order/${newOrder.id}`);

    const pageHeader: HTMLElement = this.parent.querySelector('.order-page__header');
    pageHeader.textContent = `Заказ №${newOrder.id}`;
    pageHeader.style.fontSize = '26px';

    for (const input of Object.values(this.inputs)) {
      input.disable();
    }

    for (const cartCard of this.cartCards.values()) {
      cartCard.disable();
    }

    const checkBox: HTMLInputElement = this.parent.querySelector('#checkbox');
    checkBox.disabled = true;
    checkBox.style.pointerEvents = 'none';

    const clearCart: HTMLDivElement = this.parent.querySelector(
      '.order-page__products__header__clear',
    );
    clearCart.style.display = 'none';
    this.submitButton.hide();
    const container: HTMLDivElement = this.self.querySelector('.order-page__summary');
    this.youMoneyForm = new YouMoneyForm(container, newOrder.final_price, newOrder.id);
    this.youMoneyForm.render();
  }

  private handleClear = async (): Promise<void> => {
    const bin: HTMLElement = this.self.querySelector('.order-page__products__header__clear');
    bin.style.pointerEvents = 'none';

    try {
      await cartStore.clearCart();
    } catch (error) {
      toasts.error(error.message);
    } finally {
      bin.style.pointerEvents = '';
    }
  };

  private updateCards(): void {
    if (this.isRemoved) return;
    const container: HTMLDivElement = this.self.querySelector('.order-page__products');
    if (!container) return;

    const products: CartProduct[] = cartStore.getState().products;

    this.updateTotalPrice();

    const currentIds = new Set(products.map((p) => p.id));

    for (const [id, card] of this.cartCards.entries()) {
      if (!currentIds.has(id)) {
        card.remove();
        this.cartCards.delete(id);
      }
    }

    if (!products.length) {
      setTimeout(() => {
        import('@modules/routing').then(({ router }) => {
          router.goToPage('home');
        });
      }, 0);
    }
  }

  remove(): void {
    if (!this.self) return;
    this.isRemoved = true;

    this.cartCards.forEach((card) => card.remove());
    this.cartCards.clear();

    const bin = this.self.querySelector('.order-page__products__header__clear');
    if (bin) {
      bin.removeEventListener('click', this.handleClear);
    }

    if (this.submitButton) {
      this.submitButton.remove();
    }

    if (this.youMoneyForm) {
      cartStore.clearLocalCart();
      this.youMoneyForm.remove();
    }

    Object.values(this.inputs).forEach((input) => input.remove());
    this.inputs = {};

    this.unsubscribeFromStore();
    this.parent.innerHTML = '';
  }
}
