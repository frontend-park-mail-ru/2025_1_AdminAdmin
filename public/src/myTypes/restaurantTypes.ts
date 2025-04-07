export interface WorkingMode {
  from: number;
  to: number;
}

export interface DeliveryTime {
  from: number;
  to: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  weight: number;
}

export interface Category {
  name: string;
  products: Product[];
}

export interface RestaurantResponse {
  id: string;
  name: string;
  banner_url: string;
  address: string;
  rating: number;
  rating_count: number;
  working_mode: WorkingMode;
  delivery_time: DeliveryTime;
  tags: string[];
  categories: Category[] | null;
}
