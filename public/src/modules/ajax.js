/**
 * @typedef {Object} UserData
 * @property {string} create_time - Дата создания пользователя
 * @property {string} image_path - Путь к изображению профиля
 * @property {string} id - Идентификатор пользователя
 * @property {string} login - Логин пользователя
 */

import { addToHeaders, clearLocalStorage, saveToLocalStorage } from './localStorage.js';

/**
 * @typedef {Object} ResponseData
 * @property {number} status - HTTP статус ответа
 * @property {any} body - Тело ответа
 */

const isDebug = false;

const baseUrl = `${isDebug ? 'http' : 'https'}://${isDebug ? '127.0.0.1' : 'doordashers.ru'}:443/api`;

const methods = Object.freeze({
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
});

/**
 * Выполняет базовый HTTP-запрос.
 * @param {string} method - HTTP метод (GET, POST, DELETE, PUT)
 * @param {string} url - URL-адрес запроса
 * @param {any} [data=null] - Данные для отправки в запросе (для методов POST и PUT)
 * @param {Object.<string, string>} [params=null] - GET-параметры запроса
 * @returns {Promise<ResponseData>}
 */
const baseRequest = async (method, url, data = null, params = null) => {
  const options = {
    method: method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  addToHeaders(options);

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  let query_url = new URL(baseUrl + url);
  if (params != null) {
    query_url.search = new URLSearchParams(params).toString();
  }

  try {
    const response = await fetch(query_url.toString(), options);

    let body = null;
    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.includes('application/json')) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    } else if (
      contentType &&
      (contentType.includes('text/plain') || contentType.includes('text/html'))
    ) {
      try {
        body = await response.text();
      } catch {
        body = null;
      }
    }
    try {
      saveToLocalStorage(response.headers);
    } catch (err) {
      console.error(err);
    }
    return { status: response.status, body };
  } catch (err) {
    return { status: 503, body: { message: err.message } };
  }
};

class UserRequests {
  #baseUrl = '/auth';

  /**
   * Отправляет запрос на авторизацию пользователя.
   * @param {string} login - Логин пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<void>}
   * @throws {Error} - В случае ошибки возвращает объект ошибки
   */
  Login = async (login, password) => {
    const { status, body } = await baseRequest(methods.POST, this.#baseUrl + '/signin', {
      login,
      password,
    });

    if (status === 200) {
      return {
        id: body.id,
        login: body.login,
      };
    }

    throw body.error;
  };

  /**
   * Отправляет запрос на регистрацию нового пользователя.
   * @param {string} firstName - Имя нового пользователя
   * @param {string} lastName - Фамилия нового пользователя
   * @param {string} phoneNumber - Телефон нового пользователя
   * @param {string} login - Логин нового пользователя
   * @param {string} password - Пароль нового пользователя
   * @returns {Promise<{id, username: *, create_time: (string|*), image_path: (string|*)}>}
   * @throws {Error} - В случае ошибки возвращает объект ошибки
   */
  SignUp = async (firstName, lastName, phoneNumber, login, password) => {
    const response = await baseRequest(methods.POST, this.#baseUrl + '/signup', {
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      login,
      password,
    });

    const { status, body } = response;

    if (status === 201) {
      return {
        id: body.id,
        login: body.login,
      };
    }

    throw body;
  };

  /**
   * Отправляет запрос на выход из системы.
   * @returns {Promise<{message: string}>}
   * @throws {Error} - В случае ошибки возвращает объект ошибки
   */
  Logout = async () => {
    const { status, body } = await baseRequest(methods.GET, this.#baseUrl + '/logout');

    if (status === 200) {
      clearLocalStorage();
      return { message: 'ok' };
    } else {
      throw new Error(body.message);
    }
  };

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<{message: string}>}
   * @throws {Error} - Если пользователь не авторизован
   */
  CheckUser = async () => {
    const { status, body } = await baseRequest(methods.GET, this.#baseUrl + '/check');

    if (status === 200) {
      return body;
    } else {
      throw new Error('not authorized');
    }
  };
}

class RestaurantsRequests {
  #baseUrl = '/restaurants';

  /**
   * Получает список всех ресторанов.
   * @param {Object.<string, string>} [params=null] - GET-параметры запроса
   * @returns {Promise<any>}
   * @throws {Error} - В случае ошибки возвращает объект ошибки
   */
  GetAll = async (params = null) => {
    const { status, body } = await baseRequest(methods.GET, this.#baseUrl + '/list', null, params);

    if (status === 200) {
      return body;
    } else {
      throw new Error(body.message);
    }
  };

  /**
   * Получает информацию об одном ресторане.
   * @param {number} id - Идентификатор ресторана
   * @returns {Promise<any>}
   * @throws {Error} - В случае ошибки возвращает объект ошибки
   */
  Get = async (id) => {
    const { status, body } = await baseRequest(methods.GET, this.#baseUrl + '/' + id, null);

    if (status === 200) {
      return body;
    } else {
      throw new Error(body.message);
    }
  };
}

export const AppRestaurantRequests = new RestaurantsRequests();
export const AppUserRequests = new UserRequests();
