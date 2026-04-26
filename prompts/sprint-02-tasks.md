# Sprint 2 Task Prompts — Filesystem Module (8 tools)

**Sprint:** 2 — Filesystem Module
**Duration:** 2026-05-05 to 2026-05-11
**Agent:** @backend-dev

---

## T2.1: Read Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server with filesystem access. Read operations.
TASK: Create src/modules/filesystem/read.ts with read_file and read_files tools

### read_file Tool
```typescript
server.tool(
  'read_file',
  'Read a single file. Supports line range: read_file(path, startLine, endLine)',
  {
    path: z.string().describe('Absolute path to file'),
    startLine: z.number().optional().describe('Line number to start reading (1-indexed)'),
    endLine: z.number().optional().describe('Line number to stop reading (inclusive)'),
  },
  async ({ path, startLine, endLine }) => {
    guard.validate(path);

    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n');

    const start = startLine ? startLine - 1 : 0;
    const end = endLine ? endLine : lines.length;
    const selected = lines.slice(start, end).join('\n');

    return {
      content: [{ type: 'text', text: selected }],
    };
  }
);
```

### read_files Tool
```typescript
server.tool(
  'read_files',
  'Read multiple files in a single call. Returns {path: content} object.',
  {
    paths: z.array(z.string()).describe('Array of absolute paths'),
  },
  async ({ paths }) => {
    paths.forEach(p => guard.validate(p));

    const result: Record<string, string> = {};
    for (const p of paths) {
      result[p] = readFileSync(p, 'utf-8');
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);
```

### File: src/modules/filesystem/read.ts
Create with these implementations. Import {readFileSync} from 'fs'.
```

### Files
- src/modules/filesystem/read.ts

### Acceptance
- read_file returns file content
- read_file with startLine/endLine returns only that range
- read_files returns JSON object with all files

---

## T2.2: Write Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. write_file for new files, apply_diff for modifications.
TASK: Create src/modules/filesystem/write.ts with write_file and apply_diff tools

### write_file Tool
```typescript
server.tool(
  'write_file',
  'Write content to a new file. Only for NEW files — use apply_diff for existing files.',
  {
    path: z.string().describe('Absolute path to file'),
    content: z.string().describe('Content to write'),
  },
  async ({ path, content }) => {
    guard.validate(path);

    if (existsSync(path)) {
      return {
        content: [{ type: 'text', text: `ERROR: File exists. Use apply_diff to modify: ${path}` }],
        isError: true,
      };
    }

    writeFileSync(path, content, 'utf-8');
    logger.info({ path, operation: 'write_file' });

    return {
      content: [{ type: 'text', text: `✅ File created: ${path}` }],
    };
  }
);
```

### apply_diff Tool (CRITICAL — most important tool)
```typescript
server.tool(
  'apply_diff',
  'Apply a unified diff to an existing file. Use this for modifications — NEVER use write_file on existing files.',
  {
    path: z.string().describe('Absolute path to file'),
    unified_diff: z.string().describe('Unified diff format (diff -u). Must include --- and +++ headers and 3+ lines of context'),
    reason: z.string().max(200).describe('Why this change is being made (for log)'),
    dry_run: z.boolean().optional().default(false).describe('Validate diff but do not apply'),
  },
  async ({ path, unified_diff, reason, dry_run }) => {
    guard.validate(path);

    const original = readFileSync(path, 'utf-8');
    const result = applyPatch(original, unified_diff);

    if (result === false) {
      return {
        content: [{ type: 'text', text: `ERROR: Diff cannot be applied. File may have changed since diff was generated. Re-read file and regenerate diff.` }],
        isError: true,
      };
    }

    if (dry_run) {
      const added = (unified_diff.match(/^\+[^+]/gm) ?? []).length;
      const removed = (unified_diff.match(/^-[^-]/gm) ?? []).length;
      return {
        content: [{ type: 'text', text: `DRY RUN OK: Diff is valid. +${added} lines, -${removed} lines. Call again with dry_run=false to apply.` }],
      };
    }

    writeFileSync(path, result, 'utf-8');
    logger.info({ path, reason, operation: 'apply_diff' });

    return {
      content: [{ type: 'text', text: `✅ Diff applied to ${path}. Reason: ${reason}` }],
    };
  }
);
```

### File: src/modules/filesystem/write.ts
Create with these implementations. Import {readFileSync, writeFileSync, existsSync} from 'fs'. Import {applyPatch} from 'diff'.
```

### Files
- src/modules/filesystem/write.ts

### Acceptance
- write_file fails if file exists
- apply_diff applies valid diffs
- apply_diff returns clear error when diff won't apply
- dry_run validates without modifying

---

## T2.3: Delete Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. File deletion with confirmation requirement.
TASK: Create src/modules/filesystem/delete.ts with delete_file tool

### delete_file Tool
```typescript
server.tool(
  'delete_file',
  'Delete a file. REQUIRES confirm: true in request.',
  {
    path: z.string().describe('Absolute path to file'),
    confirm: z.literal(true).describe('Must be true to confirm deletion'),
  },
  async ({ path, confirm }) => {
    if (!confirm) {
      return {
        content: [{ type: 'text', text: 'ERROR: confirm: true is required to delete a file.' }],
        isError: true,
      };
    }

    guard.validate(path);

    if (!existsSync(path)) {
      return {
        content: [{ type: 'text', text: `ERROR: File not found: ${path}` }],
        isError: true,
      };
    }

    rmSync(path);
    logger.info({ path, operation: 'delete_file' });

    return {
      content: [{ type: 'text', text: `✅ File deleted: ${path}` }],
    };
  }
);
```

### File: src/modules/filesystem/delete.ts
Create with this implementation. Import {existsSync, rmSync} from 'fs'.
```

### Files
- src/modules/filesystem/delete.ts

### Acceptance
- delete_file fails without confirm: true
- delete_file fails if file doesn't exist
- delete_file removes the file

---

## T2.4: Search Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. File and text search.
TASK: Create src/modules/filesystem/search.ts with find_files and search_text tools

### find_files Tool
```typescript
server.tool(
  'find_files',
  'Find files by glob pattern or name. Searches recursively from root.',
  {
    pattern: z.string().describe('Glob pattern (e.g., "*.ts", "**/*.json")'),
    root: z.string().optional().describe('Root directory to search (default: project root)'),
  },
  async ({ pattern, root }) => {
    const searchRoot = root ? resolve(root) : rootDir;
    guard.validate(searchRoot);

    const files = await glob(pattern, { cwd: searchRoot, absolute: true });
    return {
      content: [{ type: 'text', text: JSON.stringify(files, null, 2) }],
    };
  }
);
```

### search_text Tool
```typescript
server.tool(
  'search_text',
  'Search for text or regex within files. Returns matches with context lines.',
  {
    pattern: z.string().describe('Regex or text pattern to search'),
    path: z.string().optional().describe('Directory to search (default: project root)'),
    file_pattern: z.string().optional().describe('Only search files matching glob (e.g., "*.ts")'),
    context_lines: z.number().optional().default(2).describe('Lines of context around matches'),
    max_results: z.number().optional().default(50).describe('Maximum number of results'),
  },
  async ({ pattern, path, file_pattern, context_lines = 2, max_results = 50 }) => {
    const searchRoot = path ? resolve(path) : rootDir;
    guard.validate(searchRoot);

    const searchPattern = new RegExp(pattern, 'g');
    const globPattern = file_pattern ?? '**/*';
    const files = await glob(globPattern, { cwd: searchRoot, absolute: true });

    const results: Array<{ file: string; line: number; content: string }> = [];
    for (const file of files.slice(0, 100)) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (searchPattern.test(lines[i])) {
            results.push({ file, line: i + 1, content: lines[i] });
            if (results.length >= max_results) break;
          }
        }
      } catch {}
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
    };
  }
);
```

### File: src/modules/filesystem/search.ts
Create with these implementations. Import {readFileSync} from 'fs'. Import {glob} from 'glob'. Import {resolve} from 'path'.
```

### Files
- src/modules/filesystem/search.ts

### Acceptance
- find_files returns array of matching file paths
- search_text returns matches with file, line number, content
- search_text supports regex patterns

---

## T2.5: List Operations

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Directory listing with metadata.
TASK: Create src/modules/filesystem/list.ts with list_dir tool

### list_dir Tool
```typescript
server.tool(
  'list_dir',
  'List directory contents with metadata (size, date, type).',
  {
    path: z.string().optional().describe('Directory path (default: project root)'),
    include_hidden: z.boolean().optional().default(false).describe('Include hidden files'),
  },
  async ({ path, include_hidden = false }) => {
    const dirPath = path ? resolve(path) : rootDir;
    guard.validate(dirPath);

    const entries = readdirSync(dirPath, { withFileTypes: true });
    const filtered = include_hidden ? entries : entries.filter(e => !e.name.startsWith('.'));

    const result = filtered.map(entry => {
      const fullPath = join(dirPath, entry.name);
      const stats = statSync(fullPath);
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'dir' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString(),
      };
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);
```

### File: src/modules/filesystem/list.ts
Create with this implementation. Import {readdirSync, statSync} from 'fs'. Import {resolve, join} from 'path'.
```

### Files
- src/modules/filesystem/list.ts

### Acceptance
- list_dir returns entries with name, type, size, modified date
- list_dir distinguishes files from directories

---

## T2.6: Module Export

### Prompt
```
ROLE: backend-dev
CONTEXT: All filesystem tools created. Now wire them to the server.
TASK: Create src/modules/filesystem/index.ts that exports a function to register all tools

### src/modules/filesystem/index.ts
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createReadTools } from './read.js';
import { createWriteTools } from './write.js';
import { createDeleteTools } from './delete.js';
import { createSearchTools } from './search.js';
import { createListTools } from './list.js';

export function createFilesystemModule(server: Server, guard: AllowlistGuard): void {
  createReadTools(server, guard);
  createWriteTools(server, guard);
  createDeleteTools(server, guard);
  createSearchTools(server, guard);
  createListTools(server, guard);
}
```

Also update src/server.ts to call createFilesystemModule:
```typescript
import { createServer } from './server.js';
import { createFilesystemModule } from './modules/filesystem/index.js';

export function createServer(rootDir: string): Server {
  const guard = new AllowlistGuard([rootDir]);

  const server = new Server(
    { name: 'mcp-filesystem-pro', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  createFilesystemModule(server, guard);

  return server;
}
```

Create src/modules/filesystem/index.ts and update src/server.ts.
```

### Files
- src/modules/filesystem/index.ts (create)
- src/server.ts (update)

### Acceptance
- Server starts successfully
- All 8 filesystem tools are registered