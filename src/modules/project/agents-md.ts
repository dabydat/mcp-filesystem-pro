import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { PROJECT_TOOL_NAMES, PROJECT_MESSAGES } from '../../constants/project.js';
import { successResult } from '../../types/results.js';

const AGENTS_MD_FILENAME = 'AGENTS.md';

interface AgentsMdResult {
  exists: boolean;
  content?: string;
  message?: string;
}

function createNotFoundResult(): AgentsMdResult {
  return {
    exists: false,
    message: PROJECT_MESSAGES.NO_AGENTS_MD,
  };
}

function createFoundResult(content: string): AgentsMdResult {
  return {
    exists: true,
    content,
  };
}

export function createAgentsMdTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    PROJECT_TOOL_NAMES.READ_AGENTS_MD,
    {
      title: 'Read Agents MD',
      description: 'Read and parse AGENTS.md if it exists in the project.',
      inputSchema: z.object({
        project_root: z.string().optional().describe('Project root path'),
      }),
    },
    async ({ project_root }) => {
      const root = project_root ? resolve(project_root) : rootDir;
      guard.validate(root);

      const agentsMdPath = join(root, AGENTS_MD_FILENAME);

      if (!existsSync(agentsMdPath)) {
        return successResult(JSON.stringify(createNotFoundResult()));
      }

      const content = readFileSync(agentsMdPath, 'utf-8');
      return successResult(JSON.stringify(createFoundResult(content)));
    }
  );
}
