export interface ResponseData<T = any> {
  status: number;
  body: T;
}

export type RequestParams = Record<string, string>;

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class APIClient {
  baseURL: string;
  getCSRFToken: () => Record<string, string>;
  saveResponseHeaders: (headers: Headers) => void;

  constructor(
    baseURL: string,
    getCSRFToken: () => Record<string, string>,
    saveResponseHeaders: (headers: Headers) => void,
  ) {
    this.baseURL = baseURL;
    this.getCSRFToken = getCSRFToken;
    this.saveResponseHeaders = saveResponseHeaders;
  }

  private buildUrl(url: string, params?: RequestParams): string {
    const fullUrl = new URL(this.baseURL + url);
    if (params) {
      fullUrl.search = new URLSearchParams(params).toString();
    }
    return fullUrl.toString();
  }

  private getRequestOptions(method: string, data: any, contentType: string) {
    const options: RequestInit = {
      method,
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(contentType !== 'multipart/form-data' ? { 'Content-Type': contentType } : {}),
        Accept: 'application/json',
        ...this.getCSRFToken(),
      },
    };

    if (data) {
      options.body = contentType === 'multipart/form-data' ? data : JSON.stringify(data);
    }

    return options;
  }

  private parseResponseBody = async (response: Response) => {
    const contentType = this.getContentType(response);
    try {
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
        return await response.text();
      } else if (contentType.includes('image/png')) {
        return await response.blob();
      }
    } catch {
      return null;
    }

    return null;
  };

  private getContentType(response: Response) {
    return response.headers.get('Content-Type') || '';
  }

  handleRequest = async <T = any>(
    method: HTTPMethod,
    url: string,
    data?: any,
    params?: RequestParams,
    contentType = 'application/json',
  ): Promise<ResponseData<T>> => {
    const fullUrl = this.buildUrl(url, params);
    const options = this.getRequestOptions(method, data, contentType);

    try {
      const response = await fetch(fullUrl.toString(), options);
      const body = await this.parseResponseBody(response);

      try {
        this.saveResponseHeaders(response.headers);
      } catch (err) {
        console.error(err);
      }

      return { status: response.status, body };
    } catch (err) {
      return { status: 503, body: err.message };
    }
  };

  get<T = any>(url: string, params?: RequestParams): Promise<ResponseData<T>> {
    return this.handleRequest<T>('GET', url, null, params);
  }

  post<T = any>(url: string, data?: any, content_type?: string): Promise<ResponseData<T>> {
    return this.handleRequest<T>('POST', url, data, undefined, content_type);
  }

  put<T = any>(url: string, data?: any): Promise<ResponseData<T>> {
    return this.handleRequest<T>('PUT', url, data);
  }

  delete<T = any>(url: string, params?: RequestParams): Promise<ResponseData<T>> {
    return this.handleRequest<T>('DELETE', url, null, params);
  }
}
