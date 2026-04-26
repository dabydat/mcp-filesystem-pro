import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { GIT_TOOL_NAMES } from '../../constants/git.js';
import { successResult } from '../../types/results.js';
import { withGitContext } from './git-context.js';

interface GitStatusResult {
  current: string | null;
  tracking: string | null;
  staged: string[];
  modified: string[];
  not_added: string[];
  ignored: string[];
  untracked: string[];
}

export function createStatusTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    GIT_TOOL_NAMES.GIT_STATUS,
    {
      title: 'Git Status',
      description: 'Get repository status: staged, unstaged, and untracked files.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
      }),
    },
    async ({ path }) => {
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        const status = await git.status();
        const result: GitStatusResult = {
          current: status.current,
          tracking: status.tracking,
          staged: status.staged,
          modified: status.modified,
          not_added: status.not_added,
          ignored: status.ignored,
          untracked: status.files,
        };
        return successResult(JSON.stringify(result, null, 2));
      });
    }
  );

  server.registerTool(
    GIT_TOOL_NAMES.GIT_DIFF,
    {
      title: 'Git Diff',
      description: 'Show changes in working tree or between commits.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
        staged: z.boolean().optional().default(false).describe('Show staged changes'),
        commit: z.string().optional().describe('Show diff for specific commit'),
      }),
    },
    async ({ path, staged = false, commit }) => {
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        let diff: string;
        if (commit) {
          diff = await git.diff([commit, commit + '^']);
        } else if (staged) {
          diff = await git.diff(['--staged']);
        } else {
          diff = await git.diff();
        }
        return successResult(diff || 'No changes');
      });
    }
  );
}
