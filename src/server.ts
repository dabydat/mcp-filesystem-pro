import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from './security/allowlist.js';
import { createFilesystemModule } from './modules/filesystem/index.js';
import { createGitModule } from './modules/git/index.js';
import { createProjectModule } from './modules/project/index.js';
import { createHttpModule } from './modules/http/index.js';

export function createServer(rootDir: string, guard?: AllowlistGuard): McpServer {
  const allowlistGuard = guard ?? new AllowlistGuard([rootDir]);

  const server = new McpServer({
    name: 'mcp-filesystem-pro',
    version: '1.0.0',
  });

  createFilesystemModule(server, allowlistGuard, rootDir);
  createGitModule(server, allowlistGuard, rootDir);
  createProjectModule(server, allowlistGuard, rootDir);
  createHttpModule(server, allowlistGuard, rootDir);

  return server;
}
