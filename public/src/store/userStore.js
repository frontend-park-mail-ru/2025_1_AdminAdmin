import { createStore } from './store.js';
import { router } from '../modules/routing.js';
import { AppUserRequests } from '../modules/ajax.js';

const initialUserState = {
  login: '',
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
        login: action.payload.login,
      };

    case UserActions.LOGOUT_SUCCESS:
      return {
        ...state,
        isAuth: false,
        login: '',
      };
    case UserActions.CHECK_SUCCESS:
      return {
        ...state,
        isAuth: true,
        login: action.payload.login,
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
   */
  #dispatch(action) {
    return this.store.dispatch(action);
  }

  /**
   * Вход пользователя
   * @param {Object} param0 - данные пользователя
   */
  async login({ login, password }) {
    const res = await AppUserRequests.Login(login, password);
    this.#dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: { login: res.login },
    });
  }

  /**
   * Регистрация нового пользователя
   * @param {Object} param0 - данные пользователя
   */
  async register({ firstName, lastName, phoneNumber, login, password }) {
    const res = await AppUserRequests.SignUp(firstName, lastName, phoneNumber, login, password);
    this.#dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: { login: res.login },
    });
  }

  /**
   * Выход пользователя
   */
  async logout() {
    await AppUserRequests.Logout();
    this.#dispatch({ type: UserActions.LOGOUT_SUCCESS });
    router.goToPage('home');
  }

  /**
   * Проверяет, авторизован ли пользователь
   * @returns {Promise<void>}
   */
  async checkUser() {
    try {
      const res = await AppUserRequests.CheckUser();
      this.#dispatch({
        type: UserActions.CHECK_SUCCESS,
        payload: { login: res.login },
      });
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', err);
    }
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
