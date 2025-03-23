type T_Action = { type: string; [key: string]: any };
type T_Reducer<State = any, Action = T_Action> = (state: State, T_Action: Action) => State;
type T_Subscriber = () => void;

interface Store<State = any, Action = T_Action> {
  getState: () => State;
  dispatch: (T_Action: Action | ThunkAction) => void;
  subscribe: (cb: T_Subscriber) => void;
}

type ThunkAction = (dispatch: Store['dispatch'], getState: Store['getState']) => void;
/**
 * Создает хранилище состояния с поддержкой подписки и диспатча действий.
 * @param {Function} T_Reducer - Функция-редьюсер, которая управляет состоянием на основе переданных действий
 * @returns {Object} Хранилище состояния с методами для получения состояния, отправки действий и подписки на обновления
 */
export const createStore = <State, Action extends T_Action>(
  T_Reducer: T_Reducer<State, Action>,
): Store<State, Action> => {
  let state = T_Reducer(undefined as State, { type: '__INIT__' } as Action);
  let subscribers: T_Subscriber[] = [];

  const store: Store<State, Action> = {
    /**
     * Получает текущее состояние хранилища.
     * @returns {State} Текущее состояние хранилища
     */
    getState: (): State => state,

    /**
     * Отправляет действие (T_Action) в хранилище для изменения состояния.
     * Может быть функцией, которая будет вызвана с dispatch и getState.
     * @param {Action | ThunkAction} T_Action - Действие для отправки (может быть объектом или функцией)
     * @returns {void}
     */
    dispatch: (T_Action: Action | ThunkAction): void => {
      if (typeof T_Action === 'function') {
        (T_Action as ThunkAction)(store.dispatch, store.getState);
        return;
      }
      state = T_Reducer(state, T_Action);
      subscribers.forEach((cb) => cb());
    },

    /**
     * Подписывается на изменения состояния хранилища.
     * @param {T_Subscriber} cb - Колбэк-функция, которая будет вызвана при изменении состояния
     */
    subscribe: (cb: T_Subscriber) => subscribers.push(cb),
  };

  return store;
};
