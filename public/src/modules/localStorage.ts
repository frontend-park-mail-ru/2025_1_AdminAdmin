export interface RequestOptions {
  headers?: Record<string, string>;
}

/**
 * Добавляет токены из localStorage в заголовки запроса
 */

export function getAuthTokensFromLocalStorage(): Record<string, string> {
  const tokens: Record<string, string> = {};

  try {
    const jwt = window.localStorage.getItem('Authorization');
    const csrf = window.localStorage.getItem('X-CSRF-Token');

    if (jwt) {
      tokens.Authorization = jwt;
    }

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
    const newJWT = headers.get('Authorization');
    if (newJWT) {
      window.localStorage.setItem('Authorization', newJWT);
    }

    const newCSRF = headers.get('X-CSRF-Token');
    if (newCSRF) {
      window.localStorage.setItem('X-CSRF-Token', newCSRF);
    }
  } catch (err) {
    console.error('Ошибка сохранения токенов в localStorage:', err);
  }
}

export function saveActiveAddressToLocalStorage(address: string): void {
  try {
    window.localStorage.setItem('Address', address);
  } catch (err) {
    console.error('Ошибка сохранения адреса в localStorage:', err);
  }
}

export function getActiveAddressFromLocalStorage(): string {
  try {
    return window.localStorage.getItem('Address');
  } catch (err) {
    console.error('Ошибка получения адреса из localStorage:', err);
  }
}

/**
 * Очищает токены из localStorage
 */
export function clearLocalStorage(): void {
  window.localStorage.removeItem('Authorization');
  window.localStorage.removeItem('X-CSRF-Token');
}
