export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

export const SUSPICIOUS_PATHS = [
  '/etc/',
  '/root/',
  '~/.ssh/',
  '.env',
  '/proc/',
  '/sys/',
] as const;

export type SuspiciousPath = typeof SUSPICIOUS_PATHS[number];

export const PATH_SEPARATOR = '/';
export const DOUBLE_DOT = '..';
