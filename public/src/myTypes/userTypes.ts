export interface User {
  description: string;
  first_name: string;
  id: string;
  last_name: string;
  login: string;
  path: string;
  phone_number: string;
  active_address: string;
  has_secret: boolean;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  login: string;
  password: string;
}

export interface UpdateUserPayload {
  description?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  password?: string;
}
