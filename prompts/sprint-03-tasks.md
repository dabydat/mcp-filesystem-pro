# Sprint 3 Task Prompts — Git Module (6 tools)

**Sprint:** 3 — Git Module
**Duration:** 2026-05-12 to 2026-05-18
**Agent:** @backend-dev

---

## T3.1: Status Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Git operations using simple-git library.
TASK: Create src/modules/git/status.ts with git_status and git_diff tools

### git_status Tool
```typescript
server.tool(
  'git_status',
  'Get repository status: staged, unstaged, and untracked files.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
  },
  async ({ path }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);
    const status = await git.status();

    const result = {
      current: status.current,
      tracking: status.tracking,
      staged: status.staged,
      modified: status.modified,
      not_added: status.not_added,
      ignored: status.ignored,
      untracked: status.files.map(f => f),
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);
```

### git_diff Tool
```typescript
server.tool(
  'git_diff',
  'Show changes in working tree or between commits.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
    staged: z.boolean().optional().default(false).describe('Show staged changes'),
    commit: z.string().optional().describe('Show diff for specific commit'),
  },
  async ({ path, staged = false, commit }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);
    let diff: string;

    if (commit) {
      diff = await git.diff([commit, commit + '^']);
    } else if (staged) {
      diff = await git.diff(['--staged']);
    } else {
      diff = await git.diff();
    }

    return {
      content: [{ type: 'text', text: diff || 'No changes' }],
    };
  }
);
```

### File: src/modules/git/status.ts
Create with these implementations. Import {simpleGit} from 'simple-git'. Import {resolve} from 'path'. Import {z} from 'zod'.
```

### Files
- src/modules/git/status.ts

### Acceptance
- git_status returns staged, modified, untracked files
- git_diff shows working tree changes
- git_diff --staged shows staged changes

---

## T3.2: History Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Git history/log.
TASK: Create src/modules/git/history.ts with git_log tool

### git_log Tool
```typescript
server.tool(
  'git_log',
  'Show commit history with configurable format.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
    max_count: z.number().optional().default(20).describe('Maximum number of commits'),
    format: z.string().optional().default('%H|%an|%ae|%at|%s').describe('Format: hash|author email|timestamp|subject'),
  },
  async ({ path, max_count = 20, format = '%H|%an|%ae|%at|%s' }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);
    const log = await git.log({ maxCount: max_count, format });

    const commits = log.all.map(commit => ({
      hash: commit.hash,
      author: commit.author_name,
      email: commit.author_email,
      date: new Date(Number(commit.date) * 1000).toISOString(),
      subject: commit.message,
    }));

    return {
      content: [{ type: 'text', text: JSON.stringify(commits, null, 2) }],
    };
  }
);
```

### File: src/modules/git/history.ts
Create with this implementation. Import {simpleGit} from 'simple-git'. Import {resolve} from 'path'.
```

### Files
- src/modules/git/history.ts

### Acceptance
- git_log returns array of commits
- Each commit has hash, author, email, date, subject

---

## T3.3: Operations (Add, Commit, Branch)

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Git add, commit, branch operations.
TASK: Create src/modules/git/operations.ts with git_add, git_commit, git_branch tools

### git_add Tool
```typescript
server.tool(
  'git_add',
  'Stage files for commit.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
    files: z.union([z.string(), z.array(z.string())]).describe('Files to stage (use "." for all)'),
  },
  async ({ path, files }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);
    const filesArray = typeof files === 'string' ? [files] : files;

    await git.add(filesArray);

    return {
      content: [{ type: 'text', text: `✅ Staged: ${filesArray.join(', ')}` }],
    };
  }
);
```

### git_commit Tool
```typescript
server.tool(
  'git_commit',
  'Create a commit with message.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
    message: z.string().describe('Commit message'),
  },
  async ({ path, message }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);
    const result = await git.commit(message);

    return {
      content: [{ type: 'text', text: `✅ Commit created: ${result.commit}` }],
    };
  }
);
```

### git_branch Tool
```typescript
server.tool(
  'git_branch',
  'List, create, or switch branches.',
  {
    path: z.string().optional().describe('Repository path (default: project root)'),
    action: z.enum(['list', 'create', 'switch', 'delete']).optional().default('list').describe('Action to perform'),
    name: z.string().optional().describe('Branch name (required for create/switch/delete)'),
  },
  async ({ path, action = 'list', name }) => {
    const repoPath = path ? resolve(path) : rootDir;
    guard.validate(repoPath);

    const git = simpleGit(repoPath);

    switch (action) {
      case 'list': {
        const branches = await git.branchLocal();
        return {
          content: [{ type: 'text', text: JSON.stringify(branches, null, 2) }],
        };
      }
      case 'create': {
        if (!name) return { content: [{ type: 'text', text: 'ERROR: name required for create' }], isError: true };
        await git.branch([name]);
        return { content: [{ type: 'text', text: `✅ Branch created: ${name}` }] };
      }
      case 'switch': {
        if (!name) return { content: [{ type: 'text', text: 'ERROR: name required for switch' }], isError: true };
        await git.checkout(name);
        return { content: [{ type: 'text', text: `✅ Switched to: ${name}` }] };
      }
      case 'delete': {
        if (!name) return { content: [{ type: 'text', text: 'ERROR: name required for delete' }], isError: true };
        await git.deleteLocalBranch(name);
        return { content: [{ type: 'text', text: `✅ Branch deleted: ${name}` }] };
      }
      default:
        return { content: [{ type: 'text', text: 'ERROR: invalid action' }], isError: true };
    }
  }
);
```

### File: src/modules/git/operations.ts
Create with these implementations. Import {simpleGit} from 'simple-git'. Import {resolve} from 'path'.
```

### Files
- src/modules/git/operations.ts

### Acceptance
- git_add stages files
- git_commit creates commit with message
- git_branch list shows all branches
- git_branch create creates new branch
- git_branch switch changes branch

---

## T3.4: Module Export

### Prompt
```
ROLE: backend-dev
CONTEXT: All git tools created. Wire them to server.
TASK: Create src/modules/git/index.ts and update server to register git module

### src/modules/git/index.ts
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createStatusTools } from './status.js';
import { createHistoryTools } from './history.js';
import { createOperationTools } from './operations.js';

export function createGitModule(server: Server, guard: AllowlistGuard, rootDir: string): void {
  createStatusTools(server, guard, rootDir);
  createHistoryTools(server, guard, rootDir);
  createOperationTools(server, guard, rootDir);
}
```

Update src/server.ts to call createGitModule:
```typescript
import { createFilesystemModule } from './modules/filesystem/index.js';
import { createGitModule } from './modules/git/index.js';

export function createServer(rootDir: string): Server {
  const guard = new AllowlistGuard([rootDir]);

  const server = new Server(
    { name: 'mcp-filesystem-pro', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  createFilesystemModule(server, guard);
  createGitModule(server, guard, rootDir);

  return server;
}
```

Create src/modules/git/index.ts and update src/server.ts.
```

### Files
- src/modules/git/index.ts (create)
- src/server.ts (update)

### Acceptance
- Server starts with all 14 tools (8 filesystem + 6 git)
- git_status command works in test repo