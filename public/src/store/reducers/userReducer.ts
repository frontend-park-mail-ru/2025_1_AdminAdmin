import { User } from '@myTypes/userTypes';
import { getActiveFromLocalStorage } from '@modules/localStorage';

export interface UserState extends User {
  isAuth: boolean;
  activePromoCode: string;
}

interface Action {
  type: string;
  payload?: any;
}

const initialUserState: UserState = {
  id: '',
  login: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  path: '',
  description: '',
  has_secret: false,
  isAuth: false,
  active_address: getActiveFromLocalStorage('Address'),
  activePromoCode: getActiveFromLocalStorage('Promocode'),
};

/* eslint-disable complexity */

export const userReducer = (state = initialUserState, action: Action): UserState => {
  switch (action.type) {
    case UserActions.LOGIN_SUCCESS:
    case UserActions.REGISTER_SUCCESS:
    case UserActions.CHECK_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isAuth: true,
      };

    case UserActions.LOGOUT_SUCCESS:
      return {
        ...initialUserState,
        active_address: '',
      };

    case UserActions.SET_ADDRESS:
      return {
        ...state,
        active_address: action.payload,
      };

    case UserActions.SET_PROMOCODE:
      return {
        ...state,
        activePromoCode: action.payload,
      };

    case UserActions.UPDATE_USER_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case UserActions.SET_SECRET:
      return {
        ...state,
        has_secret: action.payload,
      };

    default:
      return state;
  }
};

export const UserActions = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  CHECK_SUCCESS: 'CHECK_SUCCESS',
  ADD_ADDRESS_SUCCESS: 'ADD_ADDRESS_SUCCESS',
  SET_ADDRESS: 'SET_ADDRESS',
  SET_PROMOCODE: 'SET_PROMOCODE',
  UPDATE_USER_SUCCESS: 'UPDATE_USER_SUCCESS',
  SET_SECRET: 'SET_SECRET',
};
