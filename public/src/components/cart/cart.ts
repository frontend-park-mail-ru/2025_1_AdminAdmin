import template from './cart.hbs';
import { CartState, cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { router } from '@modules/routing';
import { CartProduct } from '@myTypes/cartTypes';
/**
 * Класс cart представляет компонент корзины.
 */
export default class Cart {
  private readonly parent: HTMLElement;
  private readonly restaurant_id: string;
  private container?: HTMLElement;
  private cartCards: CartCard[] = [];
  private unsubscribeFromStore: (() => void) | null = null;

  constructor(parent: HTMLElement, restaurantId: string) {
    this.parent = parent;
    this.restaurant_id = restaurantId;
    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateCards());
  }

  get self(): HTMLDivElement {
    return this.parent.querySelector('.cart');
  }

  private updateCards(): void {
    if (!this.container) return;

    if (
      cartStore.getState().restaurant_id &&
      cartStore.getState().restaurant_id !== this.restaurant_id
    )
      return;

    const state: CartState = cartStore.getState();
    const products: CartProduct[] = state.products;
    const totalPrice: number = state.total_price;

    this.cartCards.forEach((card) => card.remove());
    this.cartCards = [];

    const cartEmpty: HTMLDivElement = this.container.querySelector('.cart__empty');
    const cartFooter: HTMLDivElement = this.self.querySelector('.cart-footer');
    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = totalPrice.toString();

    if (!products.length) {
      cartEmpty.style.display = 'flex';
      cartFooter.classList.add('inactive');
    } else {
      cartEmpty.style.display = 'none';
      cartFooter.classList.remove('inactive');
    }

    products.forEach((product) => {
      const card = new CartCard(this.container, product);
      card.render();
      this.cartCards.push(card);
    });
  }

  private handleClear(): void {
    cartStore.clearCart();
  }

  render(): void {
    this.parent.innerHTML = template();
    this.container = this.parent.querySelector('.cart__products_container') as HTMLElement;

    if (!this.container) {
      console.warn('Cart container (.cart__items) not found in template');
      return;
    }

    this.updateCards();
    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) {
      cartFooter.addEventListener('click', this.handleClick.bind(this));
    }

    const bin = this.self.querySelector('.cart__header-right') as HTMLElement;
    if (bin) {
      bin.addEventListener('click', this.handleClear.bind(this));
    }
  }

  handleClick(): void {
    router.goToPage('orderPage');
  }

  remove(): void {
    const bin = this.self.querySelector('.cart__header-right') as HTMLElement;
    if (bin) {
      bin.removeEventListener('click', this.handleClear.bind(this));
    }

    this.cartCards.forEach((card) => card.remove());
    this.cartCards = [];

    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) {
      cartFooter.removeEventListener('click', this.handleClick.bind(this));
    }

    this.container?.remove();
    this.container = undefined;
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
  }
}
