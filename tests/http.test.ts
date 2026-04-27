import { describe, it, expect } from 'bun:test';
import { HttpClient } from '../src/modules/http/client.js';

describe('http_get', () => {
  it('makes GET request and returns response', async () => {
    const client = new HttpClient();
    const result = await client.get('https://httpbin.org/get');
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();
  });

  it('supports query parameters', async () => {
    const client = new HttpClient();
    const result = await client.get('https://httpbin.org/get', { test: 'value' });
    expect(result.status).toBe(200);
  });
});

describe('http_post', () => {
  it('POSTs data and returns response', async () => {
    const client = new HttpClient();
    const result = await client.post('https://httpbin.org/post', { key: 'value' });
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();
  });

  it('sends JSON body correctly', async () => {
    const client = new HttpClient();
    const result = await client.post('https://httpbin.org/post', { name: 'test', active: true });
    expect(result.status).toBe(200);
  });
});

describe('http_put', () => {
  it('PUTs data and returns response', async () => {
    const client = new HttpClient();
    const result = await client.put('https://httpbin.org/put', { updated: true });
    expect(result.status).toBe(200);
  });
});

describe('http_delete', () => {
  it('DELETEs resource and returns response', async () => {
    const client = new HttpClient();
    const result = await client.delete('https://httpbin.org/delete');
    expect(result.status).toBe(200);
  });
});

describe('http_patch', () => {
  it('PATCHes data and returns response', async () => {
    const client = new HttpClient();
    const result = await client.patch('https://httpbin.org/patch', { patched: true });
    expect(result.status).toBe(200);
  });
});

describe('http_head', () => {
  it('HEAD returns headers without body', async () => {
    const client = new HttpClient();
    const result = await client.head('https://httpbin.org/get');
    expect(result.status).toBe(200);
    expect(result.data).toBeNull();
  });
});

describe('error handling', () => {
  it('throws descriptive error on invalid URL', async () => {
    const client = new HttpClient();
    await expect(client.get('not-a-valid-url')).rejects.toThrow();
  });

  it('throws on connection refused', async () => {
    const client = new HttpClient();
    await expect(client.get('http://localhost:99999')).rejects.toThrow();
  });
});
