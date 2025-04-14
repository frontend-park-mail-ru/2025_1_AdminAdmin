import { Product } from '@myTypes/restaurantTypes';

export interface CartProduct extends Product {
  amount: number;
}

export interface I_Cart {
  restaurant_id: string;
  restaurant_name: string;
  products: CartProduct[];
}
