import { getCSRFFromLocalStorage } from '@modules/localStorage';

export const getContentType = (response: Response) => {
  return response.headers.get('Content-Type') || '';
};

export const parseResponseBody = async (response: Response) => {
  const contentType = getContentType(response);
  try {
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
      return await response.text();
    }
  } catch {
    return null;
  }

  return null;
};

export const getRequestOptions = (method: string, data: any, contentType: string) => {
  const options: RequestInit = {
    method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...(contentType !== 'multipart/form-data' ? { 'Content-Type': contentType } : {}),
      Accept: 'application/json',
      ...getCSRFFromLocalStorage(),
    },
  };

  if (data) {
    options.body = contentType === 'multipart/form-data' ? data : JSON.stringify(data);
  }

  return options;
};

/**
 * Делает первую букву строки заглавной.
 * @param error - Текст ошибки
 * @returns Строка с заглавной первой буквой
 */
export const capitalizeError = (error: string): string => {
  if (!error) return '';
  return error.charAt(0).toUpperCase() + error.slice(1);
};
