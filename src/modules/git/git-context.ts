import { simpleGit, SimpleGit } from 'simple-git';
import { resolve } from 'path';
import { AllowlistGuard } from '../../security/allowlist.js';

export interface GitContext {
  git: SimpleGit;
  repoPath: string;
}

export function createGitContext(
  rootDir: string,
  path: string | undefined,
  guard: AllowlistGuard
): GitContext {
  const repoPath = path ? resolve(path) : rootDir;
  guard.validate(repoPath);
  const git = simpleGit(repoPath);
  return { git, repoPath };
}

export function withGitContext<T>(
  rootDir: string,
  path: string | undefined,
  guard: AllowlistGuard,
  fn: (context: GitContext) => Promise<T>
): Promise<T> {
  const context = createGitContext(rootDir, path, guard);
  return fn(context);
}