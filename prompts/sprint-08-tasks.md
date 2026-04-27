# Sprint 3: Response Parsing and Headers

**Role:** qa-engineer
**Sprint Duration:** 2-3 days
**Goal:** Implement response parsing and header retrieval tools

---

## TASK-1: Response Parsing Tools

**Prompt:**
```
Implement response parsing tools to extract and transform HTTP response data. Add JSON and text parsing capabilities.

Tools to implement:
- parse_json
- parse_text

Tasks:
1. Create src/client/ResponseParser.ts with parsing utilities
2. Implement JSON validation and extraction
3. Implement text extraction with encoding handling
4. Add parse_json tool to MCP server
5. Add parse_text tool to MCP server

Acceptance Criteria:
- parse_json extracts and validates JSON from responses
- parse_text extracts plain text with encoding support
- Parsers handle malformed data gracefully
- Parsing errors return descriptive messages
```

**File Template: src/client/ResponseParser.ts**
```typescript
export interface ParsedResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class ResponseParser {
  static parseJson(response: HttpResponse<unknown>): ParsedResponse {
    try {
      if (typeof response.data === 'object' && response.data !== null) {
        return { success: true, data: response.data };
      }
      if (typeof response.data === 'string') {
        const parsed = JSON.parse(response.data);
        return { success: true, data: parsed };
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: `JSON parse error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  static parseText(response: HttpResponse<unknown>): ParsedResponse {
    try {
      if (typeof response.data === 'string') {
        return { success: true, data: response.data };
      }
      if (typeof response.data === 'object' && response.data !== null) {
        return { success: true, data: JSON.stringify(response.data) };
      }
      return { success: true, data: String(response.data) };
    } catch (error) {
      return {
        success: false,
        error: `Text parse error: ${String(error)}`,
      };
    }
  }

  static extractValue(response: HttpResponse<unknown>, path: string): unknown {
    let data: unknown = response.data;

    for (const key of path.split('.')) {
      if (data && typeof data === 'object' && key in data) {
        data = (data as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return data;
  }
}
```

---

## TASK-2: Header Retrieval Tools

**Prompt:**
```
Implement header retrieval tools to extract response metadata. Add tools for accessing status codes and response headers.

Tools to implement:
- get_response_headers
- get_status_code

Tasks:
1. Store last response in HttpClient
2. Implement get_response_headers tool
3. Implement get_status_code tool
4. Add header extraction utilities
5. Handle missing response gracefully

Acceptance Criteria:
- get_response_headers returns all response headers
- get_status_code returns HTTP status code
- Headers are properly flattened for display
- Missing response returns appropriate error
```

**File Template: src/client/HttpClient.ts updates**
```typescript
export class HttpClient {
  private lastResponse: HttpResponse | null = null;

  async get<T = unknown>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
    const response = await this.request<T>({ method: 'GET', url, params });
    this.lastResponse = response;
    return response;
  }

  // Similar updates for post, put, delete, patch

  getLastResponse(): HttpResponse | null {
    return this.lastResponse;
  }

  getLastStatusCode(): number | null {
    return this.lastResponse?.status ?? null;
  }

  getLastHeaders(): Record<string, string> | null {
    return this.lastResponse?.headers ?? null;
  }
}
```

**File Template: Tool additions to index.ts**
```typescript
const GetResponseHeadersSchema = z.object({});

const GetStatusCodeSchema = z.object({});

// Add to tool handler switch
case 'get_response_headers': {
  const headers = httpClient.getLastHeaders();
  if (!headers) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No response available' }) }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify({ headers }) }] };
}

case 'get_status_code': {
  const status = httpClient.getLastStatusCode();
  if (status === null) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No response available' }) }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify({ status }) }] };
}

case 'parse_json': {
  const response = httpClient.getLastResponse();
  if (!response) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No response available' }) }], isError: true };
  }
  const parsed = ResponseParser.parseJson(response);
  return { content: [{ type: 'text', text: JSON.stringify(parsed) }] };
}

case 'parse_text': {
  const response = httpClient.getLastResponse();
  if (!response) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'No response available' }) }], isError: true };
  }
  const parsed = ResponseParser.parseText(response);
  return { content: [{ type: 'text', text: JSON.stringify(parsed) }] };
}
```

---

## TASK-3: Query Parameter Tools

**Prompt:**
```
Implement query parameter management. Add tool to append query parameters to requests.

Tools to implement:
- add_query_param

Tasks:
1. Create QueryParamManager class
2. Implement add_query_param tool
3. Store query params per-request and globally
4. Integrate with all HTTP methods
5. Handle encoding of special characters

Acceptance Criteria:
- add_query_param appends params to URL
- Params are properly URL-encoded
- Multiple calls accumulate params
- clear_headers resets query params
```

**File Template: src/client/QueryParamManager.ts**
```typescript
export class QueryParamManager {
  private params: Record<string, string> = {};

  add(key: string, value: string): void {
    this.params[key] = value;
  }

  getParams(): Record<string, string> {
    return { ...this.params };
  }

  clear(): void {
    this.params = {};
  }

  buildQueryString(): string {
    const entries = Object.entries(this.params);
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) => {
      const encodedKey = encodeURIComponent(k);
      const encodedValue = encodeURIComponent(v);
      return `${encodedKey}=${encodedValue}`;
    }).join('&');
  }
}
```

**File Template: add_query_param tool**
```typescript
const AddQueryParamSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const queryManager = new QueryParamManager();

// In tool handler switch
case 'add_query_param': {
  const parsed = AddQueryParamSchema.parse(args);
  queryManager.add(parsed.key, parsed.value);
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, params: queryManager.getParams() }) }] };
}

// In HTTP method calls, merge query params
async get<T>(url: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
  const mergedParams = { ...queryManager.getParams(), ...params };
  const finalUrl = url + queryManager.buildQueryString();
  queryManager.clear();
  return this.request<T>({ method: 'GET', url: finalUrl, params: mergedParams });
}
```

---

## TASK-4: Response Parsing Tests

**Prompt:**
```
Create comprehensive tests for response parsing and header retrieval. Test all parsing scenarios and edge cases.

Tasks:
1. Create tests/parser.test.ts
2. Test JSON parsing with valid responses
3. Test JSON error handling for invalid JSON
4. Test text extraction from various data types
5. Test header retrieval
6. Test status code retrieval
7. Test query parameter encoding

Acceptance Criteria:
- parse_json handles valid JSON correctly
- parse_json returns error for malformed JSON
- parse_text extracts string data
- get_response_headers returns stored headers
- get_status_code returns correct status
- add_query_param URL-encodes values
- All tests pass
```

**File Template: tests/parser.test.ts**
```typescript
import { describe, it, expect } from 'vitest';
import { ResponseParser } from '../src/client/ResponseParser.js';
import { HttpResponse } from '../src/client/HttpClient.js';

describe('ResponseParser', () => {
  const createResponse = (data: unknown): HttpResponse => ({
    data,
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

  describe('parseJson', () => {
    it('should parse object response directly', () => {
      const response = createResponse({ id: 1, name: 'test' });
      const result = ResponseParser.parseJson(response);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'test' });
    });

    it('should parse string JSON', () => {
      const response = createResponse('{"id":1}');
      const result = ResponseParser.parseJson(response);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should handle malformed JSON', () => {
      const response = createResponse('not valid json');
      const result = ResponseParser.parseJson(response);
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON parse error');
    });

    it('should handle null values', () => {
      const response = createResponse(null);
      const result = ResponseParser.parseJson(response);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('parseText', () => {
    it('should return string directly', () => {
      const response = createResponse('plain text content');
      const result = ResponseParser.parseText(response);
      expect(result.success).toBe(true);
      expect(result.data).toBe('plain text content');
    });

    it('should convert objects to string', () => {
      const response = createResponse({ key: 'value' });
      const result = ResponseParser.parseText(response);
      expect(result.success).toBe(true);
      expect(result.data).toBe('{"key":"value"}');
    });

    it('should convert numbers to string', () => {
      const response = createResponse(12345);
      const result = ResponseParser.parseText(response);
      expect(result.success).toBe(true);
      expect(result.data).toBe('12345');
    });
  });

  describe('extractValue', () => {
    it('should extract nested values', () => {
      const response = createResponse({ user: { profile: { name: 'John' } } });
      const result = ResponseParser.extractValue(response, 'user.profile.name');
      expect(result).toBe('John');
    });

    it('should return undefined for missing paths', () => {
      const response = createResponse({ user: {} });
      const result = ResponseParser.extractValue(response, 'user.profile.name');
      expect(result).toBeUndefined();
    });
  });
});

describe('QueryParamManager', () => {
  it('should URL-encode special characters', () => {
    // Test implementation
  });
});
```

---

## Acceptance Criteria Checklist

- [ ] parse_json extracts JSON from response data
- [ ] parse_json handles malformed JSON with error
- [ ] parse_text extracts text from various data types
- [ ] get_response_headers returns last response headers
- [ ] get_status_code returns HTTP status code
- [ ] add_query_param appends URL-encoded params
- [ ] Query params persist across requests
- [ ] All parsing tests pass
- [ ] No TypeScript errors in strict mode