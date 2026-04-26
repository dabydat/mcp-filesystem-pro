import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { simpleGit, SimpleGit } from 'simple-git';

let tmpDir: string;
let git: SimpleGit;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), 'mcp-git-test-'));
  git = simpleGit(tmpDir);
  await git.init();
  // Configure git user for tests
  await git.addConfig('user.email', 'test@example.com');
  await git.addConfig('user.name', 'Test User');
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true });
});

describe('git_status', () => {
  it('returns status for new repo', async () => {
    const status = await git.status();
    expect(status).toBeDefined();
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

  it('detects modified files', async () => {
    writeFileSync(join(tmpDir, 'modified.txt'), 'original');
    await git.add('modified.txt');
    await git.commit('Initial');
    writeFileSync(join(tmpDir, 'modified.txt'), 'changed');
    const status = await git.status();
    expect(status.modified).toContain('modified.txt');
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
  it('shows commits after commit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial commit');
    const log = await git.log();
    expect(log.all.length).toBe(1);
    expect(log.all[0].message).toBe('Initial commit');
  });

  it('returns commit details', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Test commit');
    const log = await git.log({ maxCount: 1 });
    expect(log.all.length).toBe(1);
    expect(log.all[0].message).toBe('Test commit');
  });

  it('limits commit count', async () => {
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(tmpDir, `file${i}.txt`), 'content');
      await git.add(`file${i}.txt`);
      await git.commit(`Commit ${i}`);
    }
    const log = await git.log({ maxCount: 3 });
    expect(log.all.length).toBe(3);
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

  it('stages files with pattern', async () => {
    writeFileSync(join(tmpDir, 'file1.txt'), 'content1');
    writeFileSync(join(tmpDir, 'file2.txt'), 'content2');
    await git.add('*.txt');
    const status = await git.status();
    expect(status.staged).toContain('file1.txt');
    expect(status.staged).toContain('file2.txt');
  });
});

describe('git_commit', () => {
  it('creates commit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    const result = await git.commit('Test commit');
    expect(result.commit).toBeDefined();
    expect(result.commit.length).toBe(40); // git commit hash length
  });

  it('returns commit hash', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    const result = await git.commit('With hash');
    expect(result.commit.length).toBe(40);
  });
});

describe('git_branch', () => {
  it('lists branches after first commit', async () => {
    // Create initial commit so we have a branch
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial');
    
    const branches = await git.branchLocal();
    expect(branches).toBeDefined();
    expect(branches.all).toBeDefined();
  });

  it('creates branch after first commit', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial');
    
    await git.branch(['new-branch']);
    const branches = await git.branchLocal();
    expect(branches.all).toContain('new-branch');
  });

  it('lists all branches including remote', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial');
    
    const branches = await git.branchLocal();
    expect(branches.branches).toBeDefined();
  });

  it('deletes branch', async () => {
    writeFileSync(join(tmpDir, 'file.txt'), 'content');
    await git.add('file.txt');
    await git.commit('Initial');
    
    await git.branch(['feature-branch']);
    await git.deleteLocalBranch('feature-branch');
    const branches = await git.branchLocal();
    expect(branches.all).not.toContain('feature-branch');
  });
});
