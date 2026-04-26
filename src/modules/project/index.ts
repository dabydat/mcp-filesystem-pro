import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createDetectTools } from './detect.js';
import { createSummaryTools } from './summary.js';
import { createAgentsMdTools } from './agents-md.js';

export function createProjectModule(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  createDetectTools(server, guard, rootDir);
  createSummaryTools(server, guard, rootDir);
  createAgentsMdTools(server, guard, rootDir);
}