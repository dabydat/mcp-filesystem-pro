import { existsSync, readFileSync } from 'fs';

/**
 * Reads and parses a JSON file, returning null on failure instead of throwing.
 */
export function readJsonFile<T>(path: string): T | null {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8')) as T;
    }
  } catch {
    // Silently return null for robustness - caller handles missing/invalid files
  }
  return null;
}