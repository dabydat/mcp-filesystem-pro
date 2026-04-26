import { z } from 'zod';
import type { ToolResult } from './results.js';

export type { ToolResult };

export const FilePathSchema = z.string();
export const ConfirmSchema = z.object({ confirm: z.literal(true) });
