export const GIT_TOOL_NAMES = {
  GIT_STATUS: 'git_status',
  GIT_DIFF: 'git_diff',
  GIT_LOG: 'git_log',
  GIT_ADD: 'git_add',
  GIT_COMMIT: 'git_commit',
  GIT_BRANCH: 'git_branch',
} as const;

export type GitToolName = typeof GIT_TOOL_NAMES[keyof typeof GIT_TOOL_NAMES];

export const GIT_MESSAGES = {
  FILES_STAGED: 'Files staged',
  COMMIT_CREATED: 'Commit created',
  BRANCH_CREATED: 'Branch created',
  BRANCH_SWITCHED: 'Branch switched',
  BRANCH_DELETED: 'Branch deleted',
  NO_CHANGES: 'No changes',
} as const;

export type GitMessage = typeof GIT_MESSAGES[keyof typeof GIT_MESSAGES];

export const BRANCH_ACTIONS = {
  LIST: 'list',
  CREATE: 'create',
  SWITCH: 'switch',
  DELETE: 'delete',
} as const;

export type BranchActionType = typeof BRANCH_ACTIONS[keyof typeof BRANCH_ACTIONS];

export const GIT_ERROR_PREFIX = {
  GIT_OPERATION_FAILED: 'GIT_OPERATION_FAILED',
  GIT_NOT_REPO: 'GIT_NOT_REPO',
  GIT_BRANCH_NAME_REQUIRED: 'GIT_BRANCH_NAME_REQUIRED',
  GIT_INVALID_ACTION: 'GIT_INVALID_ACTION',
} as const;

export type GitErrorPrefix = typeof GIT_ERROR_PREFIX[keyof typeof GIT_ERROR_PREFIX];
