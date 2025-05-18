import { I_Cart } from '@myTypes/cartTypes';

export interface CreateOrderPayload {
  status: 'new';
  address: string;
  apartment_or_office?: string;
  intercom?: string;
  entrance?: string;
  floor?: string;
  courier_comment?: string;
  leave_at_door?: boolean;
  final_price: number;
}

export interface I_OrderResponse {
  id: string;
  user: string;
  status: 'new' | 'processing' | 'delivered' | 'cancelled';
  address: string;
  apartment_or_office: string;
  intercom: string;
  entrance: string;
  floor: string;
  courier_comment: string;
  leave_at_door: boolean;
  created_at: string;
  final_price: number;
  order_products: I_Cart;
}

export interface I_UserOrderResponse {
  orders: I_OrderResponse[];
  total: number;
}
export const statusMap: Record<string, { step_no: number; text?: string }> = {
  creation: {
    step_no: -1,
  },
  new: {
    step_no: 0,
    text: 'Оформлен',
  },
  paid: {
    step_no: 1,
    text: 'Оплачен',
  },
  in_delivery: {
    step_no: 2,
    text: 'В пути',
  },
  delivered: {
    step_no: 3,
    text: 'Вручен',
  },
};
