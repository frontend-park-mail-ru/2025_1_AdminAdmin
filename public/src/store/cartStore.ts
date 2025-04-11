import { createStore } from './store';
import { Product } from '@myTypes/restaurantTypes';
import { userStore } from '@store/userStore';
import { AppCartRequests } from '@modules/ajax';
import { getCart, setCart } from '@modules/localStorage';
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
};

class CartStore {
  private store;

  constructor() {
    this.store = createStore(cartReducer);
    userStore.subscribe(this.loadSendCart.bind(this));
  }

  async init() {
    const localCart = getCart();
    if (!localCart) return;

    this.store.dispatch({
      type: CartActions.SET_RESTAURANT,
      payload: {
        restaurant_id: localCart.restaurant_id,
        restaurant_name: localCart.restaurant_name,
      },
    });

    this.store.dispatch({
      type: CartActions.ADD_PRODUCT,
      payload: {
        products: localCart.products,
        total_price: localCart.total_price,
      },
    });
  }

  async loadSendCart() {
    if (userStore.isAuth()) {
      try {
        const remoteCart = await AppCartRequests.GetCart();
        if (remoteCart) {
          this.store.dispatch({
            type: CartActions.SET_RESTAURANT,
            payload: {
              restaurant_id: remoteCart.restaurant_id,
              restaurant_name: remoteCart.restaurant_name,
            },
          });

          this.store.dispatch({
            type: CartActions.ADD_PRODUCT,
            payload: {
              products: remoteCart.products,
              total_price: this.calculatetotal_price(remoteCart.products),
            },
          });
          return;
        }
      } catch (error) {
        console.error('Ошибка при получении корзины', error);
      }

      const localCart = getCart();
      if (!localCart) return;

      if (userStore.isAuth()) {
        for (const product of localCart.products) {
          await AppCartRequests.UpdateProductQuantity(
            product.id,
            product.amount,
            localCart.restaurant_id,
          );
        }
      }
    } else {
      this.store.dispatch({
        type: CartActions.CLEAR_CART,
      });

      this.saveToLocalStorageIfGuest();
    }
  }

  private calculatetotal_price(products: CartProduct[]): number {
    return products.reduce((sum, product) => sum + product.price * product.amount, 0);
  }

  private addOrUpdateProduct(product: Product, amount: number): void {
    const state = this.store.getState();
    const existing = state.products.find((p) => p.id === product.id);
    if (existing) {
      this.setProductAmount(existing.id, existing.amount + amount);
    } else {
      this.addProduct(product);
    }
  }

  async addProduct(product: Product): Promise<void> {
    if (userStore.isAuth()) {
      try {
        await AppCartRequests.UpdateProductQuantity(product.id, 1, this.getState().restaurant_id);
      } catch (error) {
        console.error('Ошибка при добавлении продукта', error);
      }
    }

    const products = [...this.store.getState().products, { ...product, amount: 1 }];
    const total_price = this.calculatetotal_price(products);

    this.store.dispatch({
      type: CartActions.ADD_PRODUCT,
      payload: { products, total_price },
    });

    this.saveToLocalStorageIfGuest();
  }

  setRestaurant(restaurant_id: string, restaurant_name: string): void {
    this.store.dispatch({
      type: CartActions.SET_RESTAURANT,
      payload: { restaurant_id, restaurant_name },
    });

    this.saveToLocalStorageIfGuest();
  }

  incrementProductAmount(product: Product): void {
    this.addOrUpdateProduct(product, 1);
  }

  decrementProductAmount(product: Product): void {
    this.addOrUpdateProduct(product, -1);
  }

  async setProductAmount(productId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      this.removeProduct(productId);
      return;
    }

    if (userStore.isAuth()) {
      try {
        await AppCartRequests.UpdateProductQuantity(
          productId,
          amount,
          this.getState().restaurant_id,
        );
      } catch (error) {
        console.error('Ошибка при изменении количества продукта', error);
      }
    }

    const updatedProducts = this.store
      .getState()
      .products.map((p) => (p.id === productId ? { ...p, amount } : p));

    const total_price = this.calculatetotal_price(updatedProducts);

    this.store.dispatch({
      type: CartActions.SET_PRODUCT_AMOUNT,
      payload: { products: updatedProducts, total_price },
    });

    this.saveToLocalStorageIfGuest();
  }

  async removeProduct(productId: string): Promise<void> {
    if (userStore.isAuth()) {
      try {
        await AppCartRequests.UpdateProductQuantity(productId, 0, this.getState().restaurant_id);
      } catch (error) {
        console.error('Ошибка при удалении продукта', error);
      }
    }

    const updatedProducts = this.store.getState().products.filter((p) => p.id !== productId);

    const total_price = this.calculatetotal_price(updatedProducts);

    this.store.dispatch({
      type: CartActions.REMOVE_PRODUCT,
      payload: { products: updatedProducts, total_price },
    });

    this.saveToLocalStorageIfGuest();
  }

  clearCart(): void {
    this.store.dispatch({
      type: CartActions.CLEAR_CART,
    });

    this.saveToLocalStorageIfGuest();
  }

  getState(): CartState {
    return this.store.getState();
  }

  getProductAmountById(productId: string): number {
    const product = this.store.getState().products.find((p) => p.id === productId);
    return product ? product.amount : 0;
  }

  private saveToLocalStorageIfGuest(): void {
    if (!userStore.isAuth()) {
      setCart(this.store.getState());
    }
  }

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}

export const cartStore = new CartStore();
cartStore.init();
