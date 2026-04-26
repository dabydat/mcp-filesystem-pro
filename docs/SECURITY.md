# Security Model — mcp-filesystem-pro

## Overview

All file operations are scoped to a configured root directory via AllowlistGuard.

## AllowlistGuard

Every tool validates paths against allowed roots before file operations.

```typescript
const guard = new AllowlistGuard(['/path/to/project']);
guard.validate('/path/to/project/file.txt'); // OK
guard.validate('/etc/passwd'); // BLOCKED
```

## Blocked Paths

- `/etc/` — System configuration
- `/root/` — Root home directory
- `~/.ssh/` — SSH keys
- `.env` — Environment files (in any directory)
- `/proc/` — Process filesystem
- `/sys/` — System filesystem

## Path Traversal Prevention

Paths containing `..` that resolve outside the allowed root are blocked.

The guard uses `path.relative()` to check if a resolved path is outside any allowed root:

```typescript
private isPathTraversal(resolvedPath: string): boolean {
  return this.allowedRoots.every(root => {
    const relativePath = relative(root, resolvedPath);
    return relativePath.startsWith('..') || isAbsolute(relativePath);
  });
}
```

## Git Operations

All git operations are scoped to the project root. No git operations can access paths outside the allowed directory.

```typescript
withGitContext(rootDir, path, guard, async ({ git }) => {
  // git operations are validated against guard
});
```

## Input Sanitization

Additional sanitization functions prevent malicious inputs:

- `sanitizePath()` — Removes null bytes and trims whitespace
- `sanitizeFilename()` — Replaces shell special characters
- `sanitizeGitRef()` — Allows only valid git ref characters

## Security Testing

Security tests verify:
- Blocked paths are rejected
- Path traversal attacks are caught
- Sanitization removes dangerous characters
- Multiple traversal attempts are blocked
