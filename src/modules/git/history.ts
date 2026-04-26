import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { GIT_TOOL_NAMES } from '../../constants/git.js';
import { successResult } from '../../types/results.js';
import { withGitContext } from './git-context.js';

interface CommitInfo {
  hash: string;
  author: string;
  email: string;
  date: string;
  subject: string;
}

const DEFAULT_LOG_FORMAT = '%H|%an|%ae|%at|%s';
const DEFAULT_MAX_COUNT = 20;

export function createHistoryTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    GIT_TOOL_NAMES.GIT_LOG,
    {
      title: 'Git Log',
      description: 'Show commit history with configurable format.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
        max_count: z.number().optional().default(DEFAULT_MAX_COUNT).describe('Maximum number of commits'),
        format: z.string().optional().default(DEFAULT_LOG_FORMAT).describe('Format: hash|author email|timestamp|subject'),
      }),
    },
    async ({ path, max_count = DEFAULT_MAX_COUNT, format = DEFAULT_LOG_FORMAT }) => {
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        const log = await git.log({ maxCount: max_count, format });
        const commits: CommitInfo[] = log.all.map(commit => ({
          hash: commit.hash,
          author: commit.author_name,
          email: commit.author_email,
          date: new Date(Number(commit.date) * 1000).toISOString(),
          subject: commit.message,
        }));
        return successResult(JSON.stringify(commits, null, 2));
      });
    }
  );
}
