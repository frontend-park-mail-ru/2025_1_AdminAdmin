import { getActiveAddressFromLocalStorage } from '@modules/localStorage';
import { User } from '@myTypes/userTypes';

export interface UserState extends User {
  isAuth: boolean;
  activeAddress: string;
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
  isAuth: false,
  activeAddress: getActiveAddressFromLocalStorage(),
};

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
        activeAddress: '',
      };

    case UserActions.SET_ADDRESS:
      return {
        ...state,
        activeAddress: action.payload,
      };

    case UserActions.UPDATE_USER_SUCCESS:
      return {
        ...state,
        ...action.payload,
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
  UPDATE_USER_SUCCESS: 'UPDATE_USER_SUCCESS',
};
