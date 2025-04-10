interface T_Action {
  type: string;
  [key: string]: any;
}
type T_Reducer<Success = any, Action = T_Action> = (state: Success, action: Action) => Success;
type T_Subscriber = () => void;

interface T_Store<Success = any, Action = T_Action> {
  getState: () => Success;
  dispatch: (action: Action | T_ThunkAction) => void;
  subscribe: (cb: T_Subscriber) => () => void;
}

type T_ThunkAction = (dispatch: T_Store['dispatch'], getState: T_Store['getState']) => void;

/**
 * Создает хранилище состояния с поддержкой подписки и диспатча действий.
 * @param {Function} reducer - Функция-редьюсер, которая управляет состоянием на основе переданных действий
 * @returns {Object} Хранилище состояния с методами для получения состояния, отправки действий и подписки на обновления
 */
export const createStore = <Success, Action extends T_Action>(
  reducer: T_Reducer<Success, Action>,
): T_Store<Success, Action> => {
  let state = reducer(undefined as Success, { type: '__INIT__' } as Action);
  let subscribers: T_Subscriber[] = [];

  const store: T_Store<Success, Action> = {
    /**
     * Получает текущее состояние хранилища.
     * @returns {Success} Текущее состояние хранилища
     */
    getState: (): Success => state,

    /**
     * Отправляет действие (action) в хранилище для изменения состояния.
     * Может быть функцией, которая будет вызвана с dispatch и getState.
     * @param {Action | T_ThunkAction} action - Действие для отправки (может быть объектом или функцией)
     * @returns {void}
     */
    dispatch: (action: Action | T_ThunkAction): void => {
      if (typeof action === 'function') {
        (action as T_ThunkAction)(store.dispatch, store.getState);
        return;
      }
      state = reducer(state, action);
      subscribers.forEach((cb) => cb());
    },

    /**
     * Подписывается на изменения состояния хранилища.
     * @param {T_Subscriber} cb - Колбэк-функция, которая будет вызвана при изменении состояния
     */
    subscribe: (cb: T_Subscriber): (() => void) => {
      subscribers.push(cb);
      return () => {
        subscribers = subscribers.filter((subscriber) => subscriber !== cb);
      };
    },
  };

  return store;
};
