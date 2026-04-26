export const OPERATIONS = {
  WRITE_FILE: 'WRITE_FILE',
  APPLY_DIFF: 'APPLY_DIFF',
  DELETE_FILE: 'DELETE_FILE',
} as const;

export type OperationName = typeof OPERATIONS[keyof typeof OPERATIONS];