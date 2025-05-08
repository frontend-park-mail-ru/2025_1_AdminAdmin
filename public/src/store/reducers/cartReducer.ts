import { I_Cart } from '@myTypes/cartTypes';

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

export const CartActions = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  SET_RESTAURANT: 'SET_RESTAURANT',
  SET_PRODUCT_AMOUNT: 'SET_PRODUCT_AMOUNT',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
};

export const cartReducer = (state = initialCartState, action: CartAction): CartState => {
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
