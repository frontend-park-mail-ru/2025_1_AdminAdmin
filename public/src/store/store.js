/**
 * Создает хранилище состояния с поддержкой подписки и диспатча действий.
 * @param {Function} reducer - Функция-редьюсер, которая управляет состоянием на основе переданных действий
 * @returns {Object} Хранилище состояния с методами для получения состояния, отправки действий и подписки на обновления
 */
export const createStore = (reducer) => {
  let state = reducer(undefined, { type: '__INIT__' });
  let subscribers = [];

  const store = {
    /**
     * Получает текущее состояние хранилища.
     * @returns {any} Текущее состояние хранилища
     */
    getState: () => state,

    /**
     * Отправляет действие (action) в хранилище для изменения состояния.
     * Может быть функцией, которая будет вызвана с dispatch и getState.
     * @param {Object | Function} action - Действие для отправки (может быть объектом или функцией)
     * @returns {void}
     */
    dispatch: (action) => {
      if (typeof action === 'function') {
        action(store.dispatch, store.getState);
        return;
      }
      state = reducer(state, action);
      subscribers.forEach((cb) => cb());
    },

    /**
     * Подписывается на изменения состояния хранилища.
     * @param {Function} cb - Колбэк-функция, которая будет вызвана при изменении состояния
     */
    subscribe: (cb) => subscribers.push(cb),
  };

  return store;
};
