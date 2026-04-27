import { DEFAULT_TIMEOUT_MS, HTTP_ERROR_PREFIX } from '../../constants/http.js';

// HTTP Methods
const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
} as const;

type HttpMethod = typeof HTTP_METHOD[keyof typeof HTTP_METHOD];

// Request/Response types
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: unknown;
}

interface RequestConfig extends RequestOptions {
  method: HttpMethod;
  url: string;
}

// URL building with query params
function buildUrl(baseUrl: string, params?: Record<string, string>): string {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

// Header flattening for fetch Response headers
function flattenResponseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export class HttpClient {
  private timeout: number;

  constructor(timeout: number = DEFAULT_TIMEOUT_MS) {
    this.timeout = timeout;
  }

  async get<T = unknown>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: HTTP_METHOD.GET, url, params });
  }

  async post<T = unknown>(url: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: HTTP_METHOD.POST, url, body });
  }

  async put<T = unknown>(url: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: HTTP_METHOD.PUT, url, body });
  }

  async delete<T = unknown>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>({ method: HTTP_METHOD.DELETE, url });
  }

  async patch<T = unknown>(url: string, body?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: HTTP_METHOD.PATCH, url, body });
  }

  async head(url: string, params?: Record<string, string>): Promise<HttpResponse<null>> {
    return this.request<null>({ method: HTTP_METHOD.HEAD, url, params });
  }

  private async request<T>(config: RequestConfig): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fullUrl = buildUrl(config.url, config.params);
      const response = await fetch(fullUrl, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      let data: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (response.status === 204) {
        data = null as T;
      } else if (contentType.includes('application/json')) {
        data = await response.json() as T;
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        status: response.status,
        headers: flattenResponseHeaders(response.headers),
      };
    } catch (error: unknown) {
      throw this.createError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private createError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new Error(`${HTTP_ERROR_PREFIX.HTTP_TIMEOUT}: Request timed out after ${this.timeout}ms`);
      }
      return new Error(`${HTTP_ERROR_PREFIX.HTTP_NETWORK_ERROR}: ${error.message}`);
    }
    return new Error(`${HTTP_ERROR_PREFIX.HTTP_REQUEST_FAILED}: ${String(error)}`);
  }
}
