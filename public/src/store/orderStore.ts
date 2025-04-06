import { createStore } from './store';
import { Product } from '@myTypes/orderTypes';

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
      return {
        ...state,
        products: [...state.products, action.payload],
      };

    case OrderActions.REMOVE_PRODUCT:
      return {
        ...state,
        products: state.products.filter((p) => p.product.id !== action.payload),
      };

    case OrderActions.INCREMENT_PRODUCT_AMOUNT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.product.id === action.payload ? { ...p, amount: p.amount + 1 } : p,
        ),
      };

    case OrderActions.DECREMENT_PRODUCT_AMOUNT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.product.id === action.payload ? { ...p, amount: p.amount - 1 } : p,
        ),
      };

    case OrderActions.SET_RESTAURANT:
      return {
        ...state,
        restaurantId: action.payload.restaurantId,
        restaurantName: action.payload.restaurantName,
      };

    case OrderActions.SET_PRODUCT_AMOUNT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.product.id === action.payload.productId ? { ...p, amount: action.payload.amount } : p,
        ),
      };

    case OrderActions.UPDATE_TOTAL_PRICE:
      return {
        ...state,
        totalPrice: action.payload,
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
  UPDATE_TOTAL_PRICE: '__UPDATE_TOTAL_PRICE__',
};

class OrderStore {
  private store;

  constructor() {
    this.store = createStore(orderReducer);
  }

  /**
   * Добавляет товар в заказ, если его нет, или обновляет количество, если он уже есть
   */
  private addOrUpdateProduct(product: Product, amount: number): void {
    const existing = this.store.getState().products.find((p) => p.product.id === product.id);

    if (existing) {
      this.setProductAmount(product.id, existing.amount + amount);
    } else {
      this.addProduct(product, amount);
    }
  }

  /**
   * Добавляет товар в заказ
   */
  addProduct(product: Product, amount: number): void {
    this.store.dispatch({
      type: OrderActions.ADD_PRODUCT,
      payload: { product, amount },
    });
    this.recalculateTotalPrice();
  }

  /**
   * Устанавливает ресторан (id и имя)
   */
  setRestaurant(restaurantId: string, restaurantName: string): void {
    this.store.dispatch({
      type: OrderActions.SET_RESTAURANT,
      payload: { restaurantId, restaurantName },
    });
  }

  /**
   * Увеличивает количество товара на 1, если его нет в заказе, добавляет
   */
  incrementProductAmount(product: Product): void {
    this.addOrUpdateProduct(product, 1);
    this.recalculateTotalPrice();
  }

  /**
   * Уменьшает количество товара на 1, если его количество меньше 1, удаляет товар
   */
  decrementProductAmount(product: Product): void {
    const productId = product.id;
    const existing = this.store.getState().products.find((p) => p.product.id === productId);

    if (!existing) {
      return;
    }

    if (existing.amount <= 1) {
      this.removeProduct(productId);
    } else {
      this.setProductAmount(productId, existing.amount - 1);
    }
    this.recalculateTotalPrice();
  }

  /**
   * Устанавливает количество товара
   */
  setProductAmount(productId: string, amount: number): void {
    this.store.dispatch({
      type: OrderActions.SET_PRODUCT_AMOUNT,
      payload: { productId, amount },
    });
    this.recalculateTotalPrice();
  }

  /**
   * Удаляет товар из заказа
   */
  removeProduct(productId: string): void {
    this.store.dispatch({
      type: OrderActions.REMOVE_PRODUCT,
      payload: productId,
    });
    this.recalculateTotalPrice();
  }

  /**
   * Очищает заказ
   */
  clearOrder(): void {
    this.store.dispatch({
      type: OrderActions.CLEAR_ORDER,
    });
    this.recalculateTotalPrice();
  }

  /**
   * Получает состояние заказа
   */
  getState(): OrderState {
    return this.store.getState();
  }

  /**
   * Получает количество товара по его id
   */
  getProductAmountById(productId: string): number {
    const product = this.store.getState().products.find((p) => p.product.id === productId);
    return product ? product.amount : 0;
  }

  /**
   * Пересчитывает итоговую цену заказа
   */
  private recalculateTotalPrice(): void {
    const { products } = this.store.getState();
    const totalPrice = products.reduce(
      (sum, { product, amount }) => sum + product.price * amount,
      0,
    );

    this.store.dispatch({
      type: '__UPDATE_TOTAL_PRICE__',
      payload: totalPrice,
    });
  }

  /**
   * Подписывает listener на изменение состояния
   * @param {Function} listener
   */
  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}

export const orderStore = new OrderStore();
