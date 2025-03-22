type Action = { type: string; [key: string]: any };
type Reducer<S = any, A = Action> = (state: S, action: A) => S;
type Subscriber = () => void;

interface Store<S = any, A = Action> {
  getState: () => S;
  dispatch: (action: A | ThunkAction) => void;
  subscribe: (cb: Subscriber) => void;
}

type ThunkAction = (dispatch: Store['dispatch'], getState: Store['getState']) => void;
/**
 * Создает хранилище состояния с поддержкой подписки и диспатча действий.
 * @param {Function} reducer - Функция-редьюсер, которая управляет состоянием на основе переданных действий
 * @returns {Object} Хранилище состояния с методами для получения состояния, отправки действий и подписки на обновления
 */
export const createStore = <S, A extends Action>(reducer: Reducer<S, A>): Store<S, A> => {
  let state = reducer(undefined as S, { type: '__INIT__' } as A);
  let subscribers: Subscriber[] = [];

  const store: Store<S, A> = {
    /**
     * Получает текущее состояние хранилища.
     * @returns {S} Текущее состояние хранилища
     */
    getState: (): S => state,

    /**
     * Отправляет действие (action) в хранилище для изменения состояния.
     * Может быть функцией, которая будет вызвана с dispatch и getState.
     * @param {A | ThunkAction} action - Действие для отправки (может быть объектом или функцией)
     * @returns {void}
     */
    dispatch: (action: A | ThunkAction): void => {
      if (typeof action === 'function') {
        (action as ThunkAction)(store.dispatch, store.getState);
        return;
      }
      state = reducer(state, action);
      subscribers.forEach((cb) => cb());
    },

    /**
     * Подписывается на изменения состояния хранилища.
     * @param {Subscriber} cb - Колбэк-функция, которая будет вызвана при изменении состояния
     */
    subscribe: (cb: Subscriber) => subscribers.push(cb),
  };

  return store;
};
