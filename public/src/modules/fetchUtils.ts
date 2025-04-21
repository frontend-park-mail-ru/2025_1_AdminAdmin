import { getCSRFFromLocalStorage } from '@modules/localStorage';

export const getContentType = (response: Response) => {
  return response.headers.get('Content-Type') || '';
};

export const parseResponseBody = async (response: Response) => {
  const contentType = getContentType(response);

  if (contentType.includes('application/json')) {
    return await response.json();
  } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
    return await response.text();
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
