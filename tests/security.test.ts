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

  it('blocks multiple path traversal attempts', () => {
    const guard = new AllowlistGuard([tmpDir]);
    // Multiple .. segments
    expect(() => guard.validate(join(tmpDir, '..', '..', '..', '..', 'etc', 'passwd'))).toThrow('SECURITY');
  });

  it('handles root with trailing slash', () => {
    const guard = new AllowlistGuard([tmpDir + '/']);
    const file = join(tmpDir, 'file.txt');
    expect(() => guard.validate(file)).not.toThrow();
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

  it('removes multiple null bytes', () => {
    expect(sanitizePath('a\0b\0c')).toBe('abc');
  });

  it('handles paths with only whitespace', () => {
    expect(sanitizePath('   ')).toBe('');
  });
});

describe('sanitizeFilename', () => {
  it('replaces special chars with underscore', () => {
    // The regex [^a-zA-Z0-9._-] replaces <>:"|?* with underscore (7 chars -> 7 underscores)
    expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file_______.txt');
  });

  it('preserves valid filenames', () => {
    expect(sanitizeFilename('valid-file_123.ts')).toBe('valid-file_123.ts');
  });

  it('replaces spaces with underscore', () => {
    expect(sanitizeFilename('my file name.txt')).toBe('my_file_name.txt');
  });

  it('handles filenames with multiple dots', () => {
    expect(sanitizeFilename('file.name.test.ts')).toBe('file.name.test.ts');
  });

  it('replaces shell special characters', () => {
    expect(sanitizeFilename('file$name&test!')).toBe('file_name_test_');
  });
});

describe('sanitizeGitRef', () => {
  it('allows valid git refs', () => {
    expect(sanitizeGitRef('feature/new-feature')).toBe('feature/new-feature');
    expect(sanitizeGitRef('release/v1.0.0')).toBe('release/v1.0.0');
  });

  it('allows branch names with dashes and underscores', () => {
    expect(sanitizeGitRef('feature/my-branch_name')).toBe('feature/my-branch_name');
  });

  it('allows commit hashes', () => {
    expect(sanitizeGitRef('abc123def')).toBe('abc123def');
  });

  it('removes shell special chars', () => {
    // Semicolons and spaces are removed, slashes and dash are preserved
    expect(sanitizeGitRef('feature; rm -rf /')).toBe('featurerm-rf/');
  });

  it('removes pipe character', () => {
    expect(sanitizeGitRef('branch|name')).toBe('branchname');
  });

  it('allows numeric refs', () => {
    expect(sanitizeGitRef('v1.0.0')).toBe('v1.0.0');
  });
});
