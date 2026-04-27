import { describe, it, expect, beforeEach, vi } from 'bun:test';
import { HttpClient } from '../src/modules/http/client.js';

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
});

describe('HttpClient', () => {
  describe('Basic Operations', () => {
    describe('http_get', () => {
      it('makes GET request and returns response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ data: 'test' }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.get('https://httpbin.org/get');

          expect(result.status).toBe(200);
          expect(result.data).toEqual({ data: 'test' });
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/get',
            expect.objectContaining({ method: 'GET' })
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('supports query parameters', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ args: { test: 'value' } }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.get('https://httpbin.org/get', { test: 'value' });

          expect(result.status).toBe(200);
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/get?test=value',
            expect.any(Object)
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('http_post', () => {
      it('POSTs data and returns response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ json: { key: 'value' } }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.post('https://httpbin.org/post', { key: 'value' });

          expect(result.status).toBe(200);
          expect(result.data).toBeDefined();
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('sends JSON body correctly', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ json: { name: 'test', active: true } }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.post('https://httpbin.org/post', { name: 'test', active: true });

          expect(result.status).toBe(200);
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/post',
            expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({ name: 'test', active: true }),
            })
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('http_put', () => {
      it('PUTs data and returns response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ updated: true }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.put('https://httpbin.org/put', { updated: true });

          expect(result.status).toBe(200);
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('http_delete', () => {
      it('DELETEs resource and returns response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ deleted: true }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.delete('https://httpbin.org/delete');

          expect(result.status).toBe(200);
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/delete',
            expect.objectContaining({ method: 'DELETE' })
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('http_patch', () => {
      it('PATCHes data and returns response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ patched: true }),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.patch('https://httpbin.org/patch', { patched: true });

          expect(result.status).toBe(200);
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/patch',
            expect.objectContaining({ method: 'PATCH' })
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('http_head', () => {
      it('HEAD returns headers without body', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(null),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          const result = await client.head('https://httpbin.org/get');

          expect(result.status).toBe(200);
          expect(result.data).toBeNull();
          expect(mockFetch).toHaveBeenCalledWith(
            'https://httpbin.org/get',
            expect.objectContaining({ method: 'HEAD' })
          );
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('throws descriptive error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network failed'));

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        await expect(client.get('https://httpbin.org/get')).rejects.toThrow('HTTP_NETWORK_ERROR');
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('throws on timeout', async () => {
      mockFetch.mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        await expect(client.get('https://httpbin.org/get')).rejects.toThrow('HTTP_TIMEOUT');
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('handles non-JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('plain text response'),
      });

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        const result = await client.get('https://httpbin.org/get');

        expect(result.status).toBe(200);
        expect(result.data).toBe('plain text response');
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('handles 204 No Content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers({}),
        json: () => Promise.resolve(null),
      });

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        const result = await client.get('https://httpbin.org/get');

        expect(result.status).toBe(204);
        expect(result.data).toBeNull();
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });
  });

  describe('Sprint 7: Auth & Headers', () => {
    describe('Authentication', () => {
      it('sets API key auth', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setAuth('api-key', { apiKey: 'test-api-key' });

          const auth = client.getAuth();
          expect(auth).not.toBeNull();
          expect(auth?.type).toBe('api-key');
          expect(auth?.credentials.apiKey).toBe('test-api-key');
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('sets bearer token auth', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setAuth('bearer', { token: 'test-token' });

          const auth = client.getAuth();
          expect(auth).not.toBeNull();
          expect(auth?.type).toBe('bearer');
          expect(auth?.credentials.token).toBe('test-token');
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('sets basic auth with username and password', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setAuth('basic', { username: 'user', password: 'pass' });

          const auth = client.getAuth();
          expect(auth).not.toBeNull();
          expect(auth?.type).toBe('basic');
          expect(auth?.credentials.username).toBe('user');
          expect(auth?.credentials.password).toBe('pass');
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('clears auth', async () => {
        const client = new HttpClient();
        client.setAuth('bearer', { token: 'test-token' });
        client.clearAuth();

        const auth = client.getAuth();
        expect(auth).toBeNull();
      });

      it('includes bearer token in Authorization header', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setAuth('bearer', { token: 'my-secret-token' });
          await client.get('https://api.example.com/data');

          const callArgs = mockFetch.mock.calls[0];
          expect(callArgs[1].headers['Authorization']).toBe('Bearer my-secret-token');
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });

      it('includes basic auth in Authorization header', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setAuth('basic', { username: 'admin', password: 'secret' });
          await client.get('https://api.example.com/data');

          const callArgs = mockFetch.mock.calls[0];
          const authHeader = callArgs[1].headers['Authorization'];
          expect(authHeader.startsWith('Basic ')).toBe(true);
          // Base64 encode "admin:secret"
          const encoded = Buffer.from('admin:secret').toString('base64');
          expect(authHeader).toBe(`Basic ${encoded}`);
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('Custom Headers', () => {
      it('sets custom header', async () => {
        const client = new HttpClient();
        client.setHeader('X-Custom-Header', 'custom-value');

        const headers = client.getHeaders();
        expect(headers['X-Custom-Header']).toBe('custom-value');
      });

      it('sets multiple custom headers', async () => {
        const client = new HttpClient();
        client.setHeader('X-Header-1', 'value1');
        client.setHeader('X-Header-2', 'value2');

        const headers = client.getHeaders();
        expect(headers['X-Header-1']).toBe('value1');
        expect(headers['X-Header-2']).toBe('value2');
      });

      it('clears all custom headers', async () => {
        const client = new HttpClient();
        client.setHeader('X-Custom-Header', 'custom-value');
        client.clearHeaders();

        const headers = client.getHeaders();
        expect(headers['X-Custom-Header']).toBeUndefined();
      });

      it('includes custom headers in request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({}),
        });

        const originalFetch = global.fetch;
        Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

        try {
          const client = new HttpClient();
          client.setHeader('X-Request-ID', '12345');
          await client.get('https://api.example.com/data');

          const callArgs = mockFetch.mock.calls[0];
          expect(callArgs[1].headers['X-Request-ID']).toBe('12345');
        } finally {
          Object.defineProperty(global, 'fetch', { value: originalFetch });
        }
      });
    });

    describe('Timeout', () => {
      it('sets custom timeout', async () => {
        const client = new HttpClient(5000);
        expect(client.getTimeout()).toBe(5000);

        client.setTimeout(10000);
        expect(client.getTimeout()).toBe(10000);
      });

      it('defaults to 30000ms', () => {
        const client = new HttpClient();
        expect(client.getTimeout()).toBe(30000);
      });
    });
  });

  describe('Sprint 8: Response Parsing', () => {
    it('stores last response data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ key: 'value' }),
      });

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        await client.get('https://httpbin.org/get');

        expect(client.getLastResponseData()).toEqual({ key: 'value' });
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('stores last status code', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ created: true }),
      });

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        await client.post('https://httpbin.org/post', {});

        expect(client.getLastStatusCode()).toBe(201);
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('stores last response headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'x-custom-header': 'test-value',
        }),
        json: () => Promise.resolve({}),
      });

      const originalFetch = global.fetch;
      Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });

      try {
        const client = new HttpClient();
        await client.get('https://httpbin.org/get');

        const headers = client.getLastResponseHeaders();
        expect(headers['content-type']).toBe('application/json');
        expect(headers['x-custom-header']).toBe('test-value');
      } finally {
        Object.defineProperty(global, 'fetch', { value: originalFetch });
      }
    });

    it('returns null for last response when no request made', () => {
      const client = new HttpClient();
      expect(client.getLastResponseData()).toBeNull();
      expect(client.getLastStatusCode()).toBeNull();
      expect(client.getLastResponseHeaders()).toEqual({});
    });
  });

  describe('Sprint 9: Security', () => {
    it('parses JSON text successfully', () => {
      const { validateUrl, matchesWildcard } = require('../src/utils/url-validator.js');

      expect(validateUrl('https://example.com')).toEqual({ valid: true });
      expect(validateUrl('http://localhost:8080')).toEqual({ valid: false, error: 'Localhost and private IPs are not allowed' });
      expect(validateUrl('https://192.168.1.1')).toEqual({ valid: false, error: 'Localhost and private IPs are not allowed' });
    });

    it('blocks file:// protocol', () => {
      const { validateUrl } = require('../src/utils/url-validator.js');

      const result = validateUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
    });

    it('validates wildcard patterns', () => {
      const { matchesWildcard } = require('../src/utils/url-validator.js');

      expect(matchesWildcard('*.example.com', 'api.example.com')).toBe(true);
      expect(matchesWildcard('*.example.com', 'other.com')).toBe(false);
    });

    describe('Retry Logic', () => {
      it('calculates exponential backoff', () => {
        const { calculateBackoffDelay, DEFAULT_RETRY_CONFIG } = require('../src/utils/retry.js');

        expect(calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG)).toBe(1000);
        expect(calculateBackoffDelay(1, DEFAULT_RETRY_CONFIG)).toBe(2000);
        expect(calculateBackoffDelay(2, DEFAULT_RETRY_CONFIG)).toBe(4000);
        expect(calculateBackoffDelay(3, DEFAULT_RETRY_CONFIG)).toBe(8000);
        expect(calculateBackoffDelay(4, DEFAULT_RETRY_CONFIG)).toBe(8000); // max
      });

      it('determines retry eligibility', () => {
        const { shouldRetry, DEFAULT_RETRY_CONFIG } = require('../src/utils/retry.js');

        expect(shouldRetry(500, DEFAULT_RETRY_CONFIG)).toBe(true);
        expect(shouldRetry(502, DEFAULT_RETRY_CONFIG)).toBe(true);
        expect(shouldRetry(503, DEFAULT_RETRY_CONFIG)).toBe(true);
        expect(shouldRetry(400, DEFAULT_RETRY_CONFIG)).toBe(false);
        expect(shouldRetry(404, DEFAULT_RETRY_CONFIG)).toBe(false);
        expect(shouldRetry(200, DEFAULT_RETRY_CONFIG)).toBe(false);
      });
    });
  });
});