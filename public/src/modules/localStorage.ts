import { CartState } from '@store/reducers/cartReducer';

export interface RequestOptions {
  headers?: Record<string, string>;
}

/**
 * Добавляет токены из localStorage в заголовки запроса
 */

export function getCSRFFromLocalStorage(): Record<string, string> {
  const tokens: Record<string, string> = {};

  try {
    const csrf = window.localStorage.getItem('X-CSRF-Token');
    if (csrf) {
      tokens['X-CSRF-Token'] = csrf;
    }
  } catch (err) {
    console.error('Ошибка извлечения токенов из localStorage:', err);
  }

  return tokens;
}

/**
 * Извлекает токены из заголовков ответа и сохраняет их в localStorage.
 * @param headers Заголовки ответа
 */
export function storeAuthTokensFromResponse(headers: Headers): void {
  try {
    const newCSRF = headers.get('X-CSRF-Token');
    if (newCSRF) {
      window.localStorage.setItem('X-CSRF-Token', newCSRF);
    }
  } catch (err) {
    console.error('Ошибка сохранения токенов в localStorage:', err);
  }
}

export function saveActiveToLocalStorage(value: string, item: string): void {
  try {
    window.localStorage.setItem(item, value);
  } catch (err) {
    console.error('Ошибка сохранения адреса в localStorage:', err);
  }
}

export function getActiveFromLocalStorage(item: string): string {
  try {
    return window.localStorage.getItem(item);
  } catch (err) {
    console.error('Ошибка получения из localStorage:', err);
  }
}

/**
 * Очищает токены из localStorage
 */
export function removeTokenFromLocalStorage(): void {
  try {
    window.localStorage.removeItem('X-CSRF-Token');
    window.localStorage.removeItem('Address');
  } catch (err) {
    console.error('Ошибка при очистке localstorage', err);
  }
}

export function setCartInLocalStorage(cart: CartState): void {
  try {
    window.localStorage.setItem('Cart', JSON.stringify(cart));
  } catch (err) {
    console.error('Ошибка сохранения в localStorage:', err);
  }
}

export function clearCartInLocalStorage(): void {
  try {
    window.localStorage.removeItem('Cart');
  } catch (err) {
    console.error('Ошибка сохранения в localStorage:', err);
  }
}

export function getCartFromLocalStorage(): CartState | null {
  try {
    const raw = window.localStorage.getItem('Cart');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Ошибка чтения из localStorage:', err);
    return null;
  }
}
