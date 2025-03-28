import { createStore } from './store';
import { router } from '../modules/routing';
import { AppUserRequests } from '../modules/ajax';

interface UserState {
  login: string;
  avatarUrl: string;
  isAuth: boolean;
}

interface LoginPayload {
  login: string;
  password: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  login: string;
  password: string;
}

interface Action {
  type: string;
  payload?: any;
}

const initialUserState: UserState = {
  login: '',
  avatarUrl: '/src/assets/avatar.png',
  isAuth: false,
};

const userReducer = (state = initialUserState, action: Action): UserState => {
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

class UserStore {
  private store;

  constructor() {
    this.store = createStore(userReducer);
  }

  /**
   * Проверяет авторизацию
   * @returns {boolean} - авторизован пользователь или нет
   */
  isAuth(): boolean {
    return this.store.getState().isAuth;
  }

  /**
   * Возвращает состояние пользователя
   * @returns {UserState} - текущее состояние пользователя
   */
  getState(): UserState {
    return this.store.getState();
  }

  /**
   * Отправляет action в хранилище
   * @param {Action} action
   */
  private dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  /**
   * Вход пользователя
   * @param {LoginPayload} param0 - данные пользователя
   */
  async login({ login, password }: LoginPayload): Promise<void> {
    const res = await AppUserRequests.Login(login, password);
    this.dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: { login: res.login },
    });
  }

  /**
   * Регистрация нового пользователя
   * @param {RegisterPayload} param0 - данные пользователя
   */
  async register({
    firstName,
    lastName,
    phoneNumber,
    login,
    password,
  }: RegisterPayload): Promise<void> {
    const res = await AppUserRequests.SignUp(firstName, lastName, phoneNumber, login, password);
    this.dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: { login: res.login },
    });
  }

  /**
   * Выход пользователя
   */
  async logout(): Promise<void> {
    await AppUserRequests.Logout();
    this.dispatch({ type: UserActions.LOGOUT_SUCCESS });
    router.goToPage('home');
  }

  /**
   * Проверяет, авторизован ли пользователь
   * @returns {Promise<void>}
   */
  async checkUser(): Promise<void> {
    try {
      const res = await AppUserRequests.CheckUser();

      if ('login' in res) {
        this.dispatch({
          type: UserActions.CHECK_SUCCESS,
          payload: { login: res.login },
        });
      } else {
        console.error('Ошибка: Ответ не содержит логин', res);
      }
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', err.message);
    }
  }

  /**
   * Подписывает listener на изменение состояния
   * @param {Function} listener
   */
  subscribe(listener: () => void): void {
    this.store.subscribe(listener);
  }
}

export const userStore = new UserStore();
