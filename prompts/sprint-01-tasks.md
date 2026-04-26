# Sprint 1 Task Prompts — Foundation Setup

**Sprint:** 1 — Foundation Setup
**Duration:** 2026-04-28 to 2026-05-04
**Agent:** @backend-dev

---

## T1.1: Project Initialization

### Prompt
```
ROLE: backend-dev
CONTEXT: New TypeScript project for MCP server. Stack: Bun + TypeScript + MCP SDK.
TASK: Initialize project with package.json, tsconfig.json, bunfig.toml

Create the following files:

### package.json
```json
{
  "name": "mcp-filesystem-pro",
  "version": "1.0.0",
  "description": "Production-grade MCP server for filesystem and git operations",
  "type": "module",
  "types": "dist/index.d.ts",
  "bin": {
    "mcp-filesystem-pro": "./dist/index.js"
  },
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "test": "bun test",
    "inspector": "bunx @modelcontextprotocol/inspector"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "simple-git": "^3.3.0",
    "diff": "^7.0.0",
    "zod": "^3.22.0",
    "glob": "^10.3.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### bunfig.toml
```toml
[install]
registry = "https://registry.npmjs.org/"

[test]
preload = ["./tests/setup.ts"]
```

Run `bun install` after creating package.json.
```

### Files
- package.json
- tsconfig.json
- bunfig.toml

### Acceptance
- `bun install` completes without errors
- TypeScript compiles with strict mode

---

## T1.2: Base Server Setup

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server project. Use @modelcontextprotocol/sdk ^1.0.0
TASK: Create src/index.ts, src/server.ts, src/types/index.ts, src/utils/logger.ts

### src/index.ts
```typescript
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const rootDir = process.argv[2] ?? process.cwd();
  const server = createServer(rootDir);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### src/server.ts
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AllowlistGuard } from './security/allowlist.js';

export function createServer(rootDir: string): Server {
  const guard = new AllowlistGuard([rootDir]);

  return new Server(
    { name: 'mcp-filesystem-pro', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );
}
```

### src/types/index.ts
```typescript
import { z } from 'zod';

export interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export const FilePathSchema = z.string();
export const ConfirmSchema = z.object({ confirm: z.literal(true) });
```

### src/utils/logger.ts
```typescript
type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    log('info', message, data);
  },
  warn(message: string, data?: Record<string, unknown>) {
    log('warn', message, data);
  },
  error(message: string, data?: Record<string, unknown>) {
    log('error', message, data);
  },
};

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };
  console.error(JSON.stringify(entry));
}
```

Create all files with these exact implementations.
```

### Files
- src/index.ts
- src/server.ts
- src/types/index.ts
- src/utils/logger.ts

### Acceptance
- Server initializes without errors
- Entry point exports main function

---

## T1.3: Security Foundation

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server with file system access. Security critical.
TASK: Create src/security/allowlist.ts and src/security/sanitize.ts

### src/security/allowlist.ts
```typescript
import { resolve, relative, isAbsolute } from 'path';

export class AllowlistGuard {
  private allowedRoots: string[];
  private suspiciousPaths = ['/etc/', '/root/', '~/.ssh/', '.env', '/proc/', '/sys/'];

  constructor(allowedRoots: string[]) {
    this.allowedRoots = allowedRoots.map(r => resolve(r));
  }

  validate(filePath: string): void {
    const resolved = resolve(filePath);

    const isAllowed = this.allowedRoots.some(root => {
      const rel = relative(root, resolved);
      return !rel.startsWith('..') && !isAbsolute(rel);
    });

    if (!isAllowed) {
      throw new Error(
        `SECURITY: Path "${filePath}" is outside allowed directory. ` +
        `Allowed roots: ${this.allowedRoots.join(', ')}`
      );
    }

    const isSuspicious = this.suspiciousPaths.some(p => resolved.includes(p));
    if (isSuspicious) {
      throw new Error(`SECURITY: Path "${filePath}" contains suspicious location.`);
    }
  }

  getAllowedRoots(): string[] {
    return [...this.allowedRoots];
  }
}
```

### src/security/sanitize.ts
```typescript
export function sanitizePath(path: string): string {
  return path.replace(/\0/g, '').trim();
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function sanitizeGitRef(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9._-/]/g, '');
}
```

Create both files with these exact implementations.
```

### Files
- src/security/allowlist.ts
- src/security/sanitize.ts

### Acceptance
- AllowlistGuard blocks /etc/passwd
- AllowlistGuard blocks path traversal (../..)
- AllowlistGuard blocks ~/.ssh

---

## T1.4: MCP Handshake Verification

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server project. Testing MCP handshake.
TASK: Verify the MCP server starts and responds to initialize handshake

Run the following commands and verify:

1. `bun run build` — should compile without errors
2. `bun run dev` — server should start (will timeout since no client connects)
3. Use MCP Inspector: `bun run inspector`

Create a minimal test in tests/handshake.test.ts:
```typescript
import { describe, it, expect } from 'bun:test';

describe('MCP Server', () => {
  it('should have valid package.json', () => {
    const pkg = await import('../package.json', { with: { type: 'json' } });
    expect(pkg.name).toBe('mcp-filesystem-pro');
    expect(pkg.version).toBe('1.0.0');
  });

  it('should export server creation function', async () => {
    const { createServer } = await import('../src/server.js');
    expect(createServer).toBeDefined();
  });
});
```

Run `bun test` and verify all tests pass.
```

### Files
- tests/handshake.test.ts (create)

### Acceptance
- `bun install` succeeds
- `bun run build` succeeds
- `bun test` passes with 0 failures
- Server can be imported without errors