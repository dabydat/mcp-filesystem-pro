import { existsSync, rmSync } from 'fs';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { logger } from '../../utils/logger.js';
import { FS_TOOL_NAMES, ERROR_PREFIX, SUCCESS_MESSAGES } from '../../constants/filesystem.js';
import { OPERATIONS } from '../../constants/operations.js';
import { successResult, errorResult } from '../../types/results.js';

export function createDeleteTools(server: McpServer, guard: AllowlistGuard): void {
  server.registerTool(
    FS_TOOL_NAMES.DELETE_FILE,
    {
      title: 'Delete File',
      description: 'Delete a file. REQUIRES confirm: true in request.',
      inputSchema: z.object({
        path: z.string().describe('Absolute path to file'),
        confirm: z.literal(true).describe('Must be true to confirm deletion'),
      }),
    },
    async ({ path, confirm }) => {
      if (!confirm) {
        return errorResult(ERROR_PREFIX.CONFIRM_REQUIRED + ': confirm: true is required to delete a file.');
      }

      guard.validate(path);

      if (!existsSync(path)) {
        return errorResult(ERROR_PREFIX.FILE_NOT_FOUND + ': File not found: ' + path);
      }

      rmSync(path);
      logger.info(OPERATIONS.DELETE_FILE, { path });

      return successResult(SUCCESS_MESSAGES.FILE_DELETED + ': ' + path);
    }
  );
}
