# Sprint 6 Task Prompts — HTTP Client Foundation

**Sprint:** 6 — HTTP Client Foundation
**Duration:** 2026-06-09 to 2026-06-15
**Agent:** @qa-engineer

---

## TASK-1: Project Setup and Core Client

**Prompt:**
```
Initialize the MCP HTTP client project with TypeScript. Create the core HTTP client class that will serve as the foundation for all HTTP operations.

Tasks:
1. Create package.json with dependencies: typescript, @modelcontextprotocol/sdk, axios, zod
2. Set up tsconfig.json with strict mode enabled
3. Create src/index.ts as the main entry point
4. Create src/client/HttpClient.ts with axios instance configuration
5. Implement error handling wrapper for all HTTP requests

Tools to implement:
- http_get
- http_post
- http_put
- http_delete
- http_patch

Acceptance Criteria:
- Project compiles without errors
- HTTP client supports all 5 methods (GET, POST, PUT, DELETE, PATCH)
- Each method returns properly typed response
- Error responses include status code and message
- Configuration supports base URL and default options
```

**File Template: src/client/HttpClient.ts**
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;
  private headers: Record<string, string> = {};
  private timeout: number = 30000;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: this.timeout,
    });
  }

  async get<T = unknown>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async delete<T = unknown>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  }

  async patch<T = unknown>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        ...config,
        headers: { ...this.headers, ...config.headers },
      });
      return {
        data: response.data,
        status: response.status,
        headers: this.flattenHeaders(response.headers),
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private flattenHeaders(headers: unknown): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers && typeof headers === 'object') {
      Object.entries(headers as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === 'string') {
          result[key] = value;
        } else if (Array.isArray(value)) {
          result[key] = value.join(', ');
        }
      });
    }
    return result;
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return new Error(`HTTP ${error.response?.status || 'unknown'}: ${error.message}`);
    }
    return new Error(String(error));
  }
}
```

---

## TASK-2: MCP Server Entry Point

**Prompt:**
```
Create the MCP server entry point that registers all HTTP tools. Set up the proper MCP protocol handling with resource and tool definitions.

Tasks:
1. Create src/index.ts with MCP server initialization
2. Register all 5 HTTP methods as MCP tools
3. Add tool input validation using zod
4. Implement proper error response formatting

Acceptance Criteria:
- MCP server starts without errors
- All 5 HTTP tools are registered and callable
- Tool inputs are validated before execution
- Errors return structured JSON responses
```

**File Template: src/index.ts**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { HttpClient, HttpResponse } from './client/HttpClient.js';

const httpClient = new HttpClient();

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

const server = new Server(
  { name: 'mcp-http-client', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'http_get': {
        const parsed = GetRequestSchema.parse(args);
        const result = await httpClient.get(parsed.url, parsed.params);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      case 'http_post': {
        const parsed = PostRequestSchema.parse(args);
        const result = await httpClient.post(parsed.url, parsed.body);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      case 'http_put': {
        const parsed = PutRequestSchema.parse(args);
        const result = await httpClient.put(parsed.url, parsed.body);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      case 'http_delete': {
        const parsed = DeleteRequestSchema.parse(args);
        const result = await httpClient.delete(parsed.url);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      case 'http_patch': {
        const parsed = PatchRequestSchema.parse(args);
        const result = await httpClient.patch(parsed.url, parsed.body);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

---

## TASK-3: Basic Unit Tests

**Prompt:**
```
Create comprehensive unit tests for the core HTTP client. Mock axios responses and test all 5 HTTP methods with various scenarios.

Tasks:
1. Create tests/httpClient.test.ts with mocked axios
2. Test success responses for all 5 methods
3. Test error handling for network failures
4. Test timeout scenarios
5. Verify header and parameter handling

Acceptance Criteria:
- All 5 HTTP methods have test coverage
- Mock responses are properly configured
- Edge cases (empty body, custom headers) are tested
- Test suite runs with: npm test
```

**File Template: tests/httpClient.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../src/client/HttpClient.js';
import axios from 'axios';

vi.mock('axios');

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HttpClient('https://api.example.com');
  });

  describe('http_get', () => {
    it('should make GET request and return parsed response', async () => {
      const mockData = { id: 1, name: 'test' };
      vi.mocked(axios.create().request).mockResolvedValue({
        data: mockData,
        status: 200,
        headers: { 'content-type': 'application/json' },
      });

      const result = await client.get('/users/1');
      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(200);
    });
  });

  describe('http_post', () => {
    it('should POST data and return response', async () => {
      const mockData = { id: 1, created: true };
      vi.mocked(axios.create().request).mockResolvedValue({
        data: mockData,
        status: 201,
        headers: {},
      });

      const result = await client.post('/users', { name: 'test' });
      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(201);
    });
  });

  describe('http_put', () => {
    it('should PUT update and return response', async () => {
      vi.mocked(axios.create().request).mockResolvedValue({
        data: { updated: true },
        status: 200,
        headers: {},
      });

      const result = await client.put('/users/1', { name: 'updated' });
      expect(result.status).toBe(200);
    });
  });

  describe('http_delete', () => {
    it('should DELETE resource and return response', async () => {
      vi.mocked(axios.create().request).mockResolvedValue({
        data: null,
        status: 204,
        headers: {},
      });

      const result = await client.delete('/users/1');
      expect(result.status).toBe(204);
    });
  });

  describe('http_patch', () => {
    it('should PATCH partial update and return response', async () => {
      vi.mocked(axios.create().request).mockResolvedValue({
        data: { patched: true },
        status: 200,
        headers: {},
      });

      const result = await client.patch('/users/1', { name: 'patched' });
      expect(result.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should throw descriptive error on request failure', async () => {
      vi.mocked(axios.create().request).mockRejectedValue(new Error('Network error'));

      await expect(client.get('/users')).rejects.toThrow('HTTP undefined: Network error');
    });
  });
});
```

---

## TASK-4: TypeScript Configuration and Build

**Prompt:**
```
Set up proper TypeScript build configuration with strict type checking. Configure tsconfig.json and package.json for proper build output.

Tasks:
1. Configure tsconfig.json with strict mode
2. Set up proper module resolution (NodeNext)
3. Configure build scripts in package.json
4. Add ESM output support
5. Create proper type exports

Acceptance Criteria:
- TypeScript compiles without errors in strict mode
- Build output goes to dist/ directory
- ESM modules are properly generated
- Package.json has correct export configuration
```

**File Template: tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**File Template: package.json additions**
```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Acceptance Criteria Checklist

- [ ] Project initializes with TypeScript strict mode
- [ ] http_get, http_post, http_put, http_delete, http_patch implemented
- [ ] MCP server starts and registers all tools
- [ ] Unit tests cover all HTTP methods
- [ ] Build produces valid ESM output
- [ ] No TypeScript errors in strict mode