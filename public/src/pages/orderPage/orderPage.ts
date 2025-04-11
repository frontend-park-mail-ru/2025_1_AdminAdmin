import template from './orderPage.hbs';
import { FormInput } from '@components/formInput/formInput';
import inputsConfig from './orderPageConfig';
import { CartState, cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { userStore } from '@store/userStore';
import { CartProduct } from '@myTypes/cartTypes';

export default class OrderPage {
  private parent: HTMLElement;
  private inputs: Record<string, FormInput> = {};
  private cartCards: CartCard[] = [];
  private unsubscribeFromStore: (() => void) | null = null;

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

    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateCards());
    this.updateCards();
  }

  private handleClear(): void {
    cartStore.clearCart();
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

    Object.values(this.inputs).forEach((input) => input.remove());
    this.inputs = {};

    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
    this.parent.innerHTML = '';
  }
}
