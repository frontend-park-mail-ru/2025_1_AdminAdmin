export interface RequestOptions {
  headers?: Record<string, string>;
}

/**
 * Добавляет токены из localStorage в заголовки запроса
 * @param options Объект с параметрами запроса
 */
export function addToHeaders(options: RequestOptions): void {
  if (!options.headers) {
    options.headers = {};
  }

  const jwt = window.localStorage.getItem('Authorization');
  const csrf = window.localStorage.getItem('X-CSRF-Token');

  if (jwt) {
    options.headers.Authorization = jwt;
  }

  if (csrf) {
    options.headers['X-CSRF-Token'] = csrf;
  }
}

/**
 * Сохраняет токены из заголовков ответа в localStorage
 * @param headers Заголовки ответа
 */
export function saveToLocalStorage(headers: Headers): void {
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

/**
 * Очищает токены из localStorage
 */
export function clearLocalStorage(): void {
  window.localStorage.removeItem('Authorization');
  window.localStorage.removeItem('X-CSRF-Token');
}
