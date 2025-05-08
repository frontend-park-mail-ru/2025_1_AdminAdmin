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

export const cartStore = {
  getState(): CartState {
    return store.getState().cartState;
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
      payload: {
        ...cart,
        total_price: this.calculateTotalPrice(cart.products),
      },
    });
  },

  updateCartState(products: CartProduct[], actionType: string): void {
    const total_price = this.calculateTotalPrice(products);
    store.dispatch({
      type: actionType,
      payload: { products, total_price },
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
      store.dispatch({ type: CartActions.CLEAR_CART });
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

    store.dispatch({ type: CartActions.CLEAR_CART });
    this.saveToLocalStorageIfGuest();
  },

  clearLocalCart(): void {
    store.dispatch({ type: CartActions.CLEAR_CART });
  },

  setRestaurant(restaurant_id: string, restaurant_name: string): void {
    store.dispatch({
      type: CartActions.SET_RESTAURANT,
      payload: { restaurant_id, restaurant_name },
    });

    this.saveToLocalStorageIfGuest();
  },

  saveToLocalStorageIfGuest(): void {
    if (!userStore.isAuth()) {
      setCartInLocalStorage(this.getState());
    }
  },
};
