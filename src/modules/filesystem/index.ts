import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createReadTools } from './read.js';
import { createWriteTools } from './write.js';
import { createDeleteTools } from './delete.js';
import { createSearchTools } from './search.js';
import { createListTools } from './list.js';

export function createFilesystemModule(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  createReadTools(server, guard);
  createWriteTools(server, guard);
  createDeleteTools(server, guard);
  createSearchTools(server, guard, rootDir);
  createListTools(server, guard, rootDir);
}