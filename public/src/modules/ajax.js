import {decode, timeout} from "./utils.js";

/** @typedef {Promise<{create_time: string, image_path: string, id: string, login: string}>} UserData **/


const isDebug = false;

const REQUEST_TIMEOUT = 2000;

const baseUrl = `https://${isDebug ? "127.0.0.1" : "doordashers.ru"}:8443/api`;

const methods = {
    POST: "POST",
    GET: "GET",
    DELETE: "DELETE",
    PUT: "PUT"
};

let JWT = null;

JWT = window.localStorage.getItem("Authorization");

/**
 * Базовый запрос
 * @param method {methods}
 * @param url {string}
 * @param data {any}
 * @param params {Dict<string, string>}
 * @returns UserDataResponse
 */
const baseRequest = async (method, url, data = null, params=null) => {
    const options = {
        method: method,
        mode: "cors",
        credentials: "include",
        signal: timeout(REQUEST_TIMEOUT),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    };

    if (JWT !== null) {
        options.headers.Authorization = JWT;
    }

    if (data !== null) {
        options.body = JSON.stringify(data);
    }

    let query_url = new URL(baseUrl + url);
    if (params != null) {
        query_url.search = new URLSearchParams(params);
    }

    try{
        const response = await fetch(query_url.toString(), options).catch(() => {
            //toasts.error("Ошибка", "Что-то пошло не так");
        });
        let body = null;
        try {
            body = await response.json();
        } catch (err) {
            console.log("no body");
        }
        if (response.headers.get("Authorization") !== null) {
            JWT = response.headers.get("Authorization");
            window.localStorage.setItem("Authorization", JWT);
        }
        return {status: response.status, body};
    } catch (err) {
        console.log(err);
        return {status: 503, body: {message: err}};
    }
};

class UserRequests {
    #baseUrl = "/auth";

    /**
     * Запрос на логин пользователя
     * @param login {string}
     * @param password {string}
     * @returns UserDataResponse
     */
    Login = async (login, password) => {
        const {status, body} = await baseRequest(
            methods.POST,this.#baseUrl + "/signin",
            {login, password}
        );

        if (status === 200) {
            return;
        }

        throw new Error(body);
    };

    /**
     * Запрос на регистрацию нового пользователя
     * @param login{string}
     * @param password{string}
     * @returns UserDataResponse
     */
    SignUp = async (login, password) => {
        const {status, body} = await baseRequest(
            methods.POST,
            this.#baseUrl + "/signup",
            {login, password}
        );


        if (status === 201) {
            return;
        }

        throw Error(body.message);
    };

    /**
     * Запрос на логаут пользователя
     * @returns {Promise<{message: string}>}
     */
    Logout = async () => {
        const {status, body} = await baseRequest(
            methods.DELETE,
            this.#baseUrl + "/logout"
        );

        if (status === 204){
            console.log("logged out");
            JWT = null;
            return {
                message: "ok"
            };
        } else {
            throw Error(body.message);
        }
    };

    /**
     * Запрос на проверку пользователя
     * @returns {Promise<{message}|null>}
     * @throws Error - not authorized
     */
    CheckUser = async () => {
        const {status, body} = await baseRequest(
            methods.GET,
            this.#baseUrl + "/check_user"
        );

        if (status === 200) {
            return body;
        } else {
            throw Error("not authorized");
        }
    };
}

class RestaurantsRequests {
    #baseUrl = "/restaurants";

    /**
     * Получение списка всех ресторанов
     * @returns {Promise<{message}|{any}>}
     */
    GetAll = async (params=null) => {

        const {status, body} = await baseRequest(
            methods.GET,
            this.#baseUrl + "/list",
            null,
            params
        );

        if (status === 200) {
            return body;
        } else {
            throw Error(body.message);
        }
    };

    /**
     * Получение одного ресторана
     * @param id {number} - id ресторана
     * @returns {Promise<*>}
     */
    Get = async (id) => {

        const {status, body} = await baseRequest(
            methods.GET,
            this.#baseUrl + "/" + id,
            null
        );

        if (status === 200) {
            return body;
        } else {
            throw Error(body.message);
        }
    };
}

export const AppRestaurantRequests = new RestaurantsRequests();
export const AppUserRequests = new UserRequests();