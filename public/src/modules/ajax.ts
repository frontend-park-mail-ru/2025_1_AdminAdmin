import {
  getCSRFFromLocalStorage,
  removeTokenFromLocalStorage,
  storeAuthTokensFromResponse,
} from './localStorage';
import {
  BaseRestaurant,
  Category,
  RestaurantResponse,
  Review,
  SearchRestaurant,
} from '@myTypes/restaurantTypes';
import { I_Cart } from '@myTypes/cartTypes';
import { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '@myTypes/userTypes';
import { CreateOrderPayload, I_OrderResponse, I_UserOrderResponse } from '@myTypes/orderTypes';
import { capitalizeError } from '@modules/utils';
import { I_Promocode } from '@myTypes/promocodeTypes';
import { APIClient, RequestParams } from './apiClient';

export interface ResponseData<T = any> {
  status: number;
  body: T;
}

interface ErrorResponse {
  error: string;
}

const isDebug = process.env.IS_DEBUG === 'true';

const baseUrl = `${isDebug ? 'http' : 'https'}://${isDebug ? 'localhost:5458' : 'doordashers.ru'}/api`;

const api = new APIClient(baseUrl, getCSRFFromLocalStorage, storeAuthTokensFromResponse);

class UserRequests {
  private baseUrl = '/auth';

  /**
   * Отправляет запрос на авторизацию пользователя.
   * @returns {Promise<{id: string; login: string}>}
   * @param payload
   */
  Login = async (payload: LoginPayload): Promise<User> => {
    const { status, body } = await api.post<User | ErrorResponse>(
      this.baseUrl + '/signin',
      payload,
    );

    if (status === 200) {
      return body as User;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Что-то пошло не так...');
  };

  /**
   * Отправляет запрос на регистрацию нового пользователя.
   * @returns {Promise<{id: string; login: string}>}
   * @param payload
   */
  SignUp = async (payload: RegisterPayload): Promise<User> => {
    const response = await api.post(this.baseUrl + '/signup', payload);

    const { status, body } = response;

    if (status === 200) {
      return body as User;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Что-то пошло не так...');
  };

  /**
   * Отправляет запрос на выход из системы.
   * @returns {Promise<{ message: string }>}
   */
  Logout = async (): Promise<{ message: string }> => {
    const { status, body } = await api.get(this.baseUrl + '/logout');

    if (status === 200) {
      removeTokenFromLocalStorage();
      return { message: 'ok' };
    } else {
      throw new Error(capitalizeError(body.message) ?? 'Что-то пошло не так...');
    }
  };

  /**
   * Проверяет авторизацию пользователя.
   * @returns {Promise<{ message: string }>}
   */
  CheckUser = async (): Promise<User> => {
    const { status, body } = await api.get<User | ErrorResponse>(this.baseUrl + '/check');

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
    const { status, body } = await api.post<User | ErrorResponse>(
      this.baseUrl + '/update_user',
      payload,
    );

    if (status === 200) {
      return body as User;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Что-то пошло не так...');
  };

  /**
   * Получает список адресов, привязанных к пользователю.
   * @returns {Promise<{ address: string; id: string; user_id: string }[]>}
   */
  GetAddresses = async (): Promise<{ address: string; id: string; user_id: string }[]> => {
    const { status, body } = await api.get<
      { address: string; id: string; user_id: string }[] | ErrorResponse
    >(this.baseUrl + '/address');

    if (status === 200) {
      return body as { address: string; id: string; user_id: string }[];
    }

    throw new Error(
      capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось получить адреса пользователя',
    );
  };

  AddAddress = async (address: string): Promise<void> => {
    const { status, body } = await api.post<null | ErrorResponse>(this.baseUrl + '/address', {
      address,
    });

    if (status === 200) {
      return;
    } else {
      throw new Error(
        capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось добавить адрес',
      );
    }
  };

  /**
   * Удаляет адрес пользователя по ID.
   * @param id - ID адреса
   * @returns {Promise<{ message: string }>}
   */
  DeleteAddress = async (id: string): Promise<void> => {
    const { status, body } = await api.delete<ErrorResponse>(this.baseUrl + '/address', { id });

    if (status === 200) {
      return;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось удалить адрес');
  };

  SetAvatar = async (picture: FormData) => {
    const { status, body } = await api.post<{ message: string } & { error?: string }>(
      this.baseUrl + '/update_userpic',
      picture,
      'multipart/form-data',
    );

    if (status === 200) {
      return body;
    }

    throw new Error(capitalizeError(body?.error) ?? 'Не удалось загрузить аватар');
  };

  /**
   * Получает QR-код для авторизации.
   * Возвращает blob изображения (PNG).
   * @returns {Promise<Blob>} QR-код в формате PNG
   */
  GetQrCode = async (): Promise<Blob> => {
    const { status, body } = await api.post<Blob>(this.baseUrl + '/qr', null, 'application/json');

    if (status === 200) {
      return body;
    }

    throw new Error('Не удалось получить QR-код');
  };
}

class RestaurantsRequests {
  baseUrl = '/restaurants';

  /**
   * Получает список всех ресторанов.
   */
  GetAll = async (params: RequestParams | null = null): Promise<BaseRestaurant[]> => {
    const { status, body } = await api.get<BaseRestaurant[] | ErrorResponse>(
      this.baseUrl + '/list',
      params,
    );

    if (status === 200) {
      return body as BaseRestaurant[];
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error || `Ошибка: ${status}`));
  };

  /**
   * Получает информацию об одном ресторане.
   */
  /**
   * Получает информацию об одном ресторане.
   * @param id - Идентификатор ресторана
   * @returns {Promise<any>}
   */
  Get = async (id: string): Promise<RestaurantResponse> => {
    const { status, body } = await api.get<RestaurantResponse | ErrorResponse>(
      this.baseUrl + '/' + id,
      null,
    );

    if (status === 200) {
      return body as RestaurantResponse;
    } else {
      throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Что-то пошло не так...');
    }
  };

  Search = async (id: string, query: string): Promise<Category[]> => {
    const params = new URLSearchParams(query);
    const url = `${this.baseUrl}/${id}/search?query=${params.toString()}`;

    const { status, body } = await api.get<Category[] | ErrorResponse>(url, null);

    if (status === 200) {
      return body as Category[];
    } else {
      throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Что-то пошло не так...');
    }
  };

  /**
   * Получает список отзывов ресторана.
   * @param id - ID ресторана
   * @param count - количество отзывов (по умолчанию 1)
   * @param offset - смещение (по умолчанию 0)
   */
  GetReviews = async (id: string, count = 100, offset = 0): Promise<Review[]> => {
    const url = `${this.baseUrl}/${id}/reviews`;
    const params: RequestParams = {
      count: count.toString(),
      offset: offset.toString(),
    };

    const { status, body } = await api.get<Review[] | ErrorResponse>(url, params);

    if (status === 200) {
      return body as Review[];
    } else {
      throw new Error(
        capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось загрузить отзывы',
      );
    }
  };

  /**
   * Отправляет отзыв о ресторане.
   * @param id - ID ресторана
   * @param review - объект с текстом и рейтингом
   */
  SendReview = async (
    id: string,
    review: { review_text: string; rating: number },
  ): Promise<Review> => {
    const url = `${this.baseUrl}/${id}/reviews`;

    const { status, body } = await api.post<Review | ErrorResponse>(url, review);

    if (status === 200 || status === 201) {
      return body as Review;
    } else {
      throw new Error(
        capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось отправить отзыв',
      );
    }
  };

  /**
   * Проверяет, может ли пользователь оставить отзыв.
   * @param id - ID ресторана
   * @returns Если можно — возвращает true.
   *          Если нельзя — выбрасывает исключение с текстом ошибки и предыдущим отзывом.
   */
  CanLeaveReview = async (id: string): Promise<string | undefined> => {
    const url = `${this.baseUrl}/${id}/check`;

    const { status, body } = await api.get<{ id?: string }>(url);

    if (status !== 200) {
      throw new Error('Ошибка при проверке возможности оставить отзыв');
    }

    return body?.id;
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
    const { status, body } = await api.post<I_Cart | ErrorResponse>(
      `${this.baseUrl}/update/${product_id}`,
      {
        quantity,
        restaurant_id,
      },
    );

    if (status === 200) {
      return body as I_Cart;
    } else {
      throw new Error(
        capitalizeError((body as ErrorResponse)?.error) ??
          'Не удалось обновить количество продуктов',
      );
    }
  };

  /**
   * Получает текущую корзину.
   * @returns {Promise<any>}
   */
  GetCart = async (): Promise<I_Cart> => {
    const { status, body } = await api.get<I_Cart | ErrorResponse>(this.baseUrl);

    if (status === 200) {
      return body as I_Cart;
    } else if (status === 404) {
      return;
    } else {
      throw new Error(
        capitalizeError((body as ErrorResponse).error) ?? 'Не удалось получить корзину',
      );
    }
  };

  ClearCart = async (): Promise<void> => {
    const { status, body } = await api.post<ErrorResponse | undefined>(`${this.baseUrl}/clear`);

    if (status === 200) {
      return;
    }

    const error = capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось очистить корзину';
    throw new Error(error);
  };
}

class OrderRequests {
  private baseUrl = '/order';

  /**
   * Создает новый заказ.
   * @param payload - Данные заказа
   * @returns {Promise<I_OrderResponse>}
   */
  CreateOrder = async (payload: CreateOrderPayload): Promise<I_OrderResponse> => {
    const { status, body } = await api.post<I_OrderResponse | ErrorResponse>(
      this.baseUrl + '/create',
      payload,
    );

    if (status === 200 || status === 201) {
      return body as I_OrderResponse;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось создать заказ');
  };

  /**
   * Получает список заказов пользователя.
   * @param count - Количество заказов (по умолчанию 15)
   * @param offset - Смещение (по умолчанию 0)
   * @returns {Promise<I_UserOrderResponse>}
   */
  getUserOrders = async (count = 15, offset = 0): Promise<I_UserOrderResponse> => {
    const query = `?count=${count}&offset=${offset}`;
    const { status, body } = await api.get<I_UserOrderResponse | ErrorResponse>(
      this.baseUrl + query,
    );

    if (status === 200) {
      return body as I_UserOrderResponse;
    }

    throw new Error(
      capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось получить заказы пользователя',
    );
  };

  /**
   * Получает заказ по ID.
   * @param orderId - UUID заказа
   * @returns {Promise<I_OrderResponse>}
   */
  getOrderById = async (orderId: string): Promise<I_OrderResponse> => {
    const { status, body } = await api.get<I_OrderResponse | ErrorResponse>(
      `${this.baseUrl}/${orderId}`,
    );

    if (status === 200) {
      return body as I_OrderResponse;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось получить заказ');
  };
}

export async function searchRestaurants(
  query: string,
  count: number,
  offset: number,
): Promise<SearchRestaurant[] | null> {
  const params = new URLSearchParams(query);

  const { status, body } = await api.get<SearchRestaurant[] | null>(
    `/search?query=${params.toString()}&count=${count}&offset=${offset}`,
  );

  if (status === 200) {
    return body;
  }

  throw new Error('Не удалось выполнить поиск');
}

class PromocodeRequests {
  private baseUrl = '/promocodes';

  /**
   * Получает список промокодов.
   * @param count - Кол-во записей
   * @param offset - Смещение
   * @returns {Promise<I_Promocode[]>}
   */
  GetPromocodes = async (count = 10, offset = 0): Promise<I_Promocode[]> => {
    const query = `?count=${count}&offset=${offset}`;
    const { status, body } = await api.get<I_Promocode[] | ErrorResponse>(this.baseUrl + query);

    if (status === 200) {
      return body as I_Promocode[];
    }

    throw new Error(
      capitalizeError((body as ErrorResponse)?.error) ?? 'Не удалось получить промокоды',
    );
  };

  /**
   * Проверяет промокод и возвращает скидку.
   * @param promocode - Строка промокода
   * @returns {Promise<number>} - скидка от 0 до 1
   */
  CheckPromocode = async (promocode: string): Promise<number> => {
    const { status, body } = await api.post<{ discount: number } | ErrorResponse>(
      this.baseUrl + '/check',
      { promocode },
    );

    if (status === 200 && 'discount' in body) {
      return body.discount;
    }

    throw new Error(capitalizeError((body as ErrorResponse)?.error) ?? 'Промокод недействителен');
  };
}

export const AppRestaurantRequests = new RestaurantsRequests();
export const AppUserRequests = new UserRequests();
export const AppCartRequests = new CartRequests();
export const AppOrderRequests = new OrderRequests();
export const AppPromocodeRequests = new PromocodeRequests();
