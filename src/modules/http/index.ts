import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { HTTP_TOOL_NAMES, HTTP_ERROR_PREFIX } from '../../constants/http.js';
import { HttpClient, HttpResponse } from './client.js';
import { httpGet, httpPost, httpPut, httpDelete, httpPatch, httpHead } from './methods.js';

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

const HeadRequestSchema = z.object({
  url: z.string().url(),
  params: z.record(z.string()).optional(),
});

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
}
