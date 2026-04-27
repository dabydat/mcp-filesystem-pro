# Sprint 4: Security and URL Allowlisting

**Role:** qa-engineer
**Sprint Duration:** 2-3 days
**Goal:** Implement URL validation, security controls, and retry mechanisms

---

## TASK-1: URL Validation and Allowlisting

**Prompt:**
```
Implement URL validation system with allowlist support. Ensure all HTTP requests go through validated URLs only.

Tools to implement:
- validate_url

Tasks:
1. Create src/client/UrlValidator.ts with allowlist logic
2. Implement pattern matching for wildcards
3. Add validate_url tool to MCP server
4. Integrate validation into all HTTP methods
5. Handle invalid URL errors gracefully

Acceptance Criteria:
- validate_url checks URL against configured allowlist
- Wildcard patterns supported (*.example.com)
- Invalid URLs return clear error messages
- All HTTP methods enforce URL validation
- Allowlist is configurable and persists
```

**File Template: src/client/UrlValidator.ts**
```typescript
export interface AllowlistConfig {
  patterns: string[];
  enabled: boolean;
}

export class UrlValidator {
  private allowlist: string[] = [];
  private enabled: boolean = true;

  setAllowlist(patterns: string[]): void {
    this.allowlist = patterns;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isAllowed(url: string): { allowed: boolean; reason?: string } {
    if (!this.enabled) {
      return { allowed: true };
    }

    if (this.allowlist.length === 0) {
      return { allowed: true }; // No allowlist = allow all
    }

    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.toLowerCase();

      for (const pattern of this.allowlist) {
        const regex = this.patternToRegex(pattern);
        if (regex.test(host)) {
          return { allowed: true };
        }
      }

      return {
        allowed: false,
        reason: `URL "${url}" is not in the allowlist. Allowed patterns: ${this.allowlist.join(', ')}`,
      };
    } catch {
      return { allowed: false, reason: `Invalid URL format: ${url}` };
    }
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`, 'i');
  }

  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: `Invalid URL format: ${url}` };
    }
  }
}
```

**File Template: validate_url tool**
```typescript
const ValidateUrlSchema = z.object({
  url: z.string(),
  checkAllowlist: z.boolean().optional(),
});

const urlValidator = new UrlValidator();

// Add to tool handler switch
case 'validate_url': {
  const parsed = ValidateUrlSchema.parse(args);
  const urlValidation = urlValidator.validateUrl(parsed.url);

  if (!urlValidation.valid) {
    return { content: [{ type: 'text', text: JSON.stringify(urlValidation) }], isError: true };
  }

  if (parsed.checkAllowlist !== false) {
    const allowlistCheck = urlValidator.isAllowed(parsed.url);
    if (!allowlistCheck.allowed) {
      return { content: [{ type: 'text', text: JSON.stringify(allowlistCheck) }], isError: true };
    }
  }

  return { content: [{ type: 'text', text: JSON.stringify({ valid: true, url: parsed.url }) }] };
}
```

---

## TASK-2: Retry Mechanism with Backoff

**Prompt:**
```
Implement retry mechanism with exponential backoff for failed requests. Add configurable retry behavior.

Tools to implement:
- retry_request

Tasks:
1. Create src/client/RetryHandler.ts with backoff logic
2. Implement exponential backoff algorithm
3. Add retry_request tool to MCP server
4. Integrate retry with all HTTP methods
5. Handle non-idempotent requests safely

Acceptance Criteria:
- retry_request retries failed requests with backoff
- Backoff starts at 1s and doubles up to 30s max
- Retry only on retryable errors (5xx, network)
- Maximum 3 retries by default
- retry_request is configurable per call
```

**File Template: src/client/RetryHandler.ts**
```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class RetryHandler {
  private config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  setConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RetryConfig {
    return { ...this.config };
  }

  async execute<T>(fn: () => Promise<T>, options?: Partial<RetryConfig>): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.config.maxRetries;
    const baseDelay = options?.baseDelay ?? this.config.baseDelay;
    const maxDelay = options?.maxDelay ?? this.config.maxDelay;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) break;

        if (!this.isRetryable(error)) break;

        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
      return true;
    }

    // 5xx errors
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status >= 500 && status < 600;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**File Template: retry_request tool**
```typescript
const RetryRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().url(),
  maxRetries: z.number().min(0).max(5).optional(),
  baseDelay: z.number().min(100).max(30000).optional(),
  body: z.unknown().optional(),
  params: z.record(z.string()).optional(),
});

const retryHandler = new RetryHandler();

// Add to tool handler switch
case 'retry_request': {
  const parsed = RetryRequestSchema.parse(args);
  const allowlistCheck = urlValidator.isAllowed(parsed.url);

  if (!allowlistCheck.allowed) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: allowlistCheck.reason }) }], isError: true };
  }

  try {
    const result = await retryHandler.execute(async () => {
      switch (parsed.method) {
        case 'GET': return httpClient.get(parsed.url, parsed.params);
        case 'POST': return httpClient.post(parsed.url, parsed.body);
        case 'PUT': return httpClient.put(parsed.url, parsed.body);
        case 'DELETE': return httpClient.delete(parsed.url);
        case 'PATCH': return httpClient.patch(parsed.url, parsed.body);
      }
    }, { maxRetries: parsed.maxRetries, baseDelay: parsed.baseDelay });

    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: String(error) }) }], isError: true };
  }
}
```

---

## TASK-3: Security Tests

**Prompt:**
```
Create comprehensive security tests for URL validation and retry mechanisms. Test allowlist patterns and retry behavior.

Tasks:
1. Create tests/security/urlValidator.test.ts
2. Test valid URL patterns
3. Test wildcard allowlist matching
4. Test blocked URLs return errors
5. Test retry on 5xx errors
6. Test no retry on 4xx errors
7. Test backoff timing

Acceptance Criteria:
- URL validation tests cover all patterns
- Allowlist wildcards work correctly
- Invalid URLs are blocked with clear errors
- Retry only triggers on appropriate errors
- Backoff delays are approximately correct
- All security tests pass
```

**File Template: tests/security/urlValidator.test.ts**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UrlValidator } from '../../src/client/UrlValidator.js';

describe('UrlValidator', () => {
  let validator: UrlValidator;

  beforeEach(() => {
    validator = new UrlValidator();
    validator.setEnabled(true);
    validator.setAllowlist(['*.example.com', 'api.test.com']);
  });

  describe('isAllowed', () => {
    it('should allow URLs matching wildcard pattern', () => {
      expect(validator.isAllowed('https://sub.example.com/api').allowed).toBe(true);
      expect(validator.isAllowed('https://api.test.com/v1').allowed).toBe(true);
    });

    it('should block URLs not matching allowlist', () => {
      const result = validator.isAllowed('https://evil.com/api');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not in the allowlist');
    });

    it('should allow all when allowlist is empty', () => {
      validator.setAllowlist([]);
      expect(validator.isAllowed('https://any.com/api').allowed).toBe(true);
    });

    it('should allow all when validation is disabled', () => {
      validator.setEnabled(false);
      expect(validator.isAllowed('https://any.com/api').allowed).toBe(true);
    });

    it('should handle invalid URL format', () => {
      const result = validator.isAllowed('not-a-url');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Invalid URL');
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validator.validateUrl('https://example.com').valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = validator.validateUrl('ht://invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid URL');
    });
  });
});
```

**File Template: tests/security/retry.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryHandler } from '../../src/client/RetryHandler.js';

describe('RetryHandler', () => {
  let retryHandler: RetryHandler;

  beforeEach(() => {
    retryHandler = new RetryHandler();
  });

  describe('execute', () => {
    it('should return result on successful call', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryHandler.execute(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce('success');

      const result = await retryHandler.execute(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('HTTP 502: Bad Gateway'))
        .mockResolvedValueOnce({ data: 'ok' });

      const result = await retryHandler.execute(fn);
      expect(result).toEqual({ data: 'ok' });
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('HTTP 404: Not Found'));

      await expect(retryHandler.execute(fn)).rejects.toThrow('HTTP 404');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect maxRetries option', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(retryHandler.execute(fn, { maxRetries: 2 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('backoff timing', () => {
    it('should delay between retries', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValueOnce('success');

      const start = Date.now();
      await retryHandler.execute(fn, { baseDelay: 100, maxRetries: 1 });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });
});
```

---

## TASK-4: Additional HTTP Methods

**Prompt:**
```
Implement HEAD and OPTIONS HTTP methods for metadata retrieval and CORS preflight support.

Tools to implement:
- http_head
- http_options

Tasks:
1. Add head() method to HttpClient
2. Add options() method to HttpClient
3. Register http_head tool in MCP server
4. Register http_options tool in MCP server
5. Add appropriate tests

Acceptance Criteria:
- http_head returns headers without body
- http_options returns allowed methods and CORS info
- Both methods respect auth and header configuration
- Both methods validate URLs against allowlist
- Tests verify correct behavior
```

**File Template: HttpClient methods**
```typescript
async head(url: string): Promise<HttpResponse<null>> {
  return this.request<null>({ method: 'HEAD', url });
}

async options(url: string): Promise<HttpResponse<{ allow: string; methods: string[] }>> {
  return this.request<{ allow: string; methods: string[] }>({ method: 'OPTIONS', url });
}
```

**File Template: MCP tool additions**
```typescript
const HeadRequestSchema = z.object({
  url: z.string().url(),
});

const OptionsRequestSchema = z.object({
  url: z.string().url(),
});

// In tool handler switch
case 'http_head': {
  const parsed = HeadRequestSchema.parse(args);
  const allowlistCheck = urlValidator.isAllowed(parsed.url);
  if (!allowlistCheck.allowed) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: allowlistCheck.reason }) }], isError: true };
  }
  const result = await httpClient.head(parsed.url);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

case 'http_options': {
  const parsed = OptionsRequestSchema.parse(args);
  const allowlistCheck = urlValidator.isAllowed(parsed.url);
  if (!allowlistCheck.allowed) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: allowlistCheck.reason }) }], isError: true };
  }
  const result = await httpClient.options(parsed.url);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}
```

---

## Acceptance Criteria Checklist

- [ ] validate_url checks URL against allowlist
- [ ] Wildcard patterns work (*.example.com)
- [ ] Blocked URLs return clear error messages
- [ ] retry_request retries with exponential backoff
- [ ] Backoff respects maxDelay (30s)
- [ ] 5xx errors trigger retry
- [ ] 4xx errors do not trigger retry
- [ ] http_head returns headers only
- [ ] http_options returns CORS info
- [ ] Security tests pass
- [ ] No TypeScript errors in strict mode