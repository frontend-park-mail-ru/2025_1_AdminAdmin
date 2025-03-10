import { createStore } from './store.js';
import { router } from '../modules/routing.js';
import { AppUserRequests } from '../modules/ajax.js';

const initialUserState = {
  username: '',
  avatarUrl: '/src/assets/avatar.png',
  isAuth: false,
};

const userReducer = (state = initialUserState, action) => {
  switch (action.type) {
    case UserActions.LOGIN_SUCCESS:
    case UserActions.REGISTER_SUCCESS:
      return {
        ...state,
        isAuth: true,
        username: action.payload.username,
      };

    case UserActions.LOGOUT_SUCCESS:
      return {
        ...state,
        isAuth: false,
        username: '',
      };
    default:
      return state;
  }
};

export const UserActions = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
};

/**
 * Класс для управления состоянием пользователя.
 */
class UserStore {
  /**
   * Создает стор для хранения состояния пользователя
   * @constructor
   */
  constructor() {
    this.store = createStore(userReducer);
  }
  
  /**
   * Проверяет авторизацию
   * @returns {boolean} - авторизован пользователь или нет
   */
  isAuth() {
    return this.store.getState().isAuth;
  }

  /**
   * Возвращает состояние пользователя
   * @returns {any} - текущее состояние пользователя
   */
  getState() {
    return this.store.getState();
  }
  
  /**
   * Отправляет action в хранилище
   * @param {Object | Function} action 
   * @returns {void}
   */
  #dispatch(action) {
    return this.store.dispatch(action);
  }
  
  /**
   * Вход пользователя
   * @param {Object} param0 - данные пользователя 
   */
  async login({ login, password }) {
    await AppUserRequests.Login(login, password);
    this.#dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: { username: login },
    });
  }
  
  /**
   * Регистрация нового пользователя
   * @param {Object} param0 - данные пользователя 
   */
  async register({ login, password, firstName, lastName, phoneNumber }) {
    await AppUserRequests.SignUp(login, password, firstName, lastName, phoneNumber);
    this.#dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: { username: login },
    });
  }

  /**
   * Выход пользователя
   */
  async logout() {
    this.#dispatch({ type: UserActions.LOGOUT_SUCCESS });
    router.goToPage('home');
  }

  /**
   * Подписывает listener на изменение состояния
   * @param {Function} listener 
   */
  subscribe(listener) {
    this.store.subscribe(listener);
  }
}

export const userStore = new UserStore();
