import { createStore } from "./store.js";
import goToPage from "../modules/routing.js";

const initialUserState = {
    username: "",
    avatarUrl: "/src/assets/avatar.png",
    isAuth: false,
};

const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case UserActions.LOGIN_SUCCESS:
            return {
                ...state,
                isAuth: true,
                username: action.payload.username,
            };

        case UserActions.LOGOUT_SUCCESS:
            return {
                ...state,
                isAuth: false,
                username: "",
            };

        default:
            return state;
    }
};

export const UserActions = {
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGOUT_SUCCESS: "LOGOUT_SUCCESS",
};

class UserStore {
    constructor() {
        this.store = createStore(userReducer);
    }

    isAuth() {
        console.log(this.store.getState().isAuth);
        return this.store.getState().isAuth;
    }

    getState() {
        return this.store.getState();
    }

    dispatch(action) {
        return this.store.dispatch(action);
    }

    async login(credentials) {
        try {
            const res = { username: credentials };

            this.dispatch({
                type: UserActions.LOGIN_SUCCESS,
                payload: { username: res.username },
            });

            goToPage("home");
        } catch (err) {
            console.log(err);
        }
    }

    async logout() {
        try {
            this.dispatch({ type: UserActions.LOGOUT_SUCCESS });
            goToPage("home");
        } catch (err) {
            console.log(err);
        }
    }

    subscribe(listener) {
        this.store.subscribe(listener);
    }
}

export const userStore = new UserStore();
