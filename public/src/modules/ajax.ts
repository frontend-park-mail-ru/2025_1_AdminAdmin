import { removeTokenFromLocalStorage, storeAuthTokensFromResponse } from './localStorage';
import { RestaurantResponse, Review } from '@myTypes/restaurantTypes';
import { I_Cart } from '@myTypes/cartTypes';
import { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '@myTypes/userTypes';
import { CreateOrderPayload } from '@myTypes/orderTypes';
import { getRequestOptions, parseResponseBody } from '@modules/fetchUtils';

export interface ResponseData<T = any> {
  status: number;
  body: T;
}

interface ErrorResponse {
  error: string;
}

const isDebug = process.env.IS_DEBUG === 'true';

const baseUrl = `${isDebug ? 'http' : 'https'}://${isDebug ? 'localhost:5458' : 'doordashers.ru'}/api`;

const methods = Object.freeze({
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
});

type RequestParams = Record<string, string>;

/**
 * Выполняет базовый HTTP-запрос.
 * @param method - HTTP метод (GET, POST, DELETE, PUT)
 * @param url - URL-адрес запроса
 * @param data - Данные для отправки в запросе (для методов POST и PUT)
 * @param params - GET-параметры запроса
 * @param contentType
 * @returns {Promise<ResponseData>}
 */
const baseRequest = async <T = any>(
  method: string,
  url: string,
  data: any = null,
  params: RequestParams | null = null,
  contentType = 'application/json',
): Promise<ResponseData<T>> => {
  const queryUrl = new URL(baseUrl + url);
  if (params) queryUrl.search = new URLSearchParams(params).toString();

  const options = getRequestOptions(method, data, contentType);

  try {
    const response = await fetch(queryUrl.toString(), options);
    const body = await parseResponseBody(response);

    try {
      storeAuthTokensFromResponse(response.headers);
    } catch (err) {
      console.error(err);
    }

    return { status: response.status, body };
  } catch (err) {
    return { status: 503, body: err.message };
  }
};

class UserRequests {
  private baseUrl = '/auth';

  /**
   * Отправляет запрос на авторизацию пользователя.
   * @returns {Promise<{id: string; login: string}>}
   * @param payload
   */
  Login = async (payload: LoginPayload): Promise<User> => {
    const { status, body } = await baseRequest<User | ErrorResponse>(
      methods.POST,
      this.baseUrl + '/signin',
      payload,
    );

    if (status === 200) {
      return body as User;
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Что-то пошло не так...');
  };

  /**
   * Отправляет запрос на регистрацию нового пользователя.
   * @returns {Promise<{id: string; login: string}>}
   * @param payload
   */
  SignUp = async (payload: RegisterPayload): Promise<User> => {
    const response = await baseRequest<User | ErrorResponse>(
      methods.POST,
      this.baseUrl + '/signup',
      payload,
    );

    const { status, body } = response;

    if (status === 200) {
      return body as User;
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Что-то пошло не так...');
  };

  /**
   * Отправляет запрос на выход из системы.
   * @returns {Promise<{ message: string }>}
   */
  Logout = async (): Promise<{ message: string }> => {
    const { status, body } = await baseRequest(methods.GET, this.baseUrl + '/logout');

    if (status === 200) {
      removeTokenFromLocalStorage();
      return { message: 'ok' };
    } else {
      throw new Error(body.message ?? 'Что-то пошло не так...');
    }
  };

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<{ message: string }>}
   */
  CheckUser = async (): Promise<User> => {
    const { status, body } = await baseRequest<User | ErrorResponse>(
      methods.GET,
      this.baseUrl + '/check',
    );

    if (status === 200) {
      return body as User;
    } else {
      throw new Error('not authorized');
    }
  };

  /**
   * Отправляет запрос на обновление информации пользователя.
   * @param payload - Параметры для обновления (описание, имя, фамилия, телефон, пароль)
   * @returns {Promise<User>}
   */
  UpdateUser = async (payload: Partial<UpdateUserPayload>): Promise<User> => {
    const { status, body } = await baseRequest<User | ErrorResponse>(
      methods.POST,
      this.baseUrl + '/update_user',
      payload,
    );

    if (status === 200) {
      return body as User;
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Что-то пошло не так...');
  };

  /**
   * Получает список адресов, привязанных к пользователю.
   * @returns {Promise<{ address: string; id: string; user_id: string }[]>}
   */
  GetAddresses = async (): Promise<{ address: string; id: string; user_id: string }[]> => {
    const { status, body } = await baseRequest<
      { address: string; id: string; user_id: string }[] | ErrorResponse
    >(methods.GET, this.baseUrl + '/address');

    if (status === 200) {
      return body as { address: string; id: string; user_id: string }[];
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Не удалось получить адреса пользователя');
  };

  AddAddress = async (address: string): Promise<void> => {
    const { status, body } = await baseRequest<ErrorResponse>(
      methods.POST,
      this.baseUrl + '/address',
      {
        address,
      },
    );

    if (status === 200) {
      return;
    } else {
      throw new Error((body as ErrorResponse)?.error ?? 'Не удалось добавить адрес');
    }
  };

  /**
   * Удаляет адрес пользователя по ID.
   * @param id - ID адреса
   * @returns {Promise<{ message: string }>}
   */
  DeleteAddress = async (id: string): Promise<void> => {
    const { status, body } = await baseRequest<ErrorResponse>(
      methods.DELETE,
      this.baseUrl + '/address',
      { id },
    );

    if (status === 200) {
      return;
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Не удалось удалить адрес');
  };

  SetAvatar = async (picture: FormData) => {
    const { status, body } = await baseRequest<{ message: string } & { error?: string }>(
      methods.POST,
      this.baseUrl + '/update_userpic',
      picture,
      null,
      'multipart/form-data',
    );

    if (status === 200) {
      return body;
    }

    throw new Error(body?.error ?? 'Не удалось загрузить аватарку');
  };
}

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
    } else if (status === 404) {
      return;
    } else {
      throw new Error(body?.error);
    }
  };

  /**
   * Получает информацию об одном ресторане.
   * @param id - Идентификатор ресторана
   * @returns {Promise<any>}
   */
  Get = async (id: string): Promise<RestaurantResponse> => {
    const { status, body } = await baseRequest<RestaurantResponse | ErrorResponse>(
      methods.GET,
      this.baseUrl + '/' + id,
      null,
    );

    if (status === 200) {
      //return body as RestaurantResponse;
      const restaurant = body as RestaurantResponse;

      // Добавляем моки отзывов вручную
      restaurant.reviews = [
        {
          id: '1',
          user: 'Иван Иванов',
          review_text: 'Отличное место, быстрая доставка!',
          rating: 5,
          created_at: '2025-04-29T10:00:00Z',
        },
        {
          id: '2',
          user: 'Анна Смирнова',
          review_text: 'Все понравилось, но хотелось бы побольше соуса.',
          rating: 4,
          created_at: '2025-04-28T16:30:00Z',
        },
      ];

      return restaurant;
    } else {
      throw new Error((body as ErrorResponse)?.error ?? 'Что-то пошло не так...');
    }
  };

  /**
   * Получает список отзывов (рейтингов) ресторана.
   * @param id - Идентификатор ресторана
   * @returns {Promise<Review[]>}
   */
  GetReviews = async (): Promise<Review[]> => {
    // Моковые данные отзывов
    return [
      {
        id: '1',
        user: 'Иван Иванов',
        review_text: 'Отличное место, быстрая доставка!',
        rating: 5,
        created_at: '2025-04-29T10:00:00Z',
      },
      {
        id: '2',
        user: 'Анна Смирнова',
        review_text: 'Все понравилось, но хотелось бы побольше соуса.',
        rating: 4,
        created_at: '2025-04-28T16:30:00Z',
      },
      {
        id: '3',
        user: 'Олег Кузнецов',
        review_text: 'Еда была холодной, но вкусной.',
        rating: 3,
        created_at: '2025-04-27T12:15:00Z',
      },
    ];
  };
}

class CartRequests {
  private baseUrl = '/cart';

  /**
   * Обновляет количество товара в корзине. Если количество 0, товар удаляется.
   * @returns {Promise<void>}
   * @param product_id
   * @param quantity
   * @param restaurant_id
   */
  UpdateProductQuantity = async (
    product_id: string,
    quantity: number,
    restaurant_id: string,
  ): Promise<I_Cart> => {
    const { status, body } = await baseRequest<I_Cart | ErrorResponse>(
      methods.POST,
      `${this.baseUrl}/update/${product_id}`,
      {
        quantity,
        restaurant_id,
      },
    );

    if (status === 200) {
      return body as I_Cart;
    } else {
      throw new Error((body as ErrorResponse)?.error ?? 'Не удалось обновить количество продуктов');
    }
  };

  /**
   * Получает текущую корзину.
   * @returns {Promise<any>}
   */
  GetCart = async (): Promise<I_Cart> => {
    const { status, body } = await baseRequest<I_Cart | ErrorResponse>(methods.GET, this.baseUrl);

    if (status === 200) {
      return body as I_Cart;
    } else if (status === 404) {
      return;
    } else {
      throw new Error((body as ErrorResponse).error ?? 'Не удалось получить корзину');
    }
  };

  ClearCart = async (): Promise<void> => {
    const { status, body } = await baseRequest<ErrorResponse | undefined>(
      methods.POST,
      `${this.baseUrl}/clear`,
    );

    if (status === 200) {
      return;
    }

    const error = (body as ErrorResponse)?.error ?? 'Не удалось очистить корзину';
    throw new Error(error);
  };
}

class OrderRequests {
  private baseUrl = '/order';

  /**
   * Создает новый заказ.
   * @param payload - Данные заказа
   * @returns {Promise<{ message: string; order_id?: string }>}
   */
  CreateOrder = async (
    payload: CreateOrderPayload,
  ): Promise<{ message: string; order_id?: string }> => {
    const { status, body } = await baseRequest<
      { message: string; order_id?: string } | ErrorResponse
    >(methods.POST, this.baseUrl + '/create', payload);

    if (status === 200 || status === 201) {
      return body as { message: string; order_id?: string };
    }

    throw new Error((body as ErrorResponse)?.error ?? 'Не удалось создать заказ');
  };
}

export const AppRestaurantRequests = new RestaurantsRequests();
export const AppUserRequests = new UserRequests();
export const AppCartRequests = new CartRequests();
export const AppOrderRequests = new OrderRequests();
