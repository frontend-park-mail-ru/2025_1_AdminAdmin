import { createStore } from './store';
import { Product } from '@myTypes/restaurantTypes';
import { userStore } from '@store/userStore';
import { AppCartRequests } from '@modules/ajax';
import { getCart, setCart } from '@modules/localStorage';

interface OrderAction {
  type: string;
  payload?: any;
}

interface OrderProduct {
  product: Product;
  amount: number;
}

export interface OrderState {
  restaurantId: string | null;
  restaurantName: string | null;
  products: OrderProduct[];
  totalPrice: number;
}

const initialOrderState: OrderState = {
  restaurantId: null,
  restaurantName: null,
  products: [],
  totalPrice: 0,
};

const orderReducer = (state = initialOrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case OrderActions.ADD_PRODUCT:
    case OrderActions.REMOVE_PRODUCT:
    case OrderActions.SET_PRODUCT_AMOUNT:
      return {
        ...state,
        products: action.payload.products,
        totalPrice: action.payload.totalPrice,
      };

    case OrderActions.SET_RESTAURANT:
      return {
        ...state,
        restaurantId: action.payload.restaurantId,
        restaurantName: action.payload.restaurantName,
      };

    case OrderActions.CLEAR_ORDER:
      return initialOrderState;

    default:
      return state;
  }
};

export const OrderActions = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  SET_RESTAURANT: 'SET_RESTAURANT',
  SET_PRODUCT_AMOUNT: 'SET_PRODUCT_AMOUNT',
  CLEAR_ORDER: 'CLEAR_ORDER',
};

class OrderStore {
  private store;

  constructor() {
    this.store = createStore(orderReducer);

    const localCart = getCart();
    if (localCart && !userStore.isAuth()) {
      this.store.dispatch({
        type: OrderActions.SET_RESTAURANT,
        payload: {
          restaurantId: localCart.restaurantId,
          restaurantName: localCart.restaurantName,
        },
      });

      this.store.dispatch({
        type: OrderActions.ADD_PRODUCT,
        payload: {
          products: localCart.products,
          totalPrice: localCart.totalPrice,
        },
      });
    }
  }

  private calculateTotalPrice(products: OrderProduct[]): number {
    return products.reduce((sum, { product, amount }) => sum + product.price * amount, 0);
  }

  private addOrUpdateProduct(product: Product, amount: number): void {
    const state = this.store.getState();
    const existing = state.products.find((p) => p.product.id === product.id);
    if (existing) {
      this.setProductAmount(existing.product.id, existing.amount + amount);
    } else {
      this.addProduct(product);
    }
  }

  async addProduct(product: Product): Promise<void> {
    if (userStore.isAuth()) {
      try {
        await AppCartRequests.AddProduct(product.id);
      } catch (error) {
        console.error('Ошибка при добавлении продукта', error);
      }
    }

    const products = [...this.store.getState().products, { product, amount: 1 }];
    const totalPrice = this.calculateTotalPrice(products);

    this.store.dispatch({
      type: OrderActions.ADD_PRODUCT,
      payload: { products, totalPrice },
    });

    this.saveToLocalStorageIfGuest();
  }

  setRestaurant(restaurantId: string, restaurantName: string): void {
    this.store.dispatch({
      type: OrderActions.SET_RESTAURANT,
      payload: { restaurantId, restaurantName },
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
        await AppCartRequests.UpdateProductQuantity(productId, amount);
      } catch (error) {
        console.error('Ошибка при добавлении продукта', error);
      }
    }

    const updatedProducts = this.store
      .getState()
      .products.map((p) => (p.product.id === productId ? { ...p, amount } : p));

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.SET_PRODUCT_AMOUNT,
      payload: { products: updatedProducts, totalPrice },
    });

    this.saveToLocalStorageIfGuest();
  }

  async removeProduct(productId: string): Promise<void> {
    if (userStore.isAuth()) {
      try {
        await AppCartRequests.UpdateProductQuantity(productId, 0);
      } catch (error) {
        console.error('Ошибка при удалении продукта', error);
      }
    }

    const updatedProducts = this.store
      .getState()
      .products.filter((p) => p.product.id !== productId);

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.REMOVE_PRODUCT,
      payload: { products: updatedProducts, totalPrice },
    });

    this.saveToLocalStorageIfGuest();
  }

  clearOrder(): void {
    this.store.dispatch({
      type: OrderActions.CLEAR_ORDER,
    });

    this.saveToLocalStorageIfGuest();
  }

  getState(): OrderState {
    return this.store.getState();
  }

  getProductAmountById(productId: string): number {
    const product = this.store.getState().products.find((p) => p.product.id === productId);
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

export const orderStore = new OrderStore();
