import { readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { FS_TOOL_NAMES } from '../../constants/filesystem.js';

export function createListTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    FS_TOOL_NAMES.LIST_DIR,
    {
      title: 'List Directory',
      description: 'List directory contents with metadata (size, date, type).',
      inputSchema: z.object({
        path: z.string().optional().describe('Directory path (default: project root)'),
        include_hidden: z.boolean().optional().default(false).describe('Include hidden files'),
      }),
    },
    async ({ path, include_hidden = false }) => {
      const dirPath = path ? resolve(path) : rootDir;
      guard.validate(dirPath);

      const entries = readdirSync(dirPath, { withFileTypes: true });
      const filtered = include_hidden ? entries : entries.filter(e => !e.name.startsWith('.'));

      const result = filtered.map(entry => {
        const fullPath = join(dirPath, entry.name);
        const stats = statSync(fullPath);
        return {
          name: entry.name,
          type: entry.isDirectory() ? 'dir' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}