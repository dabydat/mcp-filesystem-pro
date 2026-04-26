import { readFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { FS_TOOL_NAMES } from '../../constants/filesystem.js';
import { SEARCH_LIMITS } from '../../constants/limits.js';
import { logger } from '../../utils/logger.js';

export interface SearchOptions {
  pattern: string;
  path?: string;
  file_pattern?: string;
  context_lines?: number;
  max_results?: number;
}

export function createSearchTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    FS_TOOL_NAMES.FIND_FILES,
    {
      title: 'Find Files',
      description: 'Find files by glob pattern or name. Searches recursively from root.',
      inputSchema: z.object({
        pattern: z.string().describe('Glob pattern (e.g., "*.ts", "**/*.json")'),
        root: z.string().optional().describe('Root directory to search (default: project root)'),
      }),
    },
    async ({ pattern, root }) => {
      const searchRoot = root ? resolve(root) : rootDir;
      guard.validate(searchRoot);

      const files = await glob(pattern, { cwd: searchRoot, absolute: true });
      return {
        content: [{ type: 'text', text: JSON.stringify(files, null, 2) }],
      };
    }
  );

  server.registerTool(
    FS_TOOL_NAMES.SEARCH_TEXT,
    {
      title: 'Search Text',
      description: 'Search for text or regex within files. Returns matches with context lines.',
      inputSchema: z.object({
        pattern: z.string().describe('Regex or text pattern to search'),
        path: z.string().optional().describe('Directory to search (default: project root)'),
        file_pattern: z.string().optional().describe('Only search files matching glob (e.g., "*.ts")'),
        context_lines: z.number().optional().default(2).describe('Lines of context around matches'),
        max_results: z.number().optional().default(50).describe('Maximum number of results'),
      }),
    },
    async ({ pattern, path, file_pattern, context_lines = SEARCH_LIMITS.DEFAULT_CONTEXT_LINES, max_results = SEARCH_LIMITS.DEFAULT_MAX_RESULTS }) => {
      const searchRoot = path ? resolve(path) : rootDir;
      guard.validate(searchRoot);

      const searchPattern = new RegExp(pattern, 'g');
      const globPattern = file_pattern ?? '**/*';
      const files = await glob(globPattern, { cwd: searchRoot, absolute: true });

      const results: Array<{ file: string; line: number; content: string }> = [];
      for (const file of files.slice(0, SEARCH_LIMITS.MAX_FILES_TO_SEARCH)) {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (searchPattern.test(lines[i])) {
              results.push({ file, line: i + 1, content: lines[i] });
              if (results.length >= max_results) break;
            }
          }
        } catch (err) {
          logger.warn('Failed to read file during search', { file, error: String(err) });
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
      };
    }
  );
}