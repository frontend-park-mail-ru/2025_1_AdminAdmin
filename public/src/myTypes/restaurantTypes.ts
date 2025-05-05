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

export interface BaseRestaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  image_url: string;
}

export interface SearchRestaurant extends BaseRestaurant {
  products: Product[];
}

export interface Review {
  id: string;
  user: string;
  user_pic_path: string;
  review_text: string;
  rating: number;
  created_at: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  banner_url: string;
  reviews: Review[];
  address: string;
  rating: number;
  rating_count: number;
  working_mode: WorkingMode;
  delivery_time: DeliveryTime;
  tags: string[];
  categories: Category[] | null;
}
