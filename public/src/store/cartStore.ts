import { store } from './store';
import { Product } from '@myTypes/restaurantTypes';
import { userStore } from '@store/userStore';
import { AppCartRequests } from '@modules/ajax';
import {
  clearCartInLocalStorage,
  getCartFromLocalStorage,
  setCartInLocalStorage,
} from '@modules/localStorage';
import { CartProduct, I_Cart } from '@myTypes/cartTypes';
import { CartActions, CartState } from '@store/reducers/cartReducer';

const cartChannel = new BroadcastChannel('cart_channel');
const tabId = crypto.randomUUID();

type CartActionType = keyof typeof CartActions;

interface CartChannelEvent {
  data: {
    type: CartActionType;
    payload: any;
    sender: string;
  };
}

export const cartStore = {
  getState(): CartState {
    return store.getState().cartState;
  },

  startSyncAcrossTabs(): void {
    cartChannel.onmessage = (event: CartChannelEvent) => {
      const { type, payload, sender } = event.data;

      if (sender === tabId) return;

      store.dispatch({
        type: CartActions[type],
        payload: payload,
      });
    };
  },

  getProductAmountById(productId: string): number {
    const product = this.getState().products?.find((p: CartProduct) => p.id === productId);
    return product ? product.amount : 0;
  },

  subscribe(listener: () => void): () => void {
    return store.subscribe(listener);
  },

  async initCart(): Promise<void> {
    if (userStore.isAuth()) {
      try {
        const remoteCart = await AppCartRequests.GetCart();
        if (remoteCart && remoteCart.products) {
          this.setCart(remoteCart);
          clearCartInLocalStorage();
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }

    const localCart = getCartFromLocalStorage();
    if (!localCart) return;

    if (userStore.isAuth()) {
      for (const product of localCart.products) {
        try {
          await AppCartRequests.UpdateProductQuantity(
            product.id,
            product.amount,
            localCart.restaurant_id,
          );
        } catch (error) {
          console.error('Ошибка при создании корзины: ', error.message);
        }
      }
      clearCartInLocalStorage();
    }

    this.setCart(localCart);
  },

  calculateTotalPrice(products?: CartProduct[] | null): number {
    if (!Array.isArray(products)) return 0;
    return products.reduce((sum, { price, amount }) => sum + price * amount, 0);
  },

  setCart(cart: I_Cart): void {
    store.dispatch({
      type: CartActions.SET_CART,
      payload: cart,
    });

    cartChannel.postMessage({
      type: CartActions.SET_CART,
      sender: tabId,
      payload: cart,
    });
  },

  updateCartState(products: CartProduct[], actionType: string): void {
    const total_sum = this.calculateTotalPrice(products);
    store.dispatch({
      type: actionType,
      payload: { products, total_sum },
    });

    cartChannel.postMessage({
      type: actionType,
      sender: tabId,
      payload: { products, total_sum },
    });

    this.saveToLocalStorageIfGuest();
  },

  async syncProductWithServer(productId: string, amount: number): Promise<void> {
    const cart = await AppCartRequests.UpdateProductQuantity(
      productId,
      amount,
      this.getState().restaurant_id,
    );

    if (!cart || !Array.isArray(cart.products)) {
      this.clearLocalCart();
      return;
    }

    this.setCart(cart);
  },

  async addOrUpdateProduct(product: Product, amount: number): Promise<void> {
    const state = this.getState();
    const existing = state.products.find((p: CartProduct) => p.id === product.id);
    if (existing) {
      const newAmount = existing.amount + amount;
      if (newAmount > 0) await this.setProductAmount(existing.id, newAmount);
      else await this.removeProduct(existing.id);
    } else {
      await this.addProduct(product);
    }
  },

  async incrementProductAmount(product: Product): Promise<void> {
    await this.addOrUpdateProduct(product, 1);
  },

  async decrementProductAmount(product: Product): Promise<void> {
    await this.addOrUpdateProduct(product, -1);
  },

  async addProduct(product: Product): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(product.id, 1);
      return;
    }

    const products = [...this.getState().products, { ...product, amount: 1 }];
    this.updateCartState(products, CartActions.ADD_PRODUCT);
  },

  async setProductAmount(productId: string, amount: number): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(productId, amount);
      return;
    }

    const updatedProducts = this.getState().products.map((p: CartProduct) =>
      p.id === productId ? { ...p, amount } : p,
    );
    this.updateCartState(updatedProducts, CartActions.SET_PRODUCT_AMOUNT);
  },

  async removeProduct(productId: string): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(productId, 0);
      return;
    }

    const updatedProducts = this.getState().products.filter((p: CartProduct) => p.id !== productId);
    this.updateCartState(updatedProducts, CartActions.REMOVE_PRODUCT);
  },

  async clearCart(): Promise<void> {
    if (userStore.isAuth()) {
      await AppCartRequests.ClearCart();
    }

    this.clearLocalCart();
    this.saveToLocalStorageIfGuest();
  },

  clearLocalCart(): void {
    store.dispatch({ type: CartActions.CLEAR_CART });

    cartChannel.postMessage({
      type: CartActions.CLEAR_CART,
      sender: tabId,
    });
  },

  setRestaurant(restaurant_id: string, restaurant_name: string): void {
    store.dispatch({
      type: CartActions.SET_RESTAURANT,
      payload: { restaurant_id, restaurant_name },
    });

    cartChannel.postMessage({
      type: CartActions.SET_RESTAURANT,
      payload: { restaurant_id, restaurant_name },
      sender: tabId,
    });

    this.saveToLocalStorageIfGuest();
  },

  saveToLocalStorageIfGuest(): void {
    if (!userStore.isAuth()) {
      setCartInLocalStorage(this.getState());
    }
  },
};

cartStore.startSyncAcrossTabs();
