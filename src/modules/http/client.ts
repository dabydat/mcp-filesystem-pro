import { DEFAULT_TIMEOUT_MS, HTTP_ERROR_PREFIX, AUTH_HEADER_NAMES, type AuthConfig, type AuthType } from '../../constants/http.js';

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
  private auth: AuthConfig | null = null;
  private customHeaders: Record<string, string> = {};
  private lastResponse: HttpResponse | null = null;

  constructor(timeout: number = DEFAULT_TIMEOUT_MS) {
    this.timeout = timeout;
  }

  // Auth management
  setAuth(type: AuthType, credentials: AuthConfig['credentials']): void {
    this.auth = { type, credentials };
  }

  clearAuth(): void {
    this.auth = null;
  }

  // Header management
  setHeader(key: string, value: string): void {
    this.customHeaders[key] = value;
  }

  clearHeaders(): void {
    this.customHeaders = {};
  }

  // Timeout management
  setTimeout(ms: number): void {
    this.timeout = ms;
  }

  getTimeout(): number {
    return this.timeout;
  }

  // State inspection
  getAuth(): AuthConfig | null {
    return this.auth;
  }

  getHeaders(): Record<string, string> {
    return { ...this.customHeaders };
  }

  // Last response accessors (Sprint 8)
  getLastResponseData(): unknown {
    return this.lastResponse?.data ?? null;
  }

  getLastStatusCode(): number | null {
    return this.lastResponse?.status ?? null;
  }

  getLastResponseHeaders(): Record<string, string> {
    return this.lastResponse?.headers ?? {};
  }

  // HTTP methods
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

  private buildAuthHeader(): Record<string, string> | null {
    if (!this.auth) return null;

    const { type, credentials } = this.auth;

    switch (type) {
      case 'api-key':
        return { [AUTH_HEADER_NAMES['api-key']]: credentials.apiKey || '' };
      case 'bearer':
        return { [AUTH_HEADER_NAMES['bearer']]: `Bearer ${credentials.token || ''}` };
      case 'basic': {
        const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
        return { [AUTH_HEADER_NAMES['basic']]: `Basic ${encoded}` };
      }
      default:
        return null;
    }
  }

  private buildRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth header
    const authHeader = this.buildAuthHeader();
    if (authHeader) {
      Object.assign(headers, authHeader);
    }

    // Add custom headers
    Object.assign(headers, this.customHeaders);

    return headers;
  }

  private async request<T>(config: RequestConfig): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fullUrl = buildUrl(config.url, config.params);
      const headers = { ...this.buildRequestHeaders(), ...config.headers };

      const response = await fetch(fullUrl, {
        method: config.method,
        headers,
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

      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        headers: flattenResponseHeaders(response.headers),
      };

      // Store last response for later inspection (Sprint 8)
      this.lastResponse = httpResponse;

      return httpResponse;
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