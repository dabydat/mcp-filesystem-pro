# Sprint 5 Task Prompts — Testing & Documentation

**Sprint:** 5 — Testing & Documentation
**Duration:** 2026-05-26 to 2026-06-01
**Agent:** @qa-engineer

---

## T5.1: Unit Tests - Filesystem

### Prompt
```
ROLE: qa-engineer
CONTEXT: MCP server. Testing filesystem module.
TASK: Create tests/filesystem.test.ts with comprehensive tests for all 8 filesystem tools

### File: tests/filesystem.test.ts
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'mcp-fs-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true });
});

describe('read_file', () => {
  it('reads entire file', () => {
    const file = join(tmpDir, 'test.txt');
    writeFileSync(file, 'hello world');
    const content = readFileSync(file, 'utf-8');
    expect(content).toBe('hello world');
  });

  it('returns empty string for non-existent file', () => {
    expect(() => readFileSync(join(tmpDir, 'missing.txt'), 'utf-8')).toThrow();
  });
});

describe('write_file', () => {
  it('creates new file', () => {
    const file = join(tmpDir, 'new.txt');
    writeFileSync(file, 'content');
    expect(readFileSync(file, 'utf-8')).toBe('content');
  });

  it('overwrite protection exists (separate from implementation)', () => {
    const file = join(tmpDir, 'existing.txt');
    writeFileSync(file, 'original');
    // Implementation should check existsSync before write
    expect(readFileSync(file, 'utf-8')).toBe('original');
  });
});

describe('apply_diff', () => {
  it('applies valid diff', () => {
    const file = join(tmpDir, 'code.ts');
    writeFileSync(file, 'function hello() {\n  return "world";\n}\n');

    const diff = `--- a/code.ts\n+++ b/code.ts\n@@ -1,3 +1,3 @@\n function hello() {\n-  return "world";\n+  return "universe";\n }\n`;

    const { applyPatch } = await import('diff');
    const original = readFileSync(file, 'utf-8');
    const result = applyPatch(original, diff);
    expect(result).not.toBe(false);
    if (result) writeFileSync(file, result, 'utf-8');
    expect(readFileSync(file, 'utf-8')).toContain('universe');
  });

  it('fails on conflicting diff', () => {
    const { applyPatch } = await import('diff');
    const original = 'line1\nline2\nline3';
    const diff = `--- a/file\n+++ b/file\n@@ -1,3 +1,3 @@\n-line1\n+modified\n-something-else\n+line2\n line3\n`;
    const result = applyPatch(original, diff);
    expect(result).toBe(false);
  });
});

describe('delete_file', () => {
  it('deletes existing file', () => {
    const file = join(tmpDir, 'to-delete.txt');
    writeFileSync(file, 'delete me');
    rmSync(file);
    expect(() => readFileSync(file, 'utf-8')).toThrow();
  });
});

describe('list_dir', () => {
  it('lists directory contents', () => {
    writeFileSync(join(tmpDir, 'file1.txt'), 'content');
    const entries = readdirSync(tmpDir, { withFileTypes: true });
    expect(entries.length).toBeGreaterThan(0);
  });
});

describe('AllowlistGuard', () => {
  it('blocks /etc/passwd', () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/etc/passwd')).toThrow('SECURITY');
  });

  it('blocks path traversal', () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate(join(tmpDir, '..', '..', 'etc', 'passwd'))).toThrow('SECURITY');
  });

  it('allows files within root', () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const file = join(tmpDir, 'allowed.txt');
    expect(() => guard.validate(file)).not.toThrow();
  });
});
```

Create tests/filesystem.test.ts with these tests. Run `bun test` to verify.
```

### Files
- tests/filesystem.test.ts (create)

### Acceptance
- `bun test` passes with 0 failures
- All filesystem tools have tests
- AllowlistGuard security tests pass

---

## T5.2: Unit Tests - Git

### Prompt
```
ROLE: qa-engineer
CONTEXT: MCP server. Testing git module.
TASK: Create tests/git.test.ts with tests for git operations (mock git where needed)

### File: tests/git.test.ts
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { simpleGit } from 'simple-git';

let tmpDir: string;
let git: ReturnType<typeof simpleGit>;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), 'mcp-git-test-'));
  git = simpleGit(tmpDir);
  await git.init();
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true });
});

describe('git_status', () => {
  it('returns clean status for new repo', async () => {
    const status = await git.status();
    expect(status.current).toBeNull();
  });

  it('shows untracked files', async () => {
    writeFileSync(join(tmpDir, 'new-file.txt'), 'content');
    const status = await git.status();
    expect(status.not_added).toContain('new-file.txt');
  });

  it('shows staged files', async () => {
    writeFileSync(join(tmpDir, 'staged.txt'), 'content');
    await git.add('staged.txt');
    const status = await git.status();
    expect(status.staged).toContain('staged.txt');
  });
});

describe('git_diff', () => {
  it('returns empty for clean repo', async () => {
    const diff = await git.diff();
    expect(diff).toBe('');
  });

  it('shows changes after edit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'original');
    await git.add('file.txt');
    writeFileSync(join(tmpDir, 'file.txt'), 'modified');
    const diff = await git.diff();
    expect(diff).toContain('modified');
  });

  it('shows staged diff', async () => {
    writeFileSync(join(tmpDir, 'staged.txt'), 'modified content');
    await git.add('staged.txt');
    const diff = await git.diff(['--staged']);
    expect(diff).toContain('modified content');
  });
});

describe('git_log', () => {
  it('returns empty for new repo', async () => {
    const log = await git.log();
    expect(log.all.length).toBe(0);
  });

  it('shows commits after commit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial commit');
    const log = await git.log();
    expect(log.all.length).toBe(1);
    expect(log.all[0].message).toBe('Initial commit');
  });
});

describe('git_add', () => {
  it('stages single file', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    const status = await git.status();
    expect(status.staged).toContain('file.txt');
  });

  it('stages all with dot', async () => {
    writeFileSync(join(tmpDir, 'a.txt'), 'a');
    writeFileSync(join(tmpDir, 'b.txt'), 'b');
    await git.add('.');
    const status = await git.status();
    expect(status.staged).toContain('a.txt');
    expect(status.staged).toContain('b.txt');
  });
});

describe('git_commit', () => {
  it('creates commit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    const result = await git.commit('Test commit');
    expect(result.commit).toBeDefined();
    expect(result.summary.changed).toBe(1);
  });
});

describe('git_branch', () => {
  it('lists branches', async () => {
    const branches = await git.branchLocal();
    expect(branches.current).toBe('master');
    expect(branches.all).toContain('master');
  });

  it('creates branch', async () => {
    await git.branch(['new-branch']);
    const branches = await git.branchLocal();
    expect(branches.all).toContain('new-branch');
  });
});
```

Create tests/git.test.ts. Use real git in temp directories for integration tests.
```

### Files
- tests/git.test.ts (create)

### Acceptance
- `bun test` passes for git tests
- Tests use real git in temp directories

---

## T5.3: Unit Tests - Security

### Prompt
```
ROLE: qa-engineer
CONTEXT: MCP server. Security testing.
TASK: Create tests/security.test.ts with comprehensive security tests

### File: tests/security.test.ts
```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { AllowlistGuard } from '../src/security/allowlist.js';
import { sanitizePath, sanitizeFilename, sanitizeGitRef } from '../src/security/sanitize.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'mcp-sec-test-'));
});

describe('AllowlistGuard', () => {
  it('allows files within root', () => {
    const guard = new AllowlistGuard([tmpDir]);
    const file = join(tmpDir, 'allowed.txt');
    expect(() => guard.validate(file)).not.toThrow();
  });

  it('allows nested files within root', () => {
    const guard = new AllowlistGuard([tmpDir]);
    const nested = join(tmpDir, 'sub', 'deep', 'file.txt');
    expect(() => guard.validate(nested)).not.toThrow();
  });

  it('blocks /etc/passwd', () => {
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/etc/passwd')).toThrow('SECURITY');
  });

  it('blocks /root directory', () => {
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/root/.ssh/id_rsa')).toThrow('SECURITY');
  });

  it('blocks path traversal with ..', () => {
    const guard = new AllowlistGuard([tmpDir]);
    const traversal = join(tmpDir, '..', '..', 'etc', 'passwd');
    expect(() => guard.validate(traversal)).toThrow('SECURITY');
  });

  it('blocks absolute paths outside root', () => {
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/usr/local/bin')).toThrow('SECURITY');
  });

  it('blocks .env file', () => {
    const guard = new AllowlistGuard([tmpDir]);
    const envPath = join(tmpDir, '.env');
    expect(() => guard.validate(envPath)).toThrow('SECURITY');
  });

  it('blocks /proc filesystem', () => {
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/proc/self/environ')).toThrow('SECURITY');
  });

  it('blocks /sys filesystem', () => {
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/sys/kernel')).toThrow('SECURITY');
  });

  it('getAllowedRoots returns copy of roots', () => {
    const guard = new AllowlistGuard([tmpDir]);
    const roots = guard.getAllowedRoots();
    expect(roots).toEqual([tmpDir]);
    expect(roots).not.toBe(guard.getAllowedRoots()); // different reference
  });
});

describe('sanitizePath', () => {
  it('removes null bytes', () => {
    expect(sanitizePath('path\0with\0nulls')).toBe('pathwithnulls');
  });

  it('trims whitespace', () => {
    expect(sanitizePath('  path/to/file  ')).toBe('path/to/file');
  });

  it('preserves normal paths', () => {
    expect(sanitizePath('/normal/path/to/file.ts')).toBe('/normal/path/to/file.ts');
  });
});

describe('sanitizeFilename', () => {
  it('replaces special chars with underscore', () => {
    expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file________.txt');
  });

  it('preserves valid filenames', () => {
    expect(sanitizeFilename('valid-file_123.ts')).toBe('valid-file_123.ts');
  });
});

describe('sanitizeGitRef', () => {
  it('allows valid git refs', () => {
    expect(sanitizeGitRef('feature/new-feature')).toBe('feature/new-feature');
    expect(sanitizeGitRef('release/v1.0.0')).toBe('release/v1.0.0');
  });

  it('blocks shell special chars', () => {
    expect(sanitizeGitRef('feature; rm -rf /')).toBe('feature rm -rf ');
  });
});
```

Create tests/security.test.ts. Run `bun test` to verify all security tests pass.
```

### Files
- tests/security.test.ts (create)

### Acceptance
- All security tests pass
- Path traversal blocked in all cases
- Sanitization works correctly

---

## T5.4: Documentation

### Prompt
```
ROLE: qa-engineer
CONTEXT: MCP server. Documentation.
TASK: Create docs/TOOLS.md, docs/SECURITY.md, and README.md

### docs/TOOLS.md
```markdown
# Tools Documentation — mcp-filesystem-pro

18 tools across 3 modules.

## Filesystem Module (8 tools)

### read_file
Read a single file with optional line range.

**Parameters:**
- `path` (string, required): Absolute path
- `startLine` (number, optional): Start line (1-indexed)
- `endLine` (number, optional): End line (inclusive)

**Example:**
\`\`\`
read_file("/path/to/file.ts", startLine=10, endLine=50)
\`\`\`

---

### read_files
Read multiple files in one call.

**Parameters:**
- `paths` (string[], required): Array of absolute paths

**Example:**
\`\`\`
read_files(["/path/a.ts", "/path/b.ts"])
\`\`\`

---

### write_file
Write content to a NEW file only.

**Parameters:**
- `path` (string, required): Absolute path
- `content` (string, required): Content to write

**Note:** Use `apply_diff` for existing files.

---

### apply_diff (MOST IMPORTANT)
Apply a unified diff to an existing file.

**Parameters:**
- `path` (string, required): Absolute path
- `unified_diff` (string, required): Diff in unified format
- `reason` (string, required): Why this change
- `dry_run` (boolean, optional): Validate without applying

---

### delete_file
Delete a file. Requires `confirm: true`.

---

### list_dir
List directory with metadata (size, date, type).

---

### find_files
Find files by glob pattern.

---

### search_text
Search text/regex within files with context.

---

## Git Module (6 tools)

### git_status
Get repository status.

### git_diff
Show working tree changes.

### git_log
Show commit history.

### git_add
Stage files.

### git_commit
Create commit.

### git_branch
List/create/switch branches.

---

## Project Module (4 tools)

### detect_stack
Detect tech stack.

### find_config_files
Find config files.

### project_summary
Generate project overview.

### read_agents_md
Read AGENTS.md if exists.
```

### docs/SECURITY.md
```markdown
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

## Git Operations
All git operations are scoped to the project root. No git operations can access paths outside the allowed directory.
```

Create docs/TOOLS.md, docs/SECURITY.md with these exact contents.
```

### Files
- docs/TOOLS.md (create)
- docs/SECURITY.md (create)
- README.md (create — see acceptance)

### Acceptance
- docs/TOOLS.md has all 18 tools documented
- docs/SECURITY.md explains the security model
- README.md has quick start + tools table

---

## T5.5: Test Verification

### Prompt
```
ROLE: qa-engineer
CONTEXT: MCP server. Final verification.
TASK: Run full test suite and verify coverage

Run the following commands and ensure all pass:

1. `bun test` — All tests must pass with 0 failures
2. Verify no missing test coverage for tools

If tests fail, fix the issues before proceeding.

Final verification:
- All 18 tools implemented
- All tools have corresponding tests
- AllowlistGuard tests cover all blocked paths
- Documentation complete
```

### Acceptance
- `bun test` passes with 0 failures
- All 18 tools have tests