import { createStore } from './store';
import { Product } from '@myTypes/restaurantTypes';
import { userStore } from '@store/userStore';
import { AppCartRequests } from '@modules/ajax';
import {
  clearCartInLocalStorage,
  getCartFromLocalStorage,
  setCartInLocalStorage,
} from '@modules/localStorage';
import { CartProduct, I_Cart } from '@myTypes/cartTypes';

interface CartAction {
  type: string;
  payload?: any;
}

export interface CartState extends I_Cart {
  total_price: number;
}

const initialCartState: CartState = {
  restaurant_id: null,
  restaurant_name: null,
  products: [],
  total_price: 0,
};

const cartReducer = (state = initialCartState, action: CartAction): CartState => {
  switch (action.type) {
    case CartActions.ADD_PRODUCT:
    case CartActions.REMOVE_PRODUCT:
    case CartActions.SET_PRODUCT_AMOUNT:
      return {
        ...state,
        products: action.payload.products,
        total_price: action.payload.total_price,
      };

    case CartActions.SET_RESTAURANT:
      return {
        ...state,
        restaurant_id: action.payload.restaurant_id,
        restaurant_name: action.payload.restaurant_name,
      };

    case CartActions.CLEAR_CART:
      return initialCartState;

    case CartActions.SET_CART:
      return {
        restaurant_id: action.payload.restaurant_id,
        restaurant_name: action.payload.restaurant_name,
        products: action.payload.products,
        total_price: action.payload.total_price,
      };

    default:
      return state;
  }
};

export const CartActions = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  SET_RESTAURANT: 'SET_RESTAURANT',
  SET_PRODUCT_AMOUNT: 'SET_PRODUCT_AMOUNT',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
};

class CartStore {
  private store;

  constructor() {
    this.store = createStore(cartReducer);
  }

  async initCart() {
    this.clearLocalCart();

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
          console.error('Ошибка при создании корзины: ', error.error);
        }
      }
      clearCartInLocalStorage();
    }

    this.setCart(localCart);
  }

  private setCart(cart: I_Cart): void {
    this.store.dispatch({
      type: CartActions.SET_CART,
      payload: {
        ...cart,
        total_price: this.calculateTotalPrice(cart.products),
      },
    });
  }

  private updateCartState(products: CartProduct[], actionType: string): void {
    const total_price = this.calculateTotalPrice(products);

    this.store.dispatch({
      type: actionType,
      payload: { products, total_price },
    });

    this.saveToLocalStorageIfGuest();
  }

  private async syncProductWithServer(productId: string, amount: number): Promise<void> {
    const cart = await AppCartRequests.UpdateProductQuantity(
      productId,
      amount,
      this.getState().restaurant_id,
    );

    if (!cart || !Array.isArray(cart.products)) {
      this.store.dispatch({
        type: CartActions.CLEAR_CART,
      });

      return;
    }

    this.setCart(cart);
  }

  private calculateTotalPrice(products?: CartProduct[] | null): number {
    if (!Array.isArray(products)) return 0;

    return products.reduce((sum, { price, amount }) => sum + price * amount, 0);
  }

  private async addOrUpdateProduct(product: Product, amount: number): Promise<void> {
    const state = this.store.getState();
    const existing = state.products.find((p) => p.id === product.id);
    if (existing) {
      const newAmount = existing.amount + amount;
      if (newAmount > 0) await this.setProductAmount(existing.id, existing.amount + amount);
      else await this.removeProduct(existing.id);
    } else {
      await this.addProduct(product);
    }
  }

  setRestaurant(restaurant_id: string, restaurant_name: string): void {
    this.store.dispatch({
      type: CartActions.SET_RESTAURANT,
      payload: { restaurant_id, restaurant_name },
    });

    this.saveToLocalStorageIfGuest();
  }

  async incrementProductAmount(product: Product): Promise<void> {
    await this.addOrUpdateProduct(product, 1);
  }

  async decrementProductAmount(product: Product): Promise<void> {
    await this.addOrUpdateProduct(product, -1);
  }

  async addProduct(product: Product): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(product.id, 1);
      return;
    }

    const products = [...this.store.getState().products, { ...product, amount: 1 }];
    this.updateCartState(products, CartActions.ADD_PRODUCT);
  }

  async setProductAmount(productId: string, amount: number): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(productId, amount);
      return;
    }

    const updatedProducts = this.store
      .getState()
      .products.map((p) => (p.id === productId ? { ...p, amount } : p));
    this.updateCartState(updatedProducts, CartActions.SET_PRODUCT_AMOUNT);
  }

  async removeProduct(productId: string): Promise<void> {
    if (userStore.isAuth()) {
      await this.syncProductWithServer(productId, 0);
      return;
    }

    const updatedProducts = this.store.getState().products.filter((p) => p.id !== productId);
    this.updateCartState(updatedProducts, CartActions.REMOVE_PRODUCT);
  }

  async clearCart(): Promise<void> {
    if (userStore.isAuth()) {
      await AppCartRequests.ClearCart();
    }

    this.store.dispatch({
      type: CartActions.CLEAR_CART,
    });
    this.saveToLocalStorageIfGuest();
  }

  clearLocalCart() {
    this.store.dispatch({
      type: CartActions.CLEAR_CART,
    });
  }

  getState(): CartState {
    return this.store.getState();
  }

  getProductAmountById(productId: string): number {
    const product = this.store.getState().products?.find((p) => p.id === productId);
    return product ? product.amount : 0;
  }

  private saveToLocalStorageIfGuest(): void {
    if (!userStore.isAuth()) {
      setCartInLocalStorage(this.store.getState());
    }
  }

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}

export const cartStore = new CartStore();
await cartStore.initCart();
