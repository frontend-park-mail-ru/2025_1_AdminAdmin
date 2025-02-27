import { createStore } from "./store.js";
import { router } from "../modules/routing.js";
import {AppUserRequests} from "../modules/ajax.js";

const initialUserState = {
    username: "",
    avatarUrl: "/src/assets/avatar.png",
    isAuth: false,
};

const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case UserActions.LOGIN_SUCCESS || UserActions.REGISTER_SUCCESS:
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
    REGISTER_SUCCESS: "REGISTER_SUCCESS",
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

    #dispatch(action) {
        return this.store.dispatch(action);
    }

    async login(credentials) {
        try {
            const res = await AppUserRequests.Login(credentials.login, credentials.password );

            this.#dispatch({
                type: UserActions.LOGIN_SUCCESS,
                payload: { username: credentials.login },
            });
        } catch (err) {
            console.log(err);
        }
    }

    async register (credentials) {
        try {
            const res = await AppUserRequests.SignUp(credentials.login, credentials.password );

            this.#dispatch({
                type: UserActions.REGISTER_SUCCESS,
                payload: { username: credentials.login },
            });
        } catch (err) {
            console.log(err);
        }
    }


    async logout() {
        try {
            this.#dispatch({ type: UserActions.LOGOUT_SUCCESS });
            router.goToPage("home");
        } catch (err) {
            console.log(err);
        }
    }

    subscribe(listener) {
        this.store.subscribe(listener);
    }
}

export const userStore = new UserStore();
