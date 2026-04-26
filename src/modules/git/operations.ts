import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { GIT_TOOL_NAMES, BRANCH_ACTIONS, GIT_MESSAGES, GIT_ERROR_PREFIX, type BranchActionType } from '../../constants/git.js';
import { successResult, errorResult } from '../../types/results.js';
import { withGitContext } from './git-context.js';

function isNameRequiredForAction(action: BranchActionType): boolean {
  return action === BRANCH_ACTIONS.CREATE || action === BRANCH_ACTIONS.SWITCH || action === BRANCH_ACTIONS.DELETE;
}

function validateBranchAction(name: string | undefined, action: BranchActionType): boolean {
  if (isNameRequiredForAction(action) && !name) {
    return false;
  }
  return true;
}

export function createOperationTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    GIT_TOOL_NAMES.GIT_ADD,
    {
      title: 'Git Add',
      description: 'Stage files for commit.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
        files: z.union([z.string(), z.array(z.string())]).describe('Files to stage (use "." for all)'),
      }),
    },
    async ({ path, files }) => {
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        const filesArray = typeof files === 'string' ? [files] : files;
        await git.add(filesArray);
        return successResult(GIT_MESSAGES.FILES_STAGED + ': ' + filesArray.join(', '));
      });
    }
  );

  server.registerTool(
    GIT_TOOL_NAMES.GIT_COMMIT,
    {
      title: 'Git Commit',
      description: 'Create a commit with message.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
        message: z.string().describe('Commit message'),
      }),
    },
    async ({ path, message }) => {
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        const result = await git.commit(message);
        return successResult(GIT_MESSAGES.COMMIT_CREATED + ': ' + result.commit);
      });
    }
  );

  server.registerTool(
    GIT_TOOL_NAMES.GIT_BRANCH,
    {
      title: 'Git Branch',
      description: 'List, create, or switch branches.',
      inputSchema: z.object({
        path: z.string().optional().describe('Repository path (default: project root)'),
        action: z.enum(Object.values(BRANCH_ACTIONS)).optional().default(BRANCH_ACTIONS.LIST).describe('Action to perform'),
        name: z.string().optional().describe('Branch name (required for create/switch/delete)'),
      }),
    },
    async ({ path, action = BRANCH_ACTIONS.LIST, name }) => {
      if (!validateBranchAction(name, action)) {
        return errorResult(GIT_ERROR_PREFIX.GIT_BRANCH_NAME_REQUIRED + ': name required for ' + action);
      }
      return withGitContext(rootDir, path, guard, async ({ git }) => {
        switch (action) {
          case BRANCH_ACTIONS.LIST: {
            const branches = await git.branchLocal();
            return successResult(JSON.stringify(branches, null, 2));
          }
          case BRANCH_ACTIONS.CREATE: {
            await git.branch([name!]);
            return successResult(GIT_MESSAGES.BRANCH_CREATED + ': ' + name);
          }
          case BRANCH_ACTIONS.SWITCH: {
            await git.checkout(name!);
            return successResult(GIT_MESSAGES.BRANCH_SWITCHED + ': ' + name);
          }
          case BRANCH_ACTIONS.DELETE: {
            await git.deleteLocalBranch(name!);
            return successResult(GIT_MESSAGES.BRANCH_DELETED + ': ' + name);
          }
          default:
            return errorResult(GIT_ERROR_PREFIX.GIT_INVALID_ACTION + ': invalid action');
        }
      });
    }
  );
}
