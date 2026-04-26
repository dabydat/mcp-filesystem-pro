export const FS_TOOL_NAMES = {
  READ_FILE: 'read_file',
  READ_FILES: 'read_files',
  WRITE_FILE: 'write_file',
  APPLY_DIFF: 'apply_diff',
  DELETE_FILE: 'delete_file',
  FIND_FILES: 'find_files',
  SEARCH_TEXT: 'search_text',
  LIST_DIR: 'list_dir',
} as const;

export type FsToolName = typeof FS_TOOL_NAMES[keyof typeof FS_TOOL_NAMES];

export const SUCCESS_MESSAGES = {
  FILE_CREATED: 'File created successfully',
  DIFF_APPLIED: 'Diff applied successfully',
  FILE_DELETED: 'File deleted successfully',
} as const;

export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];

export const ERROR_PREFIX = {
  SECURITY: 'SECURITY',
  FILE_EXISTS: 'FILE_EXISTS',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  CONFIRM_REQUIRED: 'CONFIRM_REQUIRED',
  DIFF_INVALID: 'DIFF_INVALID',
} as const;

export type ErrorPrefix = typeof ERROR_PREFIX[keyof typeof ERROR_PREFIX];

export const FILE_TYPES = {
  DIR: 'dir',
  FILE: 'file',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];