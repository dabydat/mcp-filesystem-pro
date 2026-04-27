export const HTTP_TOOL_NAMES = {
  HTTP_GET: 'http_get',
  HTTP_POST: 'http_post',
  HTTP_PUT: 'http_put',
  HTTP_DELETE: 'http_delete',
  HTTP_PATCH: 'http_patch',
  HTTP_HEAD: 'http_head',
} as const;

export type HttpToolName = typeof HTTP_TOOL_NAMES[keyof typeof HTTP_TOOL_NAMES];

export const HTTP_MESSAGES = {
  REQUEST_SUCCESS: 'HTTP request completed',
  REQUEST_FAILED: 'HTTP request failed',
  INVALID_URL: 'Invalid URL provided',
  TIMEOUT: 'Request timed out',
  NETWORK_ERROR: 'Network error occurred',
} as const;

export type HttpMessage = typeof HTTP_MESSAGES[keyof typeof HTTP_MESSAGES];

export const HTTP_ERROR_PREFIX = {
  HTTP_REQUEST_FAILED: 'HTTP_REQUEST_FAILED',
  HTTP_INVALID_URL: 'HTTP_INVALID_URL',
  HTTP_TIMEOUT: 'HTTP_TIMEOUT',
  HTTP_NETWORK_ERROR: 'HTTP_NETWORK_ERROR',
} as const;

export type HttpErrorPrefix = typeof HTTP_ERROR_PREFIX[keyof typeof HTTP_ERROR_PREFIX];

export const DEFAULT_TIMEOUT_MS = 30000;
export const MAX_URL_LENGTH = 2048;