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
import { router } from '@modules/routing';

export default class OrderPage {
  private parent: HTMLElement;
  private inputs: Record<string, FormInput> = {};
  private cartCards = new Map<string, CartCard>();
  private submitButton: Button;
  private unsubscribeFromStore: (() => void) | null = null;
  private youMoneyForm: YouMoneyForm = null;

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
      bin.addEventListener('click', this.handleClear);
    }

    const orderPageComment: HTMLDivElement = this.self.querySelector('.order-page__comment');
    if (orderPageComment) {
      const inputComponent = new FormInput(orderPageComment, inputsConfig.commentInput);
      inputComponent.render();

      this.inputs['orderPageComment'] = inputComponent;
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
              toasts.error(error);
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
      await AppOrderRequests.CreateOrder(payload);
      toasts.success('Заказ успешно оформлен!');

      const wrapper = this.self.querySelector('.order-page__body');
      wrapper?.classList.add('dimmed');

      this.submitButton.hide();
      const container: HTMLDivElement = this.self.querySelector('.order-page__summary');
      this.youMoneyForm = new YouMoneyForm(container, final_price);
      this.youMoneyForm.render();
    } catch (err) {
      toasts.error(err.message || 'Не удалось оформить заказ');
    }
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
    const container: HTMLDivElement = this.self.querySelector('.order-page__products');
    if (!container) return;

    const state: CartState = cartStore.getState();
    const products: CartProduct[] = state.products;

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

    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    this.parent.innerHTML = '';
  }
}
