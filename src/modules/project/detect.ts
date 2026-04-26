import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';
import { glob } from 'glob';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AllowlistGuard } from '../../security/allowlist.js';
import { PROJECT_TOOL_NAMES, CONFIG_FILE_TYPES, type ConfigFileType } from '../../constants/project.js';
import { successResult } from '../../types/results.js';
import { readJsonFile } from '../../utils/file.js';

type PackageManager = 'npm' | 'yarn' | 'bun' | 'pnpm' | 'pip' | 'cargo' | 'go' | 'unknown';

interface StackInfo {
  language: string[];
  framework: string[];
  packageManager: PackageManager;
  testFramework: string[];
  configFiles: string[];
  hasDockerfile: boolean;
  hasAgentsMd: boolean;
}

interface StackDetectorContext {
  root: string;
  info: StackInfo;
}

function createStackInfo(): StackInfo {
  return {
    language: [],
    framework: [],
    packageManager: 'unknown',
    testFramework: [],
    configFiles: [],
    hasDockerfile: false,
    hasAgentsMd: false,
  };
}

function detectPackageManager(ctx: StackDetectorContext): void {
  const { root, info } = ctx;
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
}

function detectFrameworksAndTest(ctx: StackDetectorContext): void {
  const { root, info } = ctx;
  const pkgPath = join(root, 'package.json');
  const pkg = readJsonFile<Record<string, unknown>>(pkgPath);
  if (!pkg) return;

  const deps = pkg.dependencies as Record<string, unknown> | undefined;
  const devDeps = pkg.devDependencies as Record<string, unknown> | undefined;

  if (deps?.react) info.framework.push('React');
  if (deps?.vue) info.framework.push('Vue');
  if (deps?.next) info.framework.push('Next.js');
  if (deps?.express) info.framework.push('Express');
  if (devDeps?.vitest) info.testFramework.push('Vitest');
  if (devDeps?.jest) info.testFramework.push('Jest');
  if (deps?.typescript || devDeps?.typescript) {
    info.language.push('TypeScript');
  }
}

function detectTypeScript(ctx: StackDetectorContext): void {
  const { root, info } = ctx;
  if (existsSync(join(root, 'tsconfig.json'))) {
    info.configFiles.push('tsconfig.json');
    if (!info.language.includes('TypeScript')) {
      info.language.push('TypeScript');
    }
  }
}

function detectDockerAndAgentsMd(ctx: StackDetectorContext): void {
  const { root, info } = ctx;
  info.hasDockerfile = existsSync(join(root, 'Dockerfile'));
  info.hasAgentsMd = existsSync(join(root, 'AGENTS.md'));
}

export function createDetectTools(server: McpServer, guard: AllowlistGuard, rootDir: string): void {
  server.registerTool(
    PROJECT_TOOL_NAMES.DETECT_STACK,
    {
      title: 'Detect Stack',
      description: 'Detect tech stack of project (npm/bun/cargo/go/etc). Call at start of new project session.',
      inputSchema: z.object({
        project_root: z.string().optional().describe('Project root path'),
      }),
    },
    async ({ project_root }) => {
      const root = project_root ? resolve(project_root) : rootDir;
      guard.validate(root);

      const info = createStackInfo();
      const ctx: StackDetectorContext = { root, info };
      detectPackageManager(ctx);
      detectFrameworksAndTest(ctx);
      detectTypeScript(ctx);
      detectDockerAndAgentsMd(ctx);

      return successResult(JSON.stringify(info, null, 2));
    }
  );

  server.registerTool(
    PROJECT_TOOL_NAMES.FIND_CONFIG_FILES,
    {
      title: 'Find Config Files',
      description: 'Find configuration files in project.',
      inputSchema: z.object({
        project_root: z.string().optional().describe('Project root path'),
        type: z.enum(Object.values(CONFIG_FILE_TYPES)).optional().default(CONFIG_FILE_TYPES.ALL).describe('Type of config files to find'),
      }),
    },
    async ({ project_root, type = CONFIG_FILE_TYPES.ALL }) => {
      const root = project_root ? resolve(project_root) : rootDir;
      guard.validate(root);

      const configs: Record<string, string[]> = {};

      if (type === CONFIG_FILE_TYPES.ALL || type === CONFIG_FILE_TYPES.ESLINT) {
        const eslint = await glob('**/.eslintrc*', { cwd: root, absolute: true });
        const eslintrc = await glob('**/eslint.config.*', { cwd: root, absolute: true });
        configs.eslint = [...eslint, ...eslintrc];
      }

      if (type === CONFIG_FILE_TYPES.ALL || type === CONFIG_FILE_TYPES.PRETTIER) {
        const prettier = await glob('**/.prettierrc*', { cwd: root, absolute: true });
        configs.prettier = prettier;
      }

      if (type === CONFIG_FILE_TYPES.ALL || type === CONFIG_FILE_TYPES.TSCONFIG) {
        const tsconfig = await glob('**/tsconfig*.json', { cwd: root, absolute: true });
        configs.tsconfig = tsconfig;
      }

      if (type === CONFIG_FILE_TYPES.ALL || type === CONFIG_FILE_TYPES.DOCKER) {
        const dockerfile = await glob('**/Dockerfile*', { cwd: root, absolute: true });
        configs.docker = dockerfile;
      }

      if (type === CONFIG_FILE_TYPES.ALL || type === CONFIG_FILE_TYPES.GIT) {
        const gitignore = await glob('**/.gitignore', { cwd: root, absolute: true });
        configs.git = gitignore;
      }

      return successResult(JSON.stringify(configs, null, 2));
    }
  );
}
