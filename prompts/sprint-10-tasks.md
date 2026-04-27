# Sprint 5: Documentation and Package Publishing

**Role:** qa-engineer
**Sprint Duration:** 2-3 days
**Goal:** Finalize documentation, create examples, and publish package

---

## TASK-1: Comprehensive README

**Prompt:**
```
Create comprehensive README.md with installation instructions, usage examples, and API documentation for all 18 tools.

Tasks:
1. Create README.md with quick start guide
2. Document all 18 tools with examples
3. Add configuration section for auth and allowlist
4. Include troubleshooting section
5. Add badge for npm package

Acceptance Criteria:
- README has clear getting started section
- All 18 tools documented with input/output examples
- Auth configuration explained with examples
- Security section explains allowlist usage
- Troubleshooting covers common issues
```

**File Template: README.md**
```markdown
# MCP HTTP Client

MCP server for AI agents to make secure HTTP requests with URL allowlisting.

## Installation

```bash
npm install mcp-http-client
```

## Quick Start

```bash
# Start the MCP server
npx mcp-http-client

# Or use in your Claude Desktop config
{
  "mcpServers": {
    "http": {
      "command": "npx",
      "args": ["mcp-http-client"]
    }
  }
}
```

## Configuration

### Allowlist (Security)

```json
{
  "allowlist": ["*.api.github.com", "api.openai.com"]
}
```

### Authentication

```json
{
  "type": "bearer",
  "token": "your-token"
}
```

## Tools (18 total)

### Core HTTP Methods

#### http_get
Make GET request with optional query parameters.

```json
{
  "name": "http_get",
  "arguments": {
    "url": "https://api.example.com/users",
    "params": { "page": "1" }
  }
}
```

#### http_post
Make POST request with JSON body.

```json
{
  "name": "http_post",
  "arguments": {
    "url": "https://api.example.com/users",
    "body": { "name": "John", "email": "john@example.com" }
  }
}
```

#### http_put
Make PUT request for resource updates.

```json
{
  "name": "http_put",
  "arguments": {
    "url": "https://api.example.com/users/1",
    "body": { "name": "John Updated" }
  }
}
```

#### http_delete
Make DELETE request.

```json
{
  "name": "http_delete",
  "arguments": {
    "url": "https://api.example.com/users/1"
  }
}
```

#### http_patch
Make PATCH request for partial updates.

```json
{
  "name": "http_patch",
  "arguments": {
    "url": "https://api.example.com/users/1",
    "body": { "name": "Patched Name" }
  }
}
```

#### http_head
Get headers only without body.

```json
{
  "name": "http_head",
  "arguments": {
    "url": "https://api.example.com/large-file"
  }
}
```

#### http_options
Get allowed methods and CORS info.

```json
{
  "name": "http_options",
  "arguments": {
    "url": "https://api.example.com/api"
  }
}
```

### Authentication Tools

#### set_auth
Configure authentication for requests.

```json
{
  "name": "set_auth",
  "arguments": {
    "type": "bearer",
    "token": "your-jwt-token"
  }
}
```

Supported types:
- `api-key`: Set API key in header
- `bearer`: Set Bearer token
- `basic`: Set Basic auth with username/password
- `none`: Clear authentication

#### set_headers
Set default headers for all requests.

```json
{
  "name": "set_headers",
  "arguments": {
    "headers": {
      "X-Custom-Header": "value",
      "Accept": "application/json"
    }
  }
}
```

#### clear_headers
Reset headers to empty state.

```json
{
  "name": "clear_headers",
  "arguments": {}
}
```

### Configuration Tools

#### set_timeout
Set request timeout in milliseconds (100-300000).

```json
{
  "name": "set_timeout",
  "arguments": {
    "timeout": 5000
  }
}
```

#### validate_url
Validate URL against security allowlist.

```json
{
  "name": "validate_url",
  "arguments": {
    "url": "https://api.example.com",
    "checkAllowlist": true
  }
}
```

### Response Tools

#### get_response_headers
Get headers from last response.

```json
{
  "name": "get_response_headers",
  "arguments": {}
}
```

#### get_status_code
Get HTTP status from last response.

```json
{
  "name": "get_status_code",
  "arguments": {}
}
```

#### parse_json
Parse JSON from last response.

```json
{
  "name": "parse_json",
  "arguments": {}
}
```

#### parse_text
Extract text from last response.

```json
{
  "name": "parse_text",
  "arguments": {}
}
```

### Query Tools

#### add_query_param
Add query parameter to next request.

```json
{
  "name": "add_query_param",
  "arguments": {
    "key": "page",
    "value": "2"
  }
}
```

### Advanced Tools

#### retry_request
Retry request with exponential backoff.

```json
{
  "name": "retry_request",
  "arguments": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "maxRetries": 3,
    "baseDelay": 1000
  }
}
```

## Security

URL allowlisting is enabled by default. Configure allowed domains:

```json
{
  "allowlist": ["*.github.com", "api.openai.com"]
}
```

## Troubleshooting

### Connection Errors
- Check URL is in allowlist
- Verify network connectivity
- Increase timeout with `set_timeout`

### Auth Failures
- Verify auth token/key is correct
- Check header name for API keys
- Use `clear_headers` to reset state

### Parse Errors
- Use `get_status_code` to check response
- Verify content-type is JSON/text
- Use `parse_text` for non-JSON responses
```

---

## TASK-2: API Documentation

**Prompt:**
```
Create API documentation in docs/api.md with detailed specifications for each tool. Include request/response schemas and error codes.

Tasks:
1. Create docs/api.md with full API reference
2. Document error codes and messages
3. Add TypeScript type definitions
4. Create example responses for each tool

Acceptance Criteria:
- API docs cover all 18 tools
- Error codes documented with causes
- TypeScript interfaces provided
- Examples show real request/response pairs
```

**File Template: docs/api.md**
```markdown
# API Reference

## http_get

Make HTTP GET request.

**Arguments:**
```typescript
{
  url: string;           // Required. Must be valid URL
  params?: Record<string, string>;  // Optional query params
}
```

**Response:**
```typescript
{
  data: unknown;
  status: number;
  headers: Record<string, string>;
}
```

**Errors:**
- `INVALID_URL`: URL format is invalid
- `URL_NOT_ALLOWED`: URL not in allowlist
- `TIMEOUT`: Request exceeded timeout
- `NETWORK_ERROR`: Connection failed

---

## http_post

Make HTTP POST request.

**Arguments:**
```typescript
{
  url: string;
  body?: unknown;
}
```

**Response:** Same as http_get

---

## http_put

Make HTTP PUT request.

**Arguments:**
```typescript
{
  url: string;
  body?: unknown;
}
```

---

## http_delete

Make HTTP DELETE request.

**Arguments:**
```typescript
{
  url: string;
}
```

---

## http_patch

Make HTTP PATCH request.

**Arguments:**
```typescript
{
  url: string;
  body?: unknown;
}
```

---

## http_head

Make HTTP HEAD request (headers only).

**Arguments:**
```typescript
{
  url: string;
}
```

---

## http_options

Make HTTP OPTIONS request (CORS info).

**Arguments:**
```typescript
{
  url: string;
}
```

---

## set_auth

Configure authentication.

**Arguments:**
```typescript
{
  type: 'api-key' | 'bearer' | 'basic' | 'none';
  key?: string;           // For api-key
  token?: string;         // For bearer
  username?: string;      // For basic
  password?: string;      // For basic
  prefix?: string;        // Optional prefix for api-key
  headerName?: string;    // Custom header for api-key
}
```

**Response:**
```typescript
{
  success: true;
  auth: AuthConfig;
}
```

---

## set_headers

Set default headers.

**Arguments:**
```typescript
{
  headers: Record<string, string>;
}
```

**Response:**
```typescript
{
  success: true;
  headers: Record<string, string>;
}
```

---

## clear_headers

Clear all default headers.

**Arguments:** `{}`

**Response:**
```typescript
{
  success: true;
  headers: {};
}
```

---

## set_timeout

Set request timeout.

**Arguments:**
```typescript
{
  timeout: number;  // 100-300000 ms
}
```

**Response:**
```typescript
{
  success: true;
  timeout: number;
}
```

---

## validate_url

Validate URL against allowlist.

**Arguments:**
```typescript
{
  url: string;
  checkAllowlist?: boolean;
}
```

**Response:**
```typescript
{
  valid: true;
  url: string;
}
```

**Error Response:**
```typescript
{
  valid: false;
  error: string;
}
```

---

## get_response_headers

Get last response headers.

**Arguments:** `{}`

**Response:**
```typescript
{
  headers: Record<string, string>;
}
```

**Error:** No response available

---

## get_status_code

Get last HTTP status code.

**Arguments:** `{}`

**Response:**
```typescript
{
  status: number;
}
```

---

## parse_json

Parse JSON from last response.

**Arguments:** `{}`

**Response:**
```typescript
{
  success: true;
  data: unknown;
}
```

**Error Response:**
```typescript
{
  success: false;
  error: string;
}
```

---

## parse_text

Extract text from last response.

**Arguments:** `{}`

**Response:**
```typescript
{
  success: true;
  data: string;
}
```

---

## add_query_param

Add query parameter.

**Arguments:**
```typescript
{
  key: string;
  value: string;
}
```

**Response:**
```typescript
{
  success: true;
  params: Record<string, string>;
}
```

---

## retry_request

Retry request with backoff.

**Arguments:**
```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  maxRetries?: number;    // 0-5, default 3
  baseDelay?: number;     // ms, default 1000
  body?: unknown;         // For POST/PUT/PATCH
  params?: Record<string, string>;
}
```

**Response:** Same as http_get

---

## Error Codes

| Code | Cause | Resolution |
|------|-------|------------|
| INVALID_URL | Malformed URL | Check URL format |
| URL_NOT_ALLOWED | Not in allowlist | Add to allowlist |
| TIMEOUT | Exceeded timeout | Increase or check network |
| NETWORK_ERROR | Connection failed | Check network connectivity |
| PARSE_ERROR | Invalid JSON | Use parse_text instead |
| AUTH_FAILED | Invalid credentials | Verify auth configuration |
| MAX_RETRIES | Retry limit exceeded | Check endpoint availability |
```

---

## TASK-3: Final Test Suite

**Prompt:**
```
Create comprehensive end-to-end test suite that tests all 18 tools. Verify complete integration with MCP protocol.

Tasks:
1. Create tests/e2e/allTools.test.ts
2. Test all 18 tools in sequence
3. Verify MCP protocol compliance
4. Test error handling across all tools
5. Run full test suite with coverage

Acceptance Criteria:
- All 18 tools have integration tests
- Tests run with: npm test
- Coverage report generated
- All tests pass before publish
- No failing or skipped tests
```

**File Template: tests/e2e/allTools.test.ts**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../../src/client/HttpClient.js';
import { UrlValidator } from '../../src/client/UrlValidator.js';
import { RetryHandler } from '../../src/client/RetryHandler.js';
import { ResponseParser } from '../../src/client/ResponseParser.js';

describe('All Tools Integration', () => {
  let client: HttpClient;
  let validator: UrlValidator;
  let retryHandler: RetryHandler;

  beforeEach(() => {
    client = new HttpClient('https://jsonplaceholder.typicode.com');
    validator = new UrlValidator();
    validator.setEnabled(false); // Disable for testing
    retryHandler = new RetryHandler();
  });

  describe('Core HTTP Methods', () => {
    it('http_get should fetch data', async () => {
      const result = await client.get('/posts/1');
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('id');
    });

    it('http_post should create resource', async () => {
      const result = await client.post('/posts', { title: 'Test', body: 'Content' });
      expect(result.status).toBe(201);
    });

    it('http_put should update resource', async () => {
      const result = await client.put('/posts/1', { title: 'Updated' });
      expect(result.status).toBe(200);
    });

    it('http_delete should remove resource', async () => {
      const result = await client.delete('/posts/1');
      expect(result.status).toBe(200);
    });

    it('http_patch should partially update', async () => {
      const result = await client.patch('/posts/1', { title: 'Patched' });
      expect(result.status).toBe(200);
    });

    it('http_head should return headers only', async () => {
      const result = await client.head('/posts/1');
      expect(result.status).toBe(200);
    });

    it('http_options should return allowed methods', async () => {
      const result = await client.options('/posts');
      expect(result.status).toBe(200);
    });
  });

  describe('Auth Configuration', () => {
    it('set_auth should configure bearer token', () => {
      // Test auth configuration
    });

    it('set_auth should configure api-key', () => {
      // Test API key auth
    });

    it('set_auth should configure basic auth', () => {
      // Test basic auth
    });
  });

  describe('Header Management', () => {
    it('set_headers should add custom headers', () => {
      // Test header setting
    });

    it('clear_headers should reset headers', () => {
      // Test header clearing
    });
  });

  describe('Timeout Configuration', () => {
    it('set_timeout should configure request timeout', () => {
      client.setTimeout(5000);
      // Verify timeout is set
    });
  });

  describe('Response Parsing', () => {
    it('parse_json should extract JSON data', async () => {
      const response = await client.get('/posts/1');
      const parsed = ResponseParser.parseJson(response);
      expect(parsed.success).toBe(true);
    });

    it('parse_text should extract text data', async () => {
      const response = await client.get('/posts/1');
      const parsed = ResponseParser.parseText(response);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Query Parameters', () => {
    it('add_query_param should build query string', () => {
      // Test query param building
    });
  });

  describe('Security', () => {
    it('validate_url should validate URL format', () => {
      expect(validator.validateUrl('https://example.com').valid).toBe(true);
      expect(validator.validateUrl('invalid').valid).toBe(false);
    });

    it('validate_url should check allowlist', () => {
      validator.setEnabled(true);
      validator.setAllowlist(['example.com']);
      expect(validator.isAllowed('https://example.com').allowed).toBe(true);
      expect(validator.isAllowed('https://evil.com').allowed).toBe(false);
    });
  });

  describe('Retry Mechanism', () => {
    it('retry_request should retry on failure', async () => {
      // Test retry logic
    });
  });
});
```

---

## TASK-4: Package Publishing

**Prompt:**
```
Prepare and publish the MCP HTTP client package to npm. Ensure all files are properly configured for publishing.

Tasks:
1. Update package.json with proper metadata
2. Create .npmignore file
3. Verify build output in dist/
4. Publish to npm with proper versioning
5. Create git tag for release

Acceptance Criteria:
- package.json has correct name, version, description
- README.md is included in published files
- Type declarations (.d.ts) are generated
- Package publishes successfully to npm
- Git tag created for release
- npm page shows correct information
```

**File Template: package.json (final)**
```json
{
  "name": "mcp-http-client",
  "version": "1.0.0",
  "description": "MCP server for AI agents to make secure HTTP requests with URL allowlisting",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "http",
    "client",
    "ai",
    "agents"
  ],
  "author": "",
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build"
  }
}
```

**File Template: .npmignore**
```
src/
tests/
*.test.ts
vitest.config.ts
tsconfig.json
node_modules/
.env
.git/
*.md
!README.md
```

---

## TASK-5: Release Documentation

**Prompt:**
```
Create release notes and changelog for version 1.0.0. Document all features, tools, and known limitations.

Tasks:
1. Create CHANGELOG.md
2. Create CONTRIBUTING.md with development setup
3. Verify all documentation is complete

Acceptance Criteria:
- CHANGELOG documents v1.0.0 release
- CONTRIBUTING has setup instructions
- Documentation is complete for all 18 tools
- Project is ready for public use
```

**File Template: CHANGELOG.md**
```markdown
# Changelog

## [1.0.0] - 2026-04-26

### Added

#### Core HTTP Methods (7 tools)
- `http_get` - GET request with query params
- `http_post` - POST with JSON body
- `http_put` - PUT for resource updates
- `http_delete` - DELETE requests
- `http_patch` - PATCH for partial updates
- `http_head` - HEAD requests for headers only
- `http_options` - OPTIONS for CORS/preflight

#### Authentication (1 tool)
- `set_auth` - Configure API key, Bearer, or Basic auth

#### Header Management (3 tools)
- `set_headers` - Set default headers
- `clear_headers` - Reset headers to defaults
- `get_response_headers` - Retrieve response headers

#### Response Parsing (2 tools)
- `parse_json` - Parse JSON response
- `parse_text` - Extract text response

#### Configuration (2 tools)
- `set_timeout` - Configure request timeout
- `add_query_param` - Add query parameters

#### Security (1 tool)
- `validate_url` - Validate URL against allowlist

#### Advanced (2 tools)
- `retry_request` - Retry with exponential backoff
- `get_status_code` - Get HTTP status code

### Security
- URL allowlisting with wildcard support
- Configurable authentication per request
- Timeout protection (100ms-300s)

### Technical
- Built with TypeScript strict mode
- ESM module support
- Full type declarations
- Comprehensive test coverage
```

---

## Acceptance Criteria Checklist

- [ ] README.md documents all 18 tools
- [ ] API documentation complete in docs/api.md
- [ ] CHANGELOG.md created for v1.0.0
- [ ] CONTRIBUTING.md has development setup
- [ ] package.json ready for npm publishing
- [ ] Build output includes type declarations
- [ ] All 18 tools have tests
- [ ] Test suite passes completely
- [ ] Package published to npm
- [ ] Git tag created for release