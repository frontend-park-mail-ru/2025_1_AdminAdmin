import { addToHeaders, clearLocalStorage, saveToLocalStorage } from './localStorage';

export interface ResponseData<T = any> {
  status: number;
  body: T;
}

const isDebug = false;

const baseUrl = `${isDebug ? 'http' : 'https'}://${isDebug ? '127.0.0.1' : 'doordashers.ru'}:8443/api`;

const methods = Object.freeze({
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
});

interface RequestParams {
  [key: string]: string;
}

/**
 * Выполняет базовый HTTP-запрос.
 * @param method - HTTP метод (GET, POST, DELETE, PUT)
 * @param url - URL-адрес запроса
 * @param data - Данные для отправки в запросе (для методов POST и PUT)
 * @param params - GET-параметры запроса
 * @returns {Promise<ResponseData>}
 */
const baseRequest = async <T = any>(
  method: string,
  url: string,
  data: any = null,
  params: RequestParams | null = null,
): Promise<ResponseData<T>> => {
  const options: RequestInit = {
    method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  addToHeaders(options as any);

  if (data) options.body = JSON.stringify(data);

  const queryUrl = new URL(baseUrl + url);
  if (params) queryUrl.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(queryUrl.toString(), options);
    const contentType = response.headers.get('Content-Type') || '';

    let body: any;
    try {
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
        body = await response.text();
      }
    } catch {
      body = null;
    }

    try {
      saveToLocalStorage(response.headers);
    } catch (err) {
      console.error(err);
    }

    return { status: response.status, body };
  } catch (err) {
    return { status: 503, body: err.message };
  }
};

// UserRequests class
class UserRequests {
  private baseUrl = '/auth';

  /**
   * Отправляет запрос на авторизацию пользователя.
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @returns {Promise<{id: string; login: string}>}
   */
  Login = async (login: string, password: string): Promise<{ id: string; login: string }> => {
    const { status, body } = await baseRequest<{ id: string; login: string } & { error?: string }>(
      methods.POST,
      this.baseUrl + '/signin',
      { login, password },
    );

    if (status === 200) {
      return {
        id: body.id,
        login: body.login,
      };
    }

    throw new Error(body.error ?? 'Unknown error');
  };

  /**
   * Отправляет запрос на регистрацию нового пользователя.
   * @param firstName - Имя нового пользователя
   * @param lastName - Фамилия нового пользователя
   * @param phoneNumber - Телефон нового пользователя
   * @param login - Логин нового пользователя
   * @param password - Пароль нового пользователя
   * @returns {Promise<{id: string; login: string}>}
   */
  SignUp = async (
    firstName: string,
    lastName: string,
    phoneNumber: string,
    login: string,
    password: string,
  ): Promise<{ id: string; login: string }> => {
    const response = await baseRequest<{ id: string; login: string } & { error?: string }>(
      methods.POST,
      this.baseUrl + '/signup',
      {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        login,
        password,
      },
    );

    const { status, body } = response;

    if (status === 201) {
      return {
        id: body.id,
        login: body.login,
      };
    }

    throw new Error(body.error ?? 'Unknown error');
  };

  /**
   * Отправляет запрос на выход из системы.
   * @returns {Promise<{ message: string }>}
   */
  Logout = async (): Promise<{ message: string }> => {
    const { status, body } = await baseRequest(methods.GET, this.baseUrl + '/logout');

    if (status === 200) {
      clearLocalStorage();
      return { message: 'ok' };
    } else {
      throw new Error(body.error ?? 'Unknown error');
    }
  };

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<{ message: string }>}
   */
  CheckUser = async (): Promise<{ message: string }> => {
    const { status, body } = await baseRequest<{ message: string }>(
      methods.GET,
      this.baseUrl + '/check',
    );

    if (status === 200) {
      return body;
    } else {
      throw new Error('not authorized');
    }
  };

  AddAddress = async (address: string): Promise<{ message: string }> => {
    const { status, body } = await baseRequest<{ message: string } & { error?: string }>(
      methods.POST,
      this.baseUrl + '/add_address',
    );

    if (status === 200) {
      return body;
    } else {
      throw new Error('not authorized');
    }
  };
}

// RestaurantsRequests class
class RestaurantsRequests {
  baseUrl = '/restaurants';

  /**
   * Получает список всех ресторанов.
   * @param params - GET-параметры запроса
   * @returns {Promise<any>}
   */
  GetAll = async (params: RequestParams | null = null): Promise<any> => {
    const { status, body } = await baseRequest<any>(
      methods.GET,
      this.baseUrl + '/list',
      null,
      params,
    );

    if (status === 200) {
      return body;
    } else {
      throw new Error(body.message);
    }
  };

  /**
   * Получает информацию об одном ресторане.
   * @param id - Идентификатор ресторана
   * @returns {Promise<any>}
   */
  Get = async (id: number): Promise<any> => {
    const { status, body } = await baseRequest<any>(methods.GET, this.baseUrl + '/' + id, null);

    if (status === 200) {
      return body;
    } else {
      throw new Error(body.message);
    }
  };
}

export const AppRestaurantRequests = new RestaurantsRequests();
export const AppUserRequests = new UserRequests();
