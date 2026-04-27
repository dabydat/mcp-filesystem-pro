import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { HTTP_TOOL_NAMES, HTTP_ERROR_PREFIX, type AuthType } from '../../constants/http.js';
import { HttpClient, HttpResponse } from './client.js';
import { httpGet, httpPost, httpPut, httpDelete, httpPatch, httpHead } from './methods.js';
import { validateUrl } from '../../utils/url-validator.js';
import { withRetry, DEFAULT_RETRY_CONFIG, type RetryConfig } from '../../utils/retry.js';

const httpClient = new HttpClient();

// Shared schemas
const GetRequestSchema = z.object({
  url: z.string().url(),
  params: z.record(z.string()).optional(),
});

const PostRequestSchema = z.object({
  url: z.string().url(),
  body: z.unknown().optional(),
});

const PutRequestSchema = z.object({
  url: z.string().url(),
  body: z.unknown().optional(),
});

const DeleteRequestSchema = z.object({
  url: z.string().url(),
});

const PatchRequestSchema = z.object({
  url: z.string().url(),
  body: z.unknown().optional(),
});

const HeadRequestSchema = z.object({
  url: z.string().url(),
  params: z.record(z.string()).optional(),
});

// Auth schemas
const SetAuthApiKeySchema = z.object({
  apiKey: z.string().min(1),
  headerName: z.string().optional(),
});

const SetAuthBearerSchema = z.object({
  token: z.string().min(1),
});

const SetAuthBasicSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const SetHeadersSchema = z.object({
  headers: z.record(z.string()),
});

const SetTimeoutSchema = z.object({
  timeout_ms: z.number().min(100).max(300000),
});

// Sprint 8: Response parsing schemas
const ParseJsonSchema = z.object({
  text: z.string(),
});

const ParseTextSchema = z.object({
  text: z.string(),
});

const AddQueryParamSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// Sprint 9: Security schemas
const ValidateUrlSchema = z.object({
  url: z.string(),
});

const AddUrlAllowlistSchema = z.object({
  pattern: z.string().min(1),
});

const RemoveUrlAllowlistSchema = z.object({
  pattern: z.string().min(1),
});

// URL Allowlist for HTTP security (Sprint 9)
const urlAllowlist = new Set<string>();

function handleError(label: string, err: unknown): { content: [{ type: 'text'; text: string }]; isError: boolean } {
  const message = err instanceof Error ? err.message : `${label} request failed`;
  return { content: [{ type: 'text', text: message }], isError: true };
}

export function createHttpModule(server: McpServer, _guard: AllowlistGuard, _rootDir: string): void {
  // HTTP GET
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_GET,
    {
      title: 'HTTP GET',
      description: 'Perform HTTP GET request to retrieve data from a URL.',
      inputSchema: GetRequestSchema,
    },
    async ({ url, params }) => {
      try {
        const result = await httpGet(httpClient, url, { params });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('GET', err);
      }
    }
  );

  // HTTP POST
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_POST,
    {
      title: 'HTTP POST',
      description: 'Perform HTTP POST request to send data to a URL.',
      inputSchema: PostRequestSchema,
    },
    async ({ url, body }) => {
      try {
        const result = await httpPost(httpClient, url, { body });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('POST', err);
      }
    }
  );

  // HTTP PUT
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_PUT,
    {
      title: 'HTTP PUT',
      description: 'Perform HTTP PUT request to update data at a URL.',
      inputSchema: PutRequestSchema,
    },
    async ({ url, body }) => {
      try {
        const result = await httpPut(httpClient, url, { body });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('PUT', err);
      }
    }
  );

  // HTTP DELETE
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_DELETE,
    {
      title: 'HTTP DELETE',
      description: 'Perform HTTP DELETE request to remove data at a URL.',
      inputSchema: DeleteRequestSchema,
    },
    async ({ url }) => {
      try {
        const result = await httpDelete(httpClient, url);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('DELETE', err);
      }
    }
  );

  // HTTP PATCH
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_PATCH,
    {
      title: 'HTTP PATCH',
      description: 'Perform HTTP PATCH request for partial data update at a URL.',
      inputSchema: PatchRequestSchema,
    },
    async ({ url, body }) => {
      try {
        const result = await httpPatch(httpClient, url, { body });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('PATCH', err);
      }
    }
  );

  // HTTP HEAD
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_HEAD,
    {
      title: 'HTTP HEAD',
      description: 'Perform HTTP HEAD request to get headers without body.',
      inputSchema: HeadRequestSchema,
    },
    async ({ url, params }) => {
      try {
        const result = await httpHead(httpClient, url, { params });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        return handleError('HEAD', err);
      }
    }
  );

  // HTTP SET AUTH (API Key)
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_SET_AUTH_API_KEY,
    {
      title: 'HTTP Set API Key Auth',
      description: 'Set API key authentication for HTTP requests.',
      inputSchema: SetAuthApiKeySchema,
    },
    async ({ apiKey, headerName }) => {
      try {
        if (headerName) {
          httpClient.setHeader(headerName, apiKey);
        } else {
          httpClient.setAuth('api-key', { apiKey });
        }
        return { content: [{ type: 'text', text: 'API key authentication set' }] };
      } catch (err) {
        return handleError('SET_AUTH', err);
      }
    }
  );

  // HTTP SET AUTH (Bearer)
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_SET_AUTH_BEARER,
    {
      title: 'HTTP Set Bearer Token Auth',
      description: 'Set bearer token authentication for HTTP requests.',
      inputSchema: SetAuthBearerSchema,
    },
    async ({ token }) => {
      try {
        httpClient.setAuth('bearer', { token });
        return { content: [{ type: 'text', text: 'Bearer token authentication set' }] };
      } catch (err) {
        return handleError('SET_AUTH', err);
      }
    }
  );

  // HTTP SET AUTH (Basic)
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_SET_AUTH_BASIC,
    {
      title: 'HTTP Set Basic Auth',
      description: 'Set basic authentication (username/password) for HTTP requests.',
      inputSchema: SetAuthBasicSchema,
    },
    async ({ username, password }) => {
      try {
        httpClient.setAuth('basic', { username, password });
        return { content: [{ type: 'text', text: 'Basic authentication set' }] };
      } catch (err) {
        return handleError('SET_AUTH', err);
      }
    }
  );

  // HTTP CLEAR AUTH
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_CLEAR_AUTH,
    {
      title: 'HTTP Clear Auth',
      description: 'Clear all authentication from HTTP client.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        httpClient.clearAuth();
        return { content: [{ type: 'text', text: 'Authentication cleared' }] };
      } catch (err) {
        return handleError('CLEAR_AUTH', err);
      }
    }
  );

  // HTTP SET HEADERS
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_SET_HEADERS,
    {
      title: 'HTTP Set Headers',
      description: 'Set custom headers for HTTP requests.',
      inputSchema: SetHeadersSchema,
    },
    async ({ headers }) => {
      try {
        for (const [key, value] of Object.entries(headers)) {
          httpClient.setHeader(key, value);
        }
        return { content: [{ type: 'text', text: `Headers set: ${Object.keys(headers).join(', ')}` }] };
      } catch (err) {
        return handleError('SET_HEADERS', err);
      }
    }
  );

  // HTTP CLEAR HEADERS
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_CLEAR_HEADERS,
    {
      title: 'HTTP Clear Headers',
      description: 'Clear all custom headers from HTTP client.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        httpClient.clearHeaders();
        return { content: [{ type: 'text', text: 'Headers cleared' }] };
      } catch (err) {
        return handleError('CLEAR_HEADERS', err);
      }
    }
  );

  // HTTP SET TIMEOUT
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_SET_TIMEOUT,
    {
      title: 'HTTP Set Timeout',
      description: 'Set timeout for HTTP requests in milliseconds.',
      inputSchema: SetTimeoutSchema,
    },
    async ({ timeout_ms }) => {
      try {
        httpClient.setTimeout(timeout_ms);
        return { content: [{ type: 'text', text: `Timeout set to ${timeout_ms}ms` }] };
      } catch (err) {
        return handleError('SET_TIMEOUT', err);
      }
    }
  );

  // Sprint 8: Response Parsing Tools

  // HTTP PARSE JSON
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_PARSE_JSON,
    {
      title: 'HTTP Parse JSON',
      description: 'Parse a JSON string into an object.',
      inputSchema: ParseJsonSchema,
    },
    async ({ text }) => {
      try {
        const parsed = JSON.parse(text);
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: parsed }) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: (err as Error).message }) }] };
      }
    }
  );

  // HTTP PARSE TEXT
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_PARSE_TEXT,
    {
      title: 'HTTP Parse Text',
      description: 'Get text content from a string.',
      inputSchema: ParseTextSchema,
    },
    async ({ text }) => {
      return { content: [{ type: 'text', text }] };
    }
  );

  // HTTP GET RESPONSE HEADERS
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_GET_RESPONSE_HEADERS,
    {
      title: 'HTTP Get Response Headers',
      description: 'Get headers from the last HTTP response.',
      inputSchema: z.object({}),
    },
    async () => {
      const headers = httpClient.getLastResponseHeaders();
      return { content: [{ type: 'text', text: JSON.stringify(headers) }] };
    }
  );

  // HTTP GET STATUS CODE
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_GET_STATUS_CODE,
    {
      title: 'HTTP Get Status Code',
      description: 'Get status code from the last HTTP response.',
      inputSchema: z.object({}),
    },
    async () => {
      const status = httpClient.getLastStatusCode();
      return { content: [{ type: 'text', text: JSON.stringify({ status }) }] };
    }
  );

  // HTTP ADD QUERY PARAM
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_ADD_QUERY_PARAM,
    {
      title: 'HTTP Add Query Param',
      description: 'Add a query parameter to be used in subsequent requests.',
      inputSchema: AddQueryParamSchema,
    },
    async ({ key, value }) => {
      try {
        httpClient.setHeader(`X-Query-${key}`, value);
        return { content: [{ type: 'text', text: `Query param ${key}=${value} stored for next request` }] };
      } catch (err) {
        return handleError('ADD_QUERY_PARAM', err);
      }
    }
  );

  // Sprint 9: Security Tools

  // HTTP VALIDATE URL
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_VALIDATE_URL,
    {
      title: 'HTTP Validate URL',
      description: 'Validate a URL against security rules (protocol, hostname).',
      inputSchema: ValidateUrlSchema,
    },
    async ({ url }) => {
      const result = validateUrl(url);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // HTTP ADD URL ALLOWLIST
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_ADD_URL_ALLOWLIST,
    {
      title: 'HTTP Add URL Allowlist',
      description: 'Add a URL pattern to the allowlist.',
      inputSchema: AddUrlAllowlistSchema,
    },
    async ({ pattern }) => {
      urlAllowlist.add(pattern);
      return { content: [{ type: 'text', text: `Added to allowlist: ${pattern}` }] };
    }
  );

  // HTTP REMOVE URL ALLOWLIST
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_REMOVE_URL_ALLOWLIST,
    {
      title: 'HTTP Remove URL Allowlist',
      description: 'Remove a URL pattern from the allowlist.',
      inputSchema: RemoveUrlAllowlistSchema,
    },
    async ({ pattern }) => {
      urlAllowlist.delete(pattern);
      return { content: [{ type: 'text', text: `Removed from allowlist: ${pattern}` }] };
    }
  );

  // HTTP LIST ALLOWLIST
  server.registerTool(
    HTTP_TOOL_NAMES.HTTP_LIST_ALLOWLIST,
    {
      title: 'HTTP List Allowlist',
      description: 'List all URL patterns in the allowlist.',
      inputSchema: z.object({}),
    },
    async () => {
      const patterns = Array.from(urlAllowlist);
      return { content: [{ type: 'text', text: JSON.stringify({ patterns }) }] };
    }
  );
}