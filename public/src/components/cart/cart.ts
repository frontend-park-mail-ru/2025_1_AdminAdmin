import template from './cart.hbs';
import { orderStore } from '@store/orderStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { router } from '@modules/routing';
/**
 * Класс cart представляет компонент корзины.
 */
export default class Cart {
  private readonly parent: HTMLElement;
  private readonly restaurantId: string;
  private container?: HTMLElement;
  private cartCards: CartCard[] = [];
  private unsubscribeFromStore: (() => void) | null = null;

  constructor(parent: HTMLElement, restaurantId: string) {
    this.parent = parent;
    this.restaurantId = restaurantId;
    this.unsubscribeFromStore = orderStore.subscribe(() => this.updateCards());
  }

  get self(): HTMLDivElement {
    return this.parent.querySelector('.cart');
  }

  private updateCards(): void {
    if (!this.container) return;

    if (
      orderStore.getState().restaurantId &&
      orderStore.getState().restaurantId !== this.restaurantId
    )
      return;

    const state = orderStore.getState();
    const products = state.products;
    const totalPrice = state.totalPrice;

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

    products.forEach(({ product, amount }) => {
      const card = new CartCard(this.container, product, amount);
      card.render();
      this.cartCards.push(card);
    });
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
  }

  handleClick(): void {
    router.goToPage('orderPage');
  }

  remove(): void {
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
