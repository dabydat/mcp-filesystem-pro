import { readdirSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';
import { glob } from 'glob';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { PROJECT_TOOL_NAMES } from '../../constants/project.js';
import { PROJECT_LIMITS } from '../../constants/limits.js';
import { successResult } from '../../types/results.js';
import { readJsonFile } from '../../utils/file.js';

type DirectoryTree = Record<string, DirectoryTree | { _truncated: boolean }>;

async function buildDirectoryTree(dir: string, maxDepth: number, currentDepth = 0): Promise<DirectoryTree> {
  if (currentDepth >= maxDepth) {
    return { _truncated: true };
  }

  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return {};
  }

  const result: DirectoryTree = {};

  for (const entry of entries.slice(0, PROJECT_LIMITS.MAX_ENTRIES_PER_DIR)) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      result[entry.name + '/'] = await buildDirectoryTree(fullPath, maxDepth, currentDepth + 1);
    } else {
      result[entry.name] = entry.name.split('.').pop() || 'file';
    }
  }

  return result;
}

async function detectStackFromRoot(root: string): Promise<Record<string, unknown> | null> {
  const packageJsonPath = join(root, 'package.json');
  const pkg = readJsonFile<{ name?: string; dependencies?: Record<string, unknown> }>(packageJsonPath);
  if (!pkg) return null;

  return {
    packageManager: pkg.name ? 'npm' : 'unknown',
    frameworks: Object.keys(pkg.dependencies || {}),
  };
}

async function countFilesInRoot(root: string): Promise<number> {
  try {
    const files = await glob('**/*', { cwd: root, absolute: true, nodir: true });
    return files.length;
  } catch {
    return 0;
  }
}

export function createSummaryTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    PROJECT_TOOL_NAMES.PROJECT_SUMMARY,
    {
      title: 'Project Summary',
      description: 'Generate project overview: structure, stack, conventions.',
      inputSchema: z.object({
        project_root: z.string().optional().describe('Project root path'),
        depth: z.number().optional().default(2).describe('Directory depth to show'),
      }),
    },
    async ({ project_root, depth = 2 }) => {
      const root = project_root ? resolve(project_root) : rootDir;
      guard.validate(root);

      const limitedDepth = Math.min(Math.max(1, depth), PROJECT_LIMITS.MAX_DEPTH);

      const summary = {
        root,
        structure: await buildDirectoryTree(root, limitedDepth),
        stack: null as Record<string, unknown> | null,
        fileCount: 0,
      };

      summary.stack = await detectStackFromRoot(root);
      summary.fileCount = await countFilesInRoot(root);

      return successResult(JSON.stringify(summary, null, 2));
    }
  );
}
