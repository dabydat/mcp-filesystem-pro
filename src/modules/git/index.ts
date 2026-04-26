import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createStatusTools } from './status.js';
import { createHistoryTools } from './history.js';
import { createOperationTools } from './operations.js';

export function createGitModule(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  createStatusTools(server, guard, rootDir);
  createHistoryTools(server, guard, rootDir);
  createOperationTools(server, guard, rootDir);
}