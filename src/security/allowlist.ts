import { resolve, relative, isAbsolute } from 'path';
import { SUSPICIOUS_PATHS, DOUBLE_DOT } from '../constants/shared.js';

export class AllowlistGuard {
  private readonly allowedRoots: string[];

  constructor(allowedRoots: string[]) {
    this.allowedRoots = allowedRoots.map(r => resolve(r));
  }

  validate(filePath: string): void {
    const resolvedPath = resolve(filePath);

    if (this.isPathTraversal(resolvedPath)) {
      throw new Error(
        'SECURITY: Path "' + filePath + '" is outside allowed directory. ' +
        'Allowed roots: ' + this.allowedRoots.join(', ')
      );
    }

    if (this.containsSuspiciousPath(resolvedPath)) {
      throw new Error('SECURITY: Path "' + filePath + '" contains suspicious location.');
    }
  }

  private isPathTraversal(resolvedPath: string): boolean {
    return this.allowedRoots.every(root => {
      const relativePath = relative(root, resolvedPath);
      return relativePath.startsWith(DOUBLE_DOT) || isAbsolute(relativePath);
    });
  }

  private containsSuspiciousPath(resolvedPath: string): boolean {
    return SUSPICIOUS_PATHS.some(suspicious => resolvedPath.includes(suspicious));
  }

  getAllowedRoots(): string[] {
    return [...this.allowedRoots];
  }
}