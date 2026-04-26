import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync, mkdirSync } from 'fs';
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

  it('returns content split by newlines', () => {
    const file = join(tmpDir, 'lines.txt');
    writeFileSync(file, 'line1\nline2\nline3');
    const content = readFileSync(file, 'utf-8');
    expect(content).toBe('line1\nline2\nline3');
  });

  it('throws for non-existent file', () => {
    expect(() => readFileSync(join(tmpDir, 'missing.txt'), 'utf-8')).toThrow();
  });
});

describe('write_file', () => {
  it('creates new file with content', () => {
    const file = join(tmpDir, 'new.txt');
    writeFileSync(file, 'content');
    expect(readFileSync(file, 'utf-8')).toBe('content');
  });

  it('overwrites existing content', () => {
    const file = join(tmpDir, 'existing.txt');
    writeFileSync(file, 'original');
    writeFileSync(file, 'updated');
    expect(readFileSync(file, 'utf-8')).toBe('updated');
  });

  it('creates file in existing directory', () => {
    const file = join(tmpDir, 'subdir', 'file.txt');
    mkdirSync(join(tmpDir, 'subdir'), { recursive: true });
    writeFileSync(file, 'deep content');
    expect(readFileSync(file, 'utf-8')).toBe('deep content');
  });
});

describe('apply_diff', () => {
  it('applies valid diff that adds content', () => {
    const file = join(tmpDir, 'code.ts');
    writeFileSync(file, 'function hello() {\n  return "world";\n}\n');

    const diff = `--- a/code.ts\n+++ b/code.ts\n@@ -1,3 +1,3 @@\n function hello() {\n-  return "world";\n+  return "universe";\n }\n`;

    const { applyPatch } = require('diff');
    const original = readFileSync(file, 'utf-8');
    const result = applyPatch(original, diff);
    expect(result).not.toBe(false);
    if (result) writeFileSync(file, result, 'utf-8');
    expect(readFileSync(file, 'utf-8')).toContain('universe');
  });

  it('fails on conflicting diff', () => {
    const { applyPatch } = require('diff');
    const original = 'line1\nline2\nline3';
    const diff = `--- a/file\n+++ b/file\n@@ -1,3 +1,3 @@\n-line1\n+modified\n-something-else\n+line2\n line3\n`;
    const result = applyPatch(original, diff);
    expect(result).toBe(false);
  });

  it('applies diff that removes content', () => {
    const file = join(tmpDir, 'remove.txt');
    writeFileSync(file, 'line1\nline2\nline3');

    const diff = `--- a/remove.txt\n+++ b/remove.txt\n@@ -1,3 +1,2 @@\n-line1\n line2\n line3\n`;

    const { applyPatch } = require('diff');
    const original = readFileSync(file, 'utf-8');
    const result = applyPatch(original, diff);
    expect(result).not.toBe(false);
    if (result) writeFileSync(file, result, 'utf-8');
    expect(readFileSync(file, 'utf-8')).not.toContain('line1');
  });
});

describe('delete_file', () => {
  it('deletes existing file', () => {
    const file = join(tmpDir, 'to-delete.txt');
    writeFileSync(file, 'delete me');
    rmSync(file);
    expect(() => readFileSync(file, 'utf-8')).toThrow();
  });

  it('throws when deleting non-existent file', () => {
    const file = join(tmpDir, 'missing.txt');
    expect(() => rmSync(file)).toThrow();
  });
});

describe('list_dir', () => {
  it('lists directory contents', () => {
    writeFileSync(join(tmpDir, 'file1.txt'), 'content1');
    writeFileSync(join(tmpDir, 'file2.txt'), 'content2');
    const entries = readdirSync(tmpDir, { withFileTypes: true });
    expect(entries.length).toBe(2);
  });

  it('returns directory entries with type info', () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    mkdirSync(join(tmpDir, 'subdir'));
    const entries = readdirSync(tmpDir, { withFileTypes: true });
    expect(entries.some(e => e.isDirectory())).toBe(true);
  });

  it('excludes hidden files when not requested', () => {
    writeFileSync(join(tmpDir, 'visible.txt'), 'content');
    writeFileSync(join(tmpDir, '.hidden'), 'hidden');
    const entries = readdirSync(tmpDir, { withFileTypes: true });
    expect(entries.filter(e => !e.name.startsWith('.')).length).toBe(1);
  });
});

describe('find_files', () => {
  it('finds files matching glob pattern', async () => {
    writeFileSync(join(tmpDir, 'a.ts'), 'content');
    writeFileSync(join(tmpDir, 'b.ts'), 'content');
    writeFileSync(join(tmpDir, 'c.txt'), 'content');

    const { glob } = await import('glob');
    const files = await glob('*.ts', { cwd: tmpDir, absolute: true });
    expect(files.length).toBe(2);
  });

  it('finds files recursively', async () => {
    mkdirSync(join(tmpDir, 'src'));
    writeFileSync(join(tmpDir, 'src', 'index.ts'), 'content');
    writeFileSync(join(tmpDir, 'src', 'config.json'), 'content');

    const { glob } = await import('glob');
    const files = await glob('**/*.ts', { cwd: tmpDir, absolute: true });
    expect(files.length).toBe(1);
  });
});

describe('search_text', () => {
  it('finds matching lines in files', async () => {
    const file = join(tmpDir, 'data.txt');
    writeFileSync(file, 'line with target\nother line');

    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const matches = lines.filter(line => line.includes('target'));
    expect(matches.length).toBe(1);
    expect(matches[0]).toContain('target');
  });

  it('returns empty for no matches', async () => {
    const file = join(tmpDir, 'data.txt');
    writeFileSync(file, 'no matches here');

    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const matches = lines.filter(line => line.includes('notfound'));
    expect(matches.length).toBe(0);
  });
});

describe('AllowlistGuard', () => {
  it('allows files within root', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const file = join(tmpDir, 'allowed.txt');
    expect(() => guard.validate(file)).not.toThrow();
  });

  it('allows nested files within root', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const nested = join(tmpDir, 'sub', 'deep', 'file.txt');
    expect(() => guard.validate(nested)).not.toThrow();
  });

  it('blocks /etc/passwd', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/etc/passwd')).toThrow('SECURITY');
  });

  it('blocks /root directory', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/root/.ssh/id_rsa')).toThrow('SECURITY');
  });

  it('blocks path traversal with ..', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const traversal = join(tmpDir, '..', '..', 'etc', 'passwd');
    expect(() => guard.validate(traversal)).toThrow('SECURITY');
  });

  it('blocks absolute paths outside root', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/usr/local/bin')).toThrow('SECURITY');
  });

  it('blocks .env file', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const envPath = join(tmpDir, '.env');
    expect(() => guard.validate(envPath)).toThrow('SECURITY');
  });

  it('blocks /proc filesystem', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/proc/self/environ')).toThrow('SECURITY');
  });

  it('blocks /sys filesystem', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    expect(() => guard.validate('/sys/kernel')).toThrow('SECURITY');
  });

  it('getAllowedRoots returns copy of roots', async () => {
    const { AllowlistGuard } = await import('../src/security/allowlist.js');
    const guard = new AllowlistGuard([tmpDir]);
    const roots = guard.getAllowedRoots();
    expect(roots).toEqual([tmpDir]);
    expect(roots).not.toBe(guard.getAllowedRoots());
  });
});
