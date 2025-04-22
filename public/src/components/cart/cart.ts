import template from './cart.hbs';
import { CartState, cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { router } from '@modules/routing';
import { CartProduct } from '@myTypes/cartTypes';
//import { toasts } from '@modules/toasts';
/**
 * Класс cart представляет компонент корзины.
 */
export default class Cart {
  private readonly parent: HTMLElement;
  private readonly restaurant_id: string;
  private container?: HTMLElement;
  private cartCards: Map<string, CartCard>;
  private unsubscribeFromStore: (() => void) | null = null;

  constructor(parent: HTMLElement, restaurantId: string) {
    this.parent = parent;
    this.restaurant_id = restaurantId;
    this.unsubscribeFromStore = cartStore.subscribe(this.updateCards);
    this.cartCards = new Map<string, CartCard>();
  }

  get self(): HTMLDivElement {
    return this.parent.querySelector('.cart');
  }

  private updateCards = () => {
    if (!this.container) return;

    const state: CartState = cartStore.getState();

    if (state.restaurant_id && state.restaurant_id !== this.restaurant_id) return;

    const products: CartProduct[] = state.products;
    const totalPrice: number = state.total_price;

    const currentProductIds = new Set(products.map((p) => p.id));

    for (const [id, card] of this.cartCards.entries()) {
      if (!currentProductIds.has(id)) {
        card.remove();
        this.cartCards.delete(id);
      }
    }

    for (const product of products) {
      if (!this.cartCards.has(product.id)) {
        const card = new CartCard(this.container, product);
        card.render();
        this.cartCards.set(product.id, card);
      }
    }

    const cartEmpty: HTMLDivElement = this.container.querySelector('.cart__empty');
    const cartFooter: HTMLDivElement = this.self.querySelector('.cart-footer');
    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = totalPrice.toLocaleString('ru-RU');

    if (!products.length) {
      cartEmpty.style.display = 'flex';
      cartFooter.classList.add('inactive');
      cartFooter.style.pointerEvents = 'none';
    } else {
      cartEmpty.style.display = 'none';
      cartFooter.classList.remove('inactive');
      cartFooter.style.pointerEvents = 'auto';
    }
  };

  private async handleClear(): Promise<void> {
    const bin = this.self.querySelector('.cart__header-right') as HTMLElement;
    bin.style.pointerEvents = 'none';
    //try {
    await cartStore.clearCart();
    /*    } catch (error) {
      toasts.error(error.error);
    } finally {*/
    bin.style.pointerEvents = '';
    //}
  }

  render(): void {
    this.parent.innerHTML = template();
    this.container = this.parent.querySelector('.cart__products_container') as HTMLElement;

    if (!this.container) {
      console.warn('Cart container (.cart__items) not found in template');
      return;
    }

    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) {
      cartFooter.addEventListener('click', this.handleClick.bind(this));
    }

    const bin = this.self.querySelector('.cart__header-right') as HTMLElement;
    if (bin) {
      bin.addEventListener('click', this.handleClear.bind(this));
    }

    this.updateCards();
  }

  handleClick(): void {
    const cartFooter = document.querySelector('.cart-footer');
    if (!cartFooter || cartFooter.classList.contains('inactive')) return;

    router.goToPage('orderPage');
  }

  remove(): void {
    const bin = this.self.querySelector('.cart__header-right') as HTMLElement;
    if (bin) {
      bin.removeEventListener('click', this.handleClear.bind(this));
    }

    this.cartCards.forEach((card) => card.remove());
    this.cartCards.clear();

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
