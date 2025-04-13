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
