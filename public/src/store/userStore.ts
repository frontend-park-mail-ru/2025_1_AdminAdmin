import { store } from './store';
import { AppUserRequests } from '@modules/ajax';
import { getActiveFromLocalStorage, saveActiveToLocalStorage } from '@modules/localStorage';
import { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '@myTypes/userTypes';
import { cartStore } from '@store/cartStore';
import { UserActions, UserState } from '@store/reducers/userReducer';

const userChannel = new BroadcastChannel('user_channel');
const tabId = crypto.randomUUID();

type UserActionType = keyof typeof UserActions;

interface UserChannelEvent {
  data: {
    type: UserActionType;
    payload: any;
    sender: string;
  };
}

export const userStore = {
  startSyncAcrossTabs(): void {
    userChannel.onmessage = (event: UserChannelEvent) => {
      const { type, payload, sender } = event.data;

      if (sender === tabId) return;

      if (type == UserActions.LOGOUT_SUCCESS) {
        cartStore.clearLocalCart();
      }
      store.dispatch({
        type: UserActions[type],
        payload: payload,
      });
    };
  },
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
    return this.getState().active_address;
  },

  getActivePromocode(): string {
    return this.getState().activePromoCode;
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
  async login(payload: LoginPayload): Promise<boolean | undefined> {
    const res = await AppUserRequests.Login(payload);

    if (typeof res === 'boolean') {
      return true;
    }

    await this.onLogin(res);
  },

  async onLogin(res: User) {
    if (!res.active_address) res.active_address = getActiveFromLocalStorage('Address');

    store.dispatch({
      type: UserActions.LOGIN_SUCCESS,
      payload: res,
    });

    userChannel.postMessage({
      type: UserActions.LOGIN_SUCCESS,
      payload: res,
    });

    await cartStore.initCart();
  },

  async OTPLogin(payload: { login: string; password: string; code: string }): Promise<void> {
    const res = await AppUserRequests.Check2FA(payload);
    await this.onLogin(res);
  },

  /**
   * Регистрация нового пользователя.
   * @param {RegisterPayload} payload - данные для регистрации
   * @returns {Promise<void>} - обещание, которое разрешается после успешной регистрации
   */
  async register(payload: RegisterPayload): Promise<void> {
    const res = await AppUserRequests.SignUp(payload);

    res.active_address = getActiveFromLocalStorage('Address');

    store.dispatch({
      type: UserActions.REGISTER_SUCCESS,
      payload: res,
    });

    userChannel.postMessage({
      type: UserActions.REGISTER_SUCCESS,
      payload: res,
      sender: tabId,
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

    userChannel.postMessage({
      type: UserActions.LOGOUT_SUCCESS,
      sender: tabId,
    });

    cartStore.clearLocalCart();
  },

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<void>} - обещание, которое разрешается после проверки состояния авторизации
   */
  async checkUser(): Promise<void> {
    try {
      const res = await AppUserRequests.CheckUser();

      if (!res.active_address) res.active_address = getActiveFromLocalStorage('Address');

      store.dispatch({
        type: UserActions.CHECK_SUCCESS,
        payload: res,
      });

      userChannel.postMessage({
        type: UserActions.CHECK_SUCCESS,
        payload: res,
        sender: tabId,
      });
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', (err as Error).message);
    } finally {
      await cartStore.initCart();
    }
  },

  async setSecret(): Promise<Blob> {
    const qrBlob = await AppUserRequests.GetQrCode();

    store.dispatch({
      type: UserActions.SET_SECRET,
      payload: true,
    });

    userChannel.postMessage({
      type: UserActions.SET_SECRET,
      payload: true,
      sender: tabId,
    });

    return qrBlob;
  },

  async revokeSecret(): Promise<void> {
    await AppUserRequests.Disable2FA();

    store.dispatch({
      type: UserActions.SET_SECRET,
      payload: false,
    });

    userChannel.postMessage({
      type: UserActions.SET_SECRET,
      payload: false,
      sender: tabId,
    });
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

      userChannel.postMessage({
        type: UserActions.UPDATE_USER_SUCCESS,
        payload: res,
        sender: tabId,
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

    userChannel.postMessage({
      type: UserActions.UPDATE_USER_SUCCESS,
      payload: res,
      sender: tabId,
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
    saveActiveToLocalStorage(address, 'Address');
    store.dispatch({
      type: UserActions.SET_ADDRESS,
      payload: address,
    });

    userChannel.postMessage({
      type: UserActions.SET_ADDRESS,
      sender: tabId,
      payload: address,
    });
  },

  setPromocode(promocode: string): void {
    saveActiveToLocalStorage(promocode, 'Promocode');
    store.dispatch({
      type: UserActions.SET_PROMOCODE,
      payload: promocode,
    });

    userChannel.postMessage({
      type: UserActions.SET_PROMOCODE,
      sender: tabId,
      payload: promocode,
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
userStore.startSyncAcrossTabs();
