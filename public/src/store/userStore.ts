import { createStore } from './store';
import { AppUserRequests } from '@modules/ajax';
import {
  getActiveAddressFromLocalStorage,
  saveActiveAddressToLocalStorage,
} from '@modules/localStorage';
import { User, LoginPayload, RegisterPayload, UpdateUserPayload } from '@myTypes/userTypes';
import { cartStore } from '@store/cartStore';

interface UserState extends User {
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

const userReducer = (state = initialUserState, action: Action): UserState => {
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

class UserStore {
  private store;

  constructor() {
    this.store = createStore(userReducer);
  }

  /**
   * Проверяет, авторизован ли пользователь.
   * @returns {boolean} - true, если пользователь авторизован, иначе false
   */
  isAuth(): boolean {
    return this.store.getState().isAuth;
  }

  /**
   * Возвращает активный адрес пользователя.
   * @returns {string} - активный адрес пользователя
   */
  getActiveAddress(): string {
    return this.store.getState().activeAddress;
  }

  /**
   * Возвращает текущее состояние пользователя.
   * @returns {UserState} - текущее состояние пользователя
   */
  getState(): UserState {
    return this.store.getState();
  }

  /**
   * Отправляет action в хранилище.
   * @param {Action} action - действие для отправки в хранилище
   */
  private dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  /**
   * Вход пользователя в систему.
   * @param {LoginPayload} payload - данные пользователя для авторизации
   * @returns {Promise<void>} - обещание, которое разрешается после успешного входа
   */
  async login(payload: LoginPayload): Promise<void> {
    const res = await AppUserRequests.Login(payload);
    this.dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: res,
    });

    await cartStore.initCart();
  }

  /**
   * Регистрация нового пользователя.
   * @param {RegisterPayload} payload - данные для регистрации
   * @returns {Promise<void>} - обещание, которое разрешается после успешной регистрации
   */
  async register(payload: RegisterPayload): Promise<void> {
    const res = await AppUserRequests.SignUp(payload);
    this.dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: res,
    });

    await cartStore.initCart();
  }

  /**
   * Выход пользователя из системы.
   * @returns {Promise<void>} - обещание, которое разрешается после успешного выхода
   */
  async logout(): Promise<void> {
    await AppUserRequests.Logout();
    this.dispatch({ type: UserActions.LOGOUT_SUCCESS });

    await cartStore.initCart();
  }

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<void>} - обещание, которое разрешается после проверки состояния авторизации
   */
  async checkUser(): Promise<void> {
    try {
      const res = await AppUserRequests.CheckUser();
      this.dispatch({
        type: UserActions.CHECK_SUCCESS,
        payload: res,
      });
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', (err as Error).message);
    }
  }

  /**
   * Обновляет информацию о пользователе.
   * @param {Partial<UpdateUserPayload>} payload - данные для обновления пользователя
   * @returns {Promise<void>} - обещание, которое разрешается после успешного обновления
   */
  async updateUser(payload: Partial<UpdateUserPayload>): Promise<void> {
    try {
      const res = await AppUserRequests.UpdateUser(payload);

      this.dispatch({
        type: UserActions.UPDATE_USER_SUCCESS,
        payload: res,
      });
    } catch (err) {
      console.error('Ошибка при обновлении данных пользователя:', (err as Error).message);
    }
  }

  async addAddress(address: string): Promise<void> {
    try {
      await AppUserRequests.AddAddress(address);
      this.dispatch({
        type: UserActions.ADD_ADDRESS_SUCCESS,
        payload: { address: address },
      });
    } catch (err) {
      console.error('Ошибка при добавлении адреса:', err.message);
    }
  }

  /**
   * Устанавливает активный адрес пользователя.
   * @param {string} address - новый активный адрес
   */
  setAddress(address: string) {
    saveActiveAddressToLocalStorage(address);
    this.dispatch({
      type: UserActions.SET_ADDRESS,
      payload: address,
    });
  }

  /**
   * Подписывает listener на изменение состояния пользователя.
   * @param {Function} listener - функция, которая будет вызвана при изменении состояния
   * @returns {Function} - функция для отписки от изменений
   */
  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}

export const userStore = new UserStore();
await userStore.checkUser();
