export const createStore = (reducer) => {
    let state = reducer(undefined, { type: "__INIT__" });
    let subscribers = [];

    const store = {
        getState: () => state,
        dispatch: (action) => {
            if (typeof action === "function") {
                return action(store.dispatch, store.getState);
            }
            state = reducer(state, action);
            subscribers.forEach((cb) => cb());
        },
        subscribe: (cb) => subscribers.push(cb),
    };

    return store;
};
