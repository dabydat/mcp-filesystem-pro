export const HTTP_TOOL_NAMES = {
  HTTP_GET: 'http_get',
  HTTP_POST: 'http_post',
  HTTP_PUT: 'http_put',
  HTTP_DELETE: 'http_delete',
  HTTP_PATCH: 'http_patch',
  HTTP_HEAD: 'http_head',
  // Sprint 7: Auth & Headers
  HTTP_SET_AUTH_API_KEY: 'http_set_auth_api_key',
  HTTP_SET_AUTH_BEARER: 'http_set_auth_bearer',
  HTTP_SET_AUTH_BASIC: 'http_set_auth_basic',
  HTTP_CLEAR_AUTH: 'http_clear_auth',
  HTTP_SET_HEADERS: 'http_set_headers',
  HTTP_CLEAR_HEADERS: 'http_clear_headers',
  HTTP_SET_TIMEOUT: 'http_set_timeout',
  // Sprint 8: Response Parsing
  HTTP_PARSE_JSON: 'http_parse_json',
  HTTP_PARSE_TEXT: 'http_parse_text',
  HTTP_GET_RESPONSE_HEADERS: 'http_get_response_headers',
  HTTP_GET_STATUS_CODE: 'http_get_status_code',
  HTTP_ADD_QUERY_PARAM: 'http_add_query_param',
  // Sprint 9: Security
  HTTP_VALIDATE_URL: 'http_validate_url',
  HTTP_ADD_URL_ALLOWLIST: 'http_add_url_allowlist',
  HTTP_REMOVE_URL_ALLOWLIST: 'http_remove_url_allowlist',
  HTTP_LIST_ALLOWLIST: 'http_list_allowlist',
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

// Auth types
export type AuthType = 'api-key' | 'bearer' | 'basic';

export const AUTH_HEADER_NAMES = {
  'api-key': 'X-API-Key',
  'bearer': 'Authorization',
  'basic': 'Authorization',
} as const;

export interface AuthConfig {
  type: AuthType;
  credentials: {
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
}

export interface HttpClientState {
  auth: AuthConfig | null;
  headers: Record<string, string>;
  timeout: number;
}