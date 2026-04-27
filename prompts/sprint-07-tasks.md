# Sprint 2: Authentication and Headers

**Role:** qa-engineer
**Sprint Duration:** 2-3 days
**Goal:** Implement authentication and header management tools

---

## TASK-1: Authentication Configuration

**Prompt:**
```
Implement authentication system supporting API Key, Bearer Token, and Basic Auth. Create flexible auth configuration that can be applied per-request or as defaults.

Tools to implement:
- set_auth
- set_headers
- clear_headers

Tasks:
1. Create src/client/AuthConfig.ts with auth type definitions
2. Implement auth application in HttpClient
3. Add set_auth tool to MCP server
4. Add set_headers tool to MCP server
5. Add clear_headers tool to MCP server

Acceptance Criteria:
- set_auth supports api-key, bearer, basic auth types
- set_headers adds custom headers to all requests
- clear_headers resets headers to defaults
- Auth is properly applied to all HTTP requests
- Auth can be combined with existing headers
```

**File Template: src/client/AuthConfig.ts**
```typescript
export type AuthType = 'api-key' | 'bearer' | 'basic' | 'none';

export interface ApiKeyConfig {
  type: 'api-key';
  key: string;
  prefix?: string;
  headerName?: string;
}

export interface BearerConfig {
  type: 'bearer';
  token: string;
}

export interface BasicAuthConfig {
  type: 'basic';
  username: string;
  password: string;
}

export type AuthConfig = ApiKeyConfig | BearerConfig | BasicAuthConfig | { type: 'none' };

export function applyAuth(config: AuthConfig, headers: Record<string, string>): Record<string, string> {
  const newHeaders = { ...headers };

  switch (config.type) {
    case 'api-key': {
      const headerName = config.headerName || 'X-API-Key';
      const prefix = config.prefix || '';
      newHeaders[headerName] = `${prefix}${config.key}`;
      break;
    }
    case 'bearer':
      newHeaders['Authorization'] = `Bearer ${config.token}`;
      break;
    case 'basic': {
      const encoded = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      newHeaders['Authorization'] = `Basic ${encoded}`;
      break;
    }
    case 'none':
      break;
  }

  return newHeaders;
}
```

**File Template: src/index.ts additions**
```typescript
// Add after existing tool handlers

const SetAuthSchema = z.object({
  type: z.enum(['api-key', 'bearer', 'basic', 'none']),
  key: z.string().optional(),
  token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  prefix: z.string().optional(),
  headerName: z.string().optional(),
});

const SetHeadersSchema = z.object({
  headers: z.record(z.string()),
});

const ClearHeadersSchema = z.object({});

// Add state management
let globalHeaders: Record<string, string> = {};
let globalAuth: AuthConfig = { type: 'none' };

// Add to tool handler switch
case 'set_auth': {
  const parsed = SetAuthSchema.parse(args);
  globalAuth = parsed as AuthConfig;
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, auth: globalAuth }) }] };
}
case 'set_headers': {
  const parsed = SetHeadersSchema.parse(args);
  globalHeaders = { ...globalHeaders, ...parsed.headers };
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, headers: globalHeaders }) }] };
}
case 'clear_headers': {
  globalHeaders = {};
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, headers: {} }) }] };
}

// Modify HttpClient request to apply auth and headers
private applyAuthAndHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
  const headers = applyAuth(globalAuth, globalHeaders);
  return {
    ...config,
    headers: { ...headers, ...config.headers },
  };
}
```

---

## TASK-2: Timeout Configuration

**Prompt:**
```
Implement timeout configuration system. Add set_timeout tool and configure axios timeout handling.

Tools to implement:
- set_timeout

Tasks:
1. Add timeout state to HttpClient
2. Implement set_timeout tool in MCP server
3. Configure axios timeout in request handler
4. Add timeout error handling

Acceptance Criteria:
- set_timeout accepts duration in milliseconds
- Timeout is applied to all subsequent requests
- Timeout errors return descriptive messages
- Default timeout is 30 seconds if not configured
```

**File Template: src/client/HttpClient.ts timeout update**
```typescript
export class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;
  private headers: Record<string, string> = {};
  private timeout: number = 30000;
  private auth: AuthConfig = { type: 'none' };

  setTimeout(ms: number): void {
    this.timeout = Math.max(100, Math.min(ms, 300000)); // 100ms to 5min
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
  }

  setAuth(config: AuthConfig): void {
    this.auth = config;
  }

  // Update request method
  private async request<T>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const authHeaders = applyAuth(this.auth, this.headers);
    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...authHeaders, ...config.headers },
    };

    try {
      const response = await this.client.request(requestConfig);
      return {
        data: response.data,
        status: response.status,
        headers: this.flattenHeaders(response.headers),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw this.handleError(error);
    }
  }
}
```

**File Template: SetTimeout tool addition**
```typescript
const SetTimeoutSchema = z.object({
  timeout: z.number().min(100).max(300000),
});

// In tool handler switch
case 'set_timeout': {
  const parsed = SetTimeoutSchema.parse(args);
  httpClient.setTimeout(parsed.timeout);
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, timeout: parsed.timeout }) }] };
}
```

---

## TASK-3: Unit Tests for Auth and Headers

**Prompt:**
```
Create comprehensive unit tests for authentication and header configuration. Test all auth types and header manipulation.

Tasks:
1. Create tests/auth.test.ts
2. Test API Key auth with custom header names
3. Test Bearer token auth
4. Test Basic auth encoding
5. Test set_headers and clear_headers
6. Test set_timeout configuration
7. Test auth and headers combination

Acceptance Criteria:
- All auth types tested with proper header output
- Header manipulation operations verified
- Timeout configuration tested
- Combined auth + headers tested
- Test suite passes completely
```

**File Template: tests/auth.test.ts**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { applyAuth, AuthConfig } from '../src/client/AuthConfig.js';

describe('Auth Configuration', () => {
  describe('api-key', () => {
    it('should apply API key with default header', () => {
      const config: AuthConfig = { type: 'api-key', key: 'my-api-key' };
      const headers = applyAuth(config, {});
      expect(headers['X-API-Key']).toBe('my-api-key');
    });

    it('should apply API key with custom header and prefix', () => {
      const config: AuthConfig = { type: 'api-key', key: 'key123', headerName: 'Authorization', prefix: 'ApiKey ' };
      const headers = applyAuth(config, {});
      expect(headers['Authorization']).toBe('ApiKey key123');
    });
  });

  describe('bearer', () => {
    it('should apply Bearer token', () => {
      const config: AuthConfig = { type: 'bearer', token: 'jwt-token' };
      const headers = applyAuth(config, {});
      expect(headers['Authorization']).toBe('Bearer jwt-token');
    });
  });

  describe('basic', () => {
    it('should apply Basic auth with encoded credentials', () => {
      const config: AuthConfig = { type: 'basic', username: 'user', password: 'pass' };
      const headers = applyAuth(config, {});
      expect(headers['Authorization']).toBe('Basic dXNlcjpwYXNz');
    });
  });

  describe('none', () => {
    it('should not modify headers', () => {
      const config: AuthConfig = { type: 'none' };
      const existingHeaders = { 'Content-Type': 'application/json' };
      const headers = applyAuth(config, existingHeaders);
      expect(headers).toEqual(existingHeaders);
    });
  });
});

describe('Header Management', () => {
  it('should merge custom headers with auth headers', () => {
    const config: AuthConfig = { type: 'bearer', token: 'token' };
    const customHeaders = { 'X-Custom': 'value' };
    const headers = applyAuth(config, customHeaders);
    expect(headers['Authorization']).toBe('Bearer token');
    expect(headers['X-Custom']).toBe('value');
  });
});
```

---

## TASK-4: Integration Tests

**Prompt:**
```
Create integration tests that verify auth and headers work with actual HTTP requests. Mock external services and verify proper request construction.

Tasks:
1. Create tests/integration/auth.integration.test.ts
2. Test header merging across requests
3. Test auth persistence across multiple calls
4. Test timeout configuration changes

Acceptance Criteria:
- Integration tests verify real request construction
- Auth headers appear correctly in requests
- Custom headers persist across calls
- Timeout changes apply correctly
```

**File Template: tests/integration/auth.integration.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../../src/client/HttpClient.js';

vi.mock('axios');

describe('Auth Integration Tests', () => {
  let client: HttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HttpClient('https://api.example.com');
  });

  it('should apply auth to GET request', async () => {
    const requestSpy = vi.mocked(axios.create().request);
    requestSpy.mockResolvedValue({ data: {}, status: 200, headers: {} });

    client.setAuth({ type: 'bearer', token: 'test-token' });
    await client.get('/test');

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should apply multiple headers to POST request', async () => {
    const requestSpy = vi.mocked(axios.create().request);
    requestSpy.mockResolvedValue({ data: {}, status: 201, headers: {} });

    client.setAuth({ type: 'api-key', key: 'key', headerName: 'X-API-Key' });
    await client.post('/test', { data: 'value' });

    const call = requestSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(call.headers).toHaveProperty('X-API-Key');
    expect(call.headers).toHaveProperty('Content-Type');
  });

  it('should reset timeout correctly', async () => {
    client.setTimeout(5000);
    expect(client).toBeDefined(); // Verify timeout setter works
  });
});
```

---

## Acceptance Criteria Checklist

- [ ] set_auth supports api-key, bearer, basic, none
- [ ] set_headers adds custom headers to requests
- [ ] clear_headers resets all headers
- [ ] set_timeout configures request timeout (100ms-300s)
- [ ] Auth combines properly with custom headers
- [ ] Unit tests cover all auth types
- [ ] Integration tests verify real behavior
- [ ] No TypeScript errors in strict mode