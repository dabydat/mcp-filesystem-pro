import { readFileSync } from 'fs';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { FS_TOOL_NAMES } from '../../constants/filesystem.js';

export function createReadTools(server: McpServer, guard: AllowlistGuard): void {
  server.registerTool(
    FS_TOOL_NAMES.READ_FILE,
    {
      title: 'Read File',
      description: 'Read a single file. Supports line range: read_file(path, startLine, endLine)',
      inputSchema: z.object({
        path: z.string().describe('Absolute path to file'),
        startLine: z.number().optional().describe('Line number to start reading (1-indexed)'),
        endLine: z.number().optional().describe('Line number to stop reading (inclusive)'),
      }),
    },
    async ({ path, startLine, endLine }) => {
      guard.validate(path);

      const content = readFileSync(path, 'utf-8');
      const lines = content.split('\n');

      const start = startLine ? startLine - 1 : 0;
      const end = endLine ? endLine : lines.length;
      const selected = lines.slice(start, end).join('\n');

      return {
        content: [{ type: 'text', text: selected }],
      };
    }
  );

  server.registerTool(
    FS_TOOL_NAMES.READ_FILES,
    {
      title: 'Read Multiple Files',
      description: 'Read multiple files in a single call. Returns {path: content} object.',
      inputSchema: z.object({
        paths: z.array(z.string()).describe('Array of absolute paths'),
      }),
    },
    async ({ paths }) => {
      paths.forEach(p => guard.validate(p));

      const result: Record<string, string> = {};
      for (const p of paths) {
        result[p] = readFileSync(p, 'utf-8');
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}