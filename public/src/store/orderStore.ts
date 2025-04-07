import { createStore } from './store';
import { Product } from '@myTypes/restaurantTypes';
import { userStore } from '@store/userStore';

interface OrderAction {
  type: string;
  payload?: any;
}

interface OrderProduct {
  product: Product;
  amount: number;
}

interface OrderState {
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
  INCREMENT_PRODUCT_AMOUNT: 'INCREMENT_PRODUCT_AMOUNT',
  DECREMENT_PRODUCT_AMOUNT: 'DECREMENT_PRODUCT_AMOUNT',
  SET_RESTAURANT: 'SET_RESTAURANT',
  SET_PRODUCT_AMOUNT: 'SET_PRODUCT_AMOUNT',
  CLEAR_ORDER: 'CLEAR_ORDER',
};

class OrderStore {
  private store;

  constructor() {
    this.store = createStore(orderReducer);
  }

  private calculateTotalPrice(products: OrderProduct[]): number {
    return products.reduce((sum, { product, amount }) => sum + product.price * amount, 0);
  }

  private addOrUpdateProduct(product: Product, amount: number): void {
    const state = this.store.getState();
    const existing = state.products.find((p) => p.product.id === product.id);

    let updatedProducts: OrderProduct[];
    if (existing) {
      updatedProducts = state.products.map((p) =>
        p.product.id === product.id ? { ...p, amount: p.amount + amount } : p,
      );
    } else {
      updatedProducts = [...state.products, { product, amount }];
    }

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.ADD_PRODUCT,
      payload: { products: updatedProducts, totalPrice },
    });
  }

  addProduct(product: Product, amount: number): void {
    const products = [...this.store.getState().products, { product, amount }];
    const totalPrice = this.calculateTotalPrice(products);

    this.store.dispatch({
      type: OrderActions.ADD_PRODUCT,
      payload: { products, totalPrice },
    });
  }

  setRestaurant(restaurantId: string, restaurantName: string): void {
    this.store.dispatch({
      type: OrderActions.SET_RESTAURANT,
      payload: { restaurantId, restaurantName },
    });
  }

  incrementProductAmount(product: Product): void {
    this.addOrUpdateProduct(product, 1);
  }

  decrementProductAmount(product: Product): void {
    const state = this.store.getState();
    const productId = product.id;
    const existing = state.products.find((p) => p.product.id === productId);

    if (!existing) return;

    let updatedProducts: OrderProduct[];
    if (existing.amount <= 1) {
      updatedProducts = state.products.filter((p) => p.product.id !== productId);
    } else {
      updatedProducts = state.products.map((p) =>
        p.product.id === productId ? { ...p, amount: p.amount - 1 } : p,
      );
    }

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.REMOVE_PRODUCT,
      payload: { products: updatedProducts, totalPrice },
    });
  }

  setProductAmount(productId: string, amount: number): void {
    if (amount === 0) {
      this.removeProduct(productId);
      return;
    }
    const updatedProducts = this.store
      .getState()
      .products.map((p) => (p.product.id === productId ? { ...p, amount } : p));

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.SET_PRODUCT_AMOUNT,
      payload: { products: updatedProducts, totalPrice },
    });
  }

  removeProduct(productId: string): void {
    const updatedProducts = this.store
      .getState()
      .products.filter((p) => p.product.id !== productId);

    const totalPrice = this.calculateTotalPrice(updatedProducts);

    this.store.dispatch({
      type: OrderActions.REMOVE_PRODUCT,
      payload: { products: updatedProducts, totalPrice },
    });
  }

  clearOrder(): void {
    this.store.dispatch({
      type: OrderActions.CLEAR_ORDER,
    });
  }

  getState(): OrderState {
    return this.store.getState();
  }

  getProductAmountById(productId: string): number {
    const product = this.store.getState().products.find((p) => p.product.id === productId);
    return product ? product.amount : 0;
  }

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}

export const orderStore = new OrderStore();
