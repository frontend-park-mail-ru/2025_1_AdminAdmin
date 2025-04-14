import template from './orderPage.hbs';
import { FormInput } from '@components/formInput/formInput';
import inputsConfig from './orderPageConfig';
import { CartState, cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { userStore } from '@store/userStore';
import { CartProduct } from '@myTypes/cartTypes';
import { toasts } from '@modules/toasts';
import { Button } from '@components/button/button';
import { AppOrderRequests } from '@modules/ajax';
import { CreateOrderPayload } from '@myTypes/orderTypes';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';
import YouMoneyForm from '@components/youMoneyForm/youMoneyForm';

export default class OrderPage {
  private parent: HTMLElement;
  private inputs: Record<string, FormInput> = {};
  private cartCards: CartCard[] = [];
  private submitButton: Button;
  private unsubscribeFromStore: (() => void) | null = null;
  private youMoneyForm: YouMoneyForm;

  constructor(parent: HTMLElement) {
    if (!parent) {
      throw new Error('OrderPage: no parent!');
    }
    this.parent = parent;
  }

  get self(): HTMLElement {
    const element = this.parent.querySelector('.order-page');
    if (!element) {
      throw new Error(`OrderPage не найдена!`);
    }
    return element as HTMLElement;
  }

  render(): void {
    const restaurantName = cartStore.getState().restaurant_name;
    const address = userStore.getActiveAddress();
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

    const bin = this.self.querySelector('.order-page__products__header__clear');
    if (bin) {
      bin.addEventListener('click', this.handleClear.bind(this));
    }

    const orderPageComment: HTMLDivElement = this.self.querySelector('.order-page__comment');
    if (orderPageComment) {
      const inputComponent = new FormInput(orderPageComment, inputsConfig.commentInput);
      inputComponent.render();

      this.inputs['orderPageComment'] = inputComponent;
    }

    const submitButtonContainer: HTMLDivElement = this.self.querySelector('.order-page__summary');
    if (submitButtonContainer) {
      this.submitButton = new Button(submitButtonContainer, {
        id: 'order-page__submit__button',
        text: 'Оформить заказ',
        style: 'button_active',
        onSubmit: async () => {
          try {
            this.submitButton.disable();
            await this.sendOrder();
          } catch (error) {
            console.error(error);
            toasts.error(error);
          } finally {
            this.submitButton.enable();
          }
        },
      });
    }

    this.submitButton.render();

    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateCards());
    this.updateCards();
  }

  async sendOrder() {
    const formValues: Record<string, string> = {};

    for (const [key, input] of Object.entries(this.inputs)) {
      formValues[key] = input.value;
      if (!input.checkValue()) {
        return;
      }
    }

    const state = cartStore.getState();
    const final_price = state.total_price;
    const address = userStore.getActiveAddress();

    if (!address) {
      const mapModal = new MapModal((newAddress: string) => userStore.setAddress(newAddress));
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
      await AppOrderRequests.CreateOrder(payload);
      toasts.success('Заказ успешно оформлен!');

      this.submitButton.hide();
      const container: HTMLDivElement = this.self.querySelector('.order-page__summary');
      this.youMoneyForm = new YouMoneyForm(container, final_price);
      this.youMoneyForm.render();
    } catch (err) {
      toasts.error(err.message || 'Не удалось оформить заказ');
    }
  }

  private async handleClear(): Promise<void> {
    const bin: HTMLElement = this.self.querySelector('.order-page__products__header__clear');
    bin.style.pointerEvents = 'none';

    try {
      await cartStore.clearCart();
    } catch (error) {
      toasts.error(error.message);
    } finally {
      bin.style.pointerEvents = '';
    }
  }

  private updateCards(): void {
    const container: HTMLDivElement = this.self.querySelector('.order-page__products');
    if (!container) {
      return;
    }

    const state: CartState = cartStore.getState();
    const products: CartProduct[] = state.products;
    const totalPrice: number = state.total_price;

    this.cartCards.forEach((card) => card.remove());
    this.cartCards = [];

    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = totalPrice.toString();

    if (!products.length) {
      setTimeout(() => {
        import('@modules/routing').then(({ router }) => {
          router.goToPage('home');
        });
      }, 0);
      return;
    }

    products.forEach((product) => {
      const card = new CartCard(container, product);
      card.render();
      this.cartCards.push(card);
    });
  }

  remove(): void {
    this.cartCards.forEach((card) => card.remove());
    this.cartCards = [];

    const bin = this.self.querySelector('.order-page__products__header__clear');
    if (bin) {
      bin.removeEventListener('click', this.handleClear.bind(this));
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

    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    this.parent.innerHTML = '';
  }
}
