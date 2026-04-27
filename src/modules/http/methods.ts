import { HttpClient, HttpResponse } from './client.js';

export interface HttpMethodOptions {
  headers?: Record<string, string>;
}

export interface GetOptions extends HttpMethodOptions {
  params?: Record<string, string>;
}

export interface PostOptions extends HttpMethodOptions {
  body?: unknown;
}

export interface PutOptions extends HttpMethodOptions {
  body?: unknown;
}

export interface PatchOptions extends HttpMethodOptions {
  body?: unknown;
}

export interface DeleteOptions extends HttpMethodOptions {}

export interface HeadOptions extends HttpMethodOptions {
  params?: Record<string, string>;
}

export async function httpGet(client: HttpClient, url: string, options?: GetOptions): Promise<HttpResponse> {
  return client.get(url, options?.params);
}

export async function httpPost(client: HttpClient, url: string, options?: PostOptions): Promise<HttpResponse> {
  return client.post(url, options?.body);
}

export async function httpPut(client: HttpClient, url: string, options?: PutOptions): Promise<HttpResponse> {
  return client.put(url, options?.body);
}

export async function httpDelete(client: HttpClient, url: string, _options?: DeleteOptions): Promise<HttpResponse> {
  return client.delete(url);
}

export async function httpPatch(client: HttpClient, url: string, options?: PatchOptions): Promise<HttpResponse> {
  return client.patch(url, options?.body);
}

export async function httpHead(client: HttpClient, url: string, options?: HeadOptions): Promise<HttpResponse<null>> {
  return client.head(url, options?.params);
}
