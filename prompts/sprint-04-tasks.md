# Sprint 4 Task Prompts — Project Module (4 tools)

**Sprint:** 4 — Project Module
**Duration:** 2026-05-19 to 2026-05-25
**Agent:** @backend-dev

---

## T4.1: Detection (detect_stack, find_config_files)

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Project detection (tech stack, config files).
TASK: Create src/modules/project/detect.ts with detect_stack and find_config_files tools

### detect_stack Tool
```typescript
interface StackInfo {
  language: string[];
  framework: string[];
  packageManager: 'npm' | 'yarn' | 'bun' | 'pnpm' | 'pip' | 'cargo' | 'go' | 'unknown';
  testFramework: string[];
  configFiles: string[];
  hasDockerfile: boolean;
  hasAgentsMd: boolean;
}

server.tool(
  'detect_stack',
  'Detect tech stack of project (npm/bun/cargo/go/etc). Call at start of new project session.',
  {
    project_root: z.string().optional().describe('Project root path'),
  },
  async ({ project_root }) => {
    const root = project_root ? resolve(project_root) : rootDir;
    guard.validate(root);

    const info: StackInfo = {
      language: [],
      framework: [],
      packageManager: 'unknown',
      testFramework: [],
      configFiles: [],
      hasDockerfile: false,
      hasAgentsMd: false,
    };

    // Package managers
    if (existsSync(join(root, 'package.json'))) {
      info.configFiles.push('package.json');
      if (existsSync(join(root, 'yarn.lock'))) {
        info.packageManager = 'yarn';
      } else if (existsSync(join(root, 'bun.lockb'))) {
        info.packageManager = 'bun';
      } else if (existsSync(join(root, 'pnpm-lock.yaml'))) {
        info.packageManager = 'pnpm';
      } else {
        info.packageManager = 'npm';
      }
    }
    if (existsSync(join(root, 'Cargo.toml'))) {
      info.packageManager = 'cargo';
      info.configFiles.push('Cargo.toml');
    }
    if (existsSync(join(root, 'go.mod'))) {
      info.packageManager = 'go';
      info.configFiles.push('go.mod');
    }

    // Read package.json for frameworks
    try {
      const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
      if (pkg.dependencies?.react) info.framework.push('React');
      if (pkg.dependencies?.vue) info.framework.push('Vue');
      if (pkg.dependencies?.next) info.framework.push('Next.js');
      if (pkg.dependencies?.express) info.framework.push('Express');
      if (pkg.devDependencies?.vitest) info.testFramework.push('Vitest');
      if (pkg.devDependencies?.jest) info.testFramework.push('Jest');
    } catch {}

    // TypeScript
    if (existsSync(join(root, 'tsconfig.json'))) {
      info.configFiles.push('tsconfig.json');
      info.language.push('TypeScript');
    }

    // Dockerfile
    info.hasDockerfile = existsSync(join(root, 'Dockerfile'));

    // AGENTS.md
    info.hasAgentsMd = existsSync(join(root, 'AGENTS.md'));

    return {
      content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
    };
  }
);
```

### find_config_files Tool
```typescript
server.tool(
  'find_config_files',
  'Find configuration files in project.',
  {
    project_root: z.string().optional().describe('Project root path'),
    type: z.enum(['all', 'eslint', 'prettier', 'tsconfig', 'docker', 'git']).optional().default('all'),
  },
  async ({ project_root, type = 'all' }) => {
    const root = project_root ? resolve(project_root) : rootDir;
    guard.validate(root);

    const configs: Record<string, string[]> = {};

    if (type === 'all' || type === 'eslint') {
      const eslint = await glob('**/.eslintrc*', { cwd: root, absolute: true });
      const eslintrc = await glob('**/eslint.config.*', { cwd: root, absolute: true });
      configs.eslint = [...eslint, ...eslintrc];
    }

    if (type === 'all' || type === 'prettier') {
      const prettier = await glob('**/.prettierrc*', { cwd: root, absolute: true });
      configs.prettier = prettier;
    }

    if (type === 'all' || type === 'tsconfig') {
      const tsconfig = await glob('**/tsconfig*.json', { cwd: root, absolute: true });
      configs.tsconfig = tsconfig;
    }

    if (type === 'all' || type === 'docker') {
      const dockerfile = await glob('**/Dockerfile*', { cwd: root, absolute: true });
      configs.docker = dockerfile;
    }

    if (type === 'all' || type === 'git') {
      const gitignore = await glob('**/.gitignore', { cwd: root, absolute: true });
      configs.git = gitignore;
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(configs, null, 2) }],
    };
  }
);
```

### File: src/modules/project/detect.ts
Create with these implementations. Import needed from 'fs', 'path', 'glob'.
```

### Files
- src/modules/project/detect.ts

### Acceptance
- detect_stack identifies npm/yarn/bun/cargo/go projects
- find_config_files returns relevant config files by type

---

## T4.2: Summary (project_summary)

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. Project overview.
TASK: Create src/modules/project/summary.ts with project_summary tool

### project_summary Tool
```typescript
server.tool(
  'project_summary',
  'Generate project overview: structure, stack, conventions.',
  {
    project_root: z.string().optional().describe('Project root path'),
    depth: z.number().optional().default(2).describe('Directory depth to show'),
  },
  async ({ project_root, depth = 2 }) => {
    const root = project_root ? resolve(project_root) : rootDir;
    guard.validate(root);

    const summary: Record<string, unknown> = {
      root,
      structure: await getDirectoryTree(root, depth),
      stack: null,
      fileCount: 0,
    };

    // Get stack info
    try {
      const detectResult = await detectStack(root);
      summary.stack = detectResult;
    } catch {}

    // Count files
    const allFiles = await glob('**/*', { cwd: root, absolute: true });
    summary.fileCount = allFiles.length;

    return {
      content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
    };
  }
);

async function getDirectoryTree(dir: string, maxDepth: number, currentDepth = 0): Promise<Record<string, unknown>> {
  if (currentDepth >= maxDepth) {
    return { _truncated: true };
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const result: Record<string, unknown> = {};

  for (const entry of entries.slice(0, 20)) { // Limit entries
    if (entry.name.startsWith('.')) continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      result[entry.name + '/'] = await getDirectoryTree(fullPath, maxDepth, currentDepth + 1);
    } else {
      result[entry.name] = entry.name.split('.').pop();
    }
  }

  return result;
}
```

### File: src/modules/project/summary.ts
Create with this implementation. Import needed from 'fs', 'path', 'glob'.
```

### Files
- src/modules/project/summary.ts

### Acceptance
- project_summary returns project structure
- project_summary includes stack info
- project_summary includes file count

---

## T4.3: Agents.md Support (read_agents_md)

### Prompt
```
ROLE: backend-dev
CONTEXT: MCP server. AGENTS.md file parsing.
TASK: Create src/modules/project/agents-md.ts with read_agents_md tool

### read_agents_md Tool
```typescript
server.tool(
  'read_agents_md',
  'Read and parse AGENTS.md if it exists in the project.',
  {
    project_root: z.string().optional().describe('Project root path'),
  },
  async ({ project_root }) => {
    const root = project_root ? resolve(project_root) : rootDir;
    guard.validate(root);

    const agentsMdPath = join(root, 'AGENTS.md');

    if (!existsSync(agentsMdPath)) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ exists: false, message: 'No AGENTS.md found in project root' }) }],
      };
    }

    const content = readFileSync(agentsMdPath, 'utf-8');

    return {
      content: [{ type: 'text', text: JSON.stringify({ exists: true, content }) }],
    };
  }
);
```

### File: src/modules/project/agents-md.ts
Create with this implementation. Import needed from 'fs', 'path'.
```

### Files
- src/modules/project/agents-md.ts

### Acceptance
- read_agents_md returns {exists: true, content: "..."} if file exists
- read_agents_md returns {exists: false, message: "..."} if file missing

---

## T4.4: Module Export

### Prompt
```
ROLE: backend-dev
CONTEXT: All project tools created. Wire them to server.
TASK: Create src/modules/project/index.ts and update server to register project module

### src/modules/project/index.ts
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { createDetectTools } from './detect.js';
import { createSummaryTools } from './summary.js';
import { createAgentsMdTools } from './agents-md.js';

export function createProjectModule(server: Server, guard: AllowlistGuard, rootDir: string): void {
  createDetectTools(server, guard, rootDir);
  createSummaryTools(server, guard, rootDir);
  createAgentsMdTools(server, guard, rootDir);
}
```

Update src/server.ts to call createProjectModule:
```typescript
import { createFilesystemModule } from './modules/filesystem/index.js';
import { createGitModule } from './modules/git/index.js';
import { createProjectModule } from './modules/project/index.js';

export function createServer(rootDir: string): Server {
  const guard = new AllowlistGuard([rootDir]);

  const server = new Server(
    { name: 'mcp-filesystem-pro', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  createFilesystemModule(server, guard);
  createGitModule(server, guard, rootDir);
  createProjectModule(server, guard, rootDir);

  return server;
}
```

Create src/modules/project/index.ts and update src/server.ts.
```

### Files
- src/modules/project/index.ts (create)
- src/server.ts (update)

### Acceptance
- Server starts with all 18 tools
- detect_stack works in npm project
- read_agents_md returns exists:false if no AGENTS.md