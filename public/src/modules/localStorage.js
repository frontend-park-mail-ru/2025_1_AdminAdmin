export function addToHeaders(options) {
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

export function saveToLocalStorage(headers) {
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

export function clearLocalStorage() {
  window.localStorage.removeItem('Authorization');
  window.localStorage.removeItem('X-CSRF-Token');
}
