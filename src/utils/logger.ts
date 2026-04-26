import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { LOG_LEVELS, type LogLevel } from '../constants/shared.js';

const LOG_DIR = '/tmp/mcp-logs';
const LOG_FILE = LOG_DIR + '/telemetry.jsonl';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

function ensureLogDir(): void {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function serializeEntry(entry: LogEntry): string {
  return JSON.stringify(entry) + '\n';
}

function writeToFile(entry: LogEntry): void {
  try {
    ensureLogDir();
    appendFileSync(LOG_FILE, serializeEntry(entry));
  } catch {
  }
}

function createLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (data) {
    entry.data = data;
  }
  return entry;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry = createLogEntry(level, message, data);
  const serialized = serializeEntry(entry);
  console.error(serialized);
  writeToFile(entry);
}

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    log(LOG_LEVELS.INFO, message, data);
  },

  warn(message: string, data?: Record<string, unknown>): void {
    log(LOG_LEVELS.WARN, message, data);
  },

  error(message: string, data?: Record<string, unknown>): void {
    log(LOG_LEVELS.ERROR, message, data);
  },
};

export function getLogPath(): string {
  return LOG_FILE;
}