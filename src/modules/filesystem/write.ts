import { readFileSync, writeFileSync, existsSync } from 'fs';
import { z } from 'zod';
import { applyPatch } from 'diff';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { logger } from '../../utils/logger.js';
import { FS_TOOL_NAMES, ERROR_PREFIX, SUCCESS_MESSAGES } from '../../constants/filesystem.js';
import { OPERATIONS } from '../../constants/operations.js';
import { successResult, errorResult } from '../../types/results.js';

export function createWriteTools(server: McpServer, guard: AllowlistGuard): void {
  server.registerTool(
    FS_TOOL_NAMES.WRITE_FILE,
    {
      title: 'Write File',
      description: 'Write content to a new file. Only for NEW files - use apply_diff for existing files.',
      inputSchema: z.object({
        path: z.string().describe('Absolute path to file'),
        content: z.string().describe('Content to write'),
      }),
    },
    async ({ path, content }) => {
      guard.validate(path);

      if (existsSync(path)) {
        return errorResult(ERROR_PREFIX.FILE_EXISTS + ': File exists. Use apply_diff to modify: ' + path);
      }

      writeFileSync(path, content, 'utf-8');
      logger.info(OPERATIONS.WRITE_FILE, { path });

      return successResult(SUCCESS_MESSAGES.FILE_CREATED + ': ' + path);
    }
  );

  server.registerTool(
    FS_TOOL_NAMES.APPLY_DIFF,
    {
      title: 'Apply Diff',
      description: 'Apply a unified diff to an existing file. Use this for modifications - NEVER use write_file on existing files.',
      inputSchema: z.object({
        path: z.string().describe('Absolute path to file'),
        unified_diff: z.string().describe('Unified diff format (diff -u). Must include --- and +++ headers and 3+ lines of context'),
        reason: z.string().max(200).describe('Why this change is being made (for log)'),
        dry_run: z.boolean().optional().default(false).describe('Validate diff but do not apply'),
      }),
    },
    async ({ path, unified_diff, reason, dry_run }) => {
      guard.validate(path);

      const original = readFileSync(path, 'utf-8');
      const result = applyPatch(original, unified_diff);

      if (result === false) {
        return errorResult(ERROR_PREFIX.DIFF_INVALID + ': Diff cannot be applied. File may have changed since diff was generated. Re-read file and regenerate diff.');
      }

      if (dry_run) {
        const added = (unified_diff.match(/^\+[^+]/gm) ?? []).length;
        const removed = (unified_diff.match(/^-[^-]/gm) ?? []).length;
        return successResult('DRY RUN OK: Diff is valid. +' + added + ' lines, -' + removed + ' lines. Call again with dry_run=false to apply.');
      }

      writeFileSync(path, result, 'utf-8');
      logger.info(OPERATIONS.APPLY_DIFF, { path, reason });

      return successResult(SUCCESS_MESSAGES.DIFF_APPLIED + ': ' + path + '. Reason: ' + reason);
    }
  );
}
