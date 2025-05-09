import { store } from './store';
import { AppUserRequests } from '@modules/ajax';
import { saveActiveAddressToLocalStorage } from '@modules/localStorage';
import { LoginPayload, RegisterPayload, UpdateUserPayload } from '@myTypes/userTypes';
import { cartStore } from '@store/cartStore';
import { UserActions, UserState } from '@store/reducers/userReducer';

export const userStore = {
  /**
   * Проверяет, авторизован ли пользователь.
   * @returns {boolean} - true, если пользователь авторизован, иначе false
   */
  isAuth(): boolean {
    return this.getState().isAuth;
  },

  /**
   * Возвращает активный адрес пользователя.
   * @returns {string} - активный адрес пользователя
   */
  getActiveAddress(): string {
    return this.getState().activeAddress;
  },

  /**
   * Возвращает текущее состояние пользователя.
   * @returns {UserState} - текущее состояние пользователя
   */
  getState(): UserState {
    return store.getState().userState;
  },

  /**
   * Вход пользователя в систему.
   * @param {LoginPayload} payload - данные пользователя для авторизации
   * @returns {Promise<void>} - обещание, которое разрешается после успешного входа
   */
  async login(payload: LoginPayload): Promise<void> {
    const res = await AppUserRequests.Login(payload);
    store.dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: res,
    });

    await cartStore.initCart();
  },

  /**
   * Регистрация нового пользователя.
   * @param {RegisterPayload} payload - данные для регистрации
   * @returns {Promise<void>} - обещание, которое разрешается после успешной регистрации
   */
  async register(payload: RegisterPayload): Promise<void> {
    const res = await AppUserRequests.SignUp(payload);
    store.dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: res,
    });

    await cartStore.initCart();
  },

  /**
   * Выход пользователя из системы.
   * @returns {Promise<void>} - обещание, которое разрешается после успешного выхода
   */
  async logout(): Promise<void> {
    await AppUserRequests.Logout();
    store.dispatch({ type: UserActions.LOGOUT_SUCCESS });
    cartStore.clearLocalCart();
  },

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<void>} - обещание, которое разрешается после проверки состояния авторизации
   */
  async checkUser(): Promise<void> {
    try {
      const res = await AppUserRequests.CheckUser();
      store.dispatch({
        type: UserActions.CHECK_SUCCESS,
        payload: res,
      });
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', (err as Error).message);
    } finally {
      await cartStore.initCart();
    }
  },

  /**
   * Обновляет информацию о пользователе.
   * @param {Partial<UpdateUserPayload>} payload - данные для обновления пользователя
   * @returns {Promise<void>} - обещание, которое разрешается после успешного обновления
   */
  async updateUser(payload: Partial<UpdateUserPayload>): Promise<void> {
    try {
      const res = await AppUserRequests.UpdateUser(payload);
      store.dispatch({
        type: UserActions.UPDATE_USER_SUCCESS,
        payload: res,
      });
    } catch (err) {
      console.error('Ошибка при обновлении пользователя:', (err as Error).message);
    }
  },

  async SetAvatar(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('user_pic', file);
    const res = await AppUserRequests.SetAvatar(formData);
    store.dispatch({
      type: UserActions.UPDATE_USER_SUCCESS,
      payload: res,
    });
  },

  async addAddress(address: string): Promise<void> {
    try {
      await AppUserRequests.AddAddress(address);
    } catch (err) {
      console.error('Ошибка при добавлении адреса:', (err as Error).message);
    }
  },

  /**
   * Устанавливает активный адрес пользователя.
   * @param {string} address - новый активный адрес
   */

  setAddress(address: string): void {
    saveActiveAddressToLocalStorage(address);
    store.dispatch({
      type: UserActions.SET_ADDRESS,
      payload: address,
    });
  },

  /**
   * Подписывает listener на изменение состояния пользователя.
   * @param {Function} listener - функция, которая будет вызвана при изменении состояния
   * @returns {Function} - функция для отписки от изменений
   */
  subscribe(listener: () => void): () => void {
    return store.subscribe(listener);
  },
};

await userStore.checkUser();
