# Proyecto 1: mcp-filesystem-pro
## Un servidor MCP de filesystem de nivel producción, publicado en npm

---

**Tipo:** MCP Server + npm package  
**Portafolio cubre:** Punto 1 — MCP servers / open-source tooling  
**Dificultad:** Media  
**Duración estimada:** 10-14 días  
**Repositorio:** `github.com/[tu-usuario]/mcp-filesystem-pro`  
**npm:** `npm install -g mcp-filesystem-pro`

---

## 1. Problema Que Resuelve

El MCP server oficial de Anthropic para filesystem (`@modelcontextprotocol/server-filesystem`) existe pero es básico: solo hace `read_file`, `write_file`, `list_directory`. En uso real con Claude Code y NSP-ANT, un agente de código necesita:

- Aplicar diffs (no reescribir archivos completos)
- Buscar texto con regex dentro de archivos
- Operaciones git básicas (status, diff, log, add, commit)
- Leer múltiples archivos en una sola llamada
- Operaciones de proyecto (encontrar config files, detectar stack tecnológico)

`mcp-filesystem-pro` es el servidor MCP que los desarrolladores de agentes realmente quieren usar.

---

## 2. Qué Construyes

Un servidor MCP en TypeScript con 18 herramientas organizadas en 4 módulos:

### Módulo A: Filesystem
| Tool | Descripción |
|------|-------------|
| `read_file` | Lee un archivo. Soporta rangos de líneas: `read_file(path, startLine=10, endLine=50)` |
| `read_files` | Lee múltiples archivos en una sola llamada. Retorna un objeto `{path: content}` |
| `write_file` | Escribe contenido completo. Solo para archivos nuevos |
| `apply_diff` | Aplica un unified diff a un archivo existente. **La herramienta más importante** |
| `delete_file` | Borra un archivo. Requiere confirmación (campo `confirm: true` obligatorio) |
| `list_dir` | Lista directorio con metadata (tamaño, fecha, tipo) |
| `find_files` | Encuentra archivos por patrón glob o nombre |
| `search_text` | Busca texto/regex dentro de archivos con contexto de N líneas |

### Módulo B: Git
| Tool | Descripción |
|------|-------------|
| `git_status` | Estado del repositorio (staged, unstaged, untracked) |
| `git_diff` | Diff del working tree o entre commits |
| `git_log` | Historial de commits con formato configurable |
| `git_add` | Staging de archivos |
| `git_commit` | Crear commit con mensaje |
| `git_branch` | Listar, crear o cambiar branches |

### Módulo C: Proyecto
| Tool | Descripción |
|------|-------------|
| `detect_stack` | Detecta el stack tecnológico del proyecto (lee package.json, Cargo.toml, etc.) |
| `read_agents_md` | Lee y parsea el AGENTS.md del proyecto si existe |
| `project_summary` | Genera un resumen del proyecto (estructura, stack, convenciones) |
| `find_config_files` | Encuentra archivos de configuración relevantes |

---

## 3. Stack Técnico

```
Runtime:      Bun (más rápido que Node para scripts de larga duración)
Lenguaje:     TypeScript 5.x con strict mode
MCP SDK:      @modelcontextprotocol/sdk ^1.0
Git:          simple-git ^3.x (wrapper TypeScript de git)
Diff:         diff ^7.x (para validar y aplicar diffs)
Testing:      Bun test (nativo)
Build:        bun build + tsup para distribución
Publicación:  npm + npx support
CI:           GitHub Actions
```

**Por qué Bun en lugar de Node:**
- `bun run` es 3x más rápido que `node` para scripts
- `bun install` es 10x más rápido que `npm install`
- Compatible con el ecosistema npm completamente
- El MCP server corre como proceso largo — Bun tiene mejor gestión de memoria

---

## 4. Arquitectura del Servidor

```
mcp-filesystem-pro/
├── src/
│   ├── index.ts                  ← Entry point: inicializa el servidor MCP
│   ├── server.ts                 ← Configuración del McpServer
│   ├── modules/
│   │   ├── filesystem/
│   │   │   ├── index.ts          ← Exports del módulo
│   │   │   ├── read.ts           ← read_file, read_files
│   │   │   ├── write.ts          ← write_file, apply_diff
│   │   │   ├── delete.ts         ← delete_file
│   │   │   ├── search.ts         ← find_files, search_text
│   │   │   └── list.ts           ← list_dir
│   │   ├── git/
│   │   │   ├── index.ts
│   │   │   ├── status.ts         ← git_status, git_diff
│   │   │   ├── history.ts        ← git_log
│   │   │   └── operations.ts     ← git_add, git_commit, git_branch
│   │   └── project/
│   │       ├── index.ts
│   │       ├── detect.ts         ← detect_stack, find_config_files
│   │       ├── summary.ts        ← project_summary
│   │       └── agents-md.ts      ← read_agents_md
│   ├── security/
│   │   ├── allowlist.ts          ← Validación de paths permitidos
│   │   └── sanitize.ts           ← Sanitización de inputs
│   ├── types/
│   │   └── index.ts              ← Tipos compartidos
│   └── utils/
│       ├── diff.ts               ← Helpers para diffs
│       ├── tokens.ts             ← Estimación de tokens
│       └── logger.ts             ← Logging estructurado
├── tests/
│   ├── filesystem.test.ts
│   ├── git.test.ts
│   └── security.test.ts
├── docs/
│   ├── TOOLS.md                  ← Documentación de cada tool
│   └── SECURITY.md               ← Modelo de seguridad
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

---

## 5. Implementación Detallada

### 5.1 Entry Point (src/index.ts)

```typescript
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createFilesystemModule } from './modules/filesystem/index.js';
import { createGitModule } from './modules/git/index.js';
import { createProjectModule } from './modules/project/index.js';
import { AllowlistGuard } from './security/allowlist.js';

async function main() {
  // El directorio raíz permitido se pasa como argumento
  // Ejemplo: mcp-filesystem-pro /home/user/myproject
  const rootDir = process.argv[2] ?? process.cwd();

  const guard = new AllowlistGuard([rootDir]);

  const server = new Server(
    { name: 'mcp-filesystem-pro', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Registrar todos los módulos
  createFilesystemModule(server, guard);
  createGitModule(server, guard, rootDir);
  createProjectModule(server, guard, rootDir);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### 5.2 La Herramienta Más Importante: apply_diff

```typescript
// src/modules/filesystem/write.ts

import { readFileSync, writeFileSync } from 'fs';
import { applyPatch } from 'diff';

server.tool(
  'apply_diff',
  'Aplica un unified diff a un archivo existente. Usa esto para modificar archivos, nunca write_file completo.',
  {
    file_path: z.string().describe('Path absoluto al archivo'),
    unified_diff: z.string().describe(
      'Diff en formato unified (diff -u). Debe incluir headers --- y +++ y al menos 3 líneas de contexto'
    ),
    reason: z.string().max(200).describe('Por qué se hace este cambio (para el log)'),
    dry_run: z.boolean().optional().default(false).describe(
      'Si true, valida el diff pero no lo aplica. Útil para verificar antes de escribir.'
    ),
  },
  async ({ file_path, unified_diff, reason, dry_run }) => {
    guard.validate(file_path);

    const original = readFileSync(file_path, 'utf-8');
    const result = applyPatch(original, unified_diff);

    if (result === false) {
      return {
        content: [{ type: 'text', text: `ERROR: El diff no se puede aplicar al archivo actual. El archivo pudo haber cambiado desde que se generó el diff. Por favor, lee el archivo nuevamente y regenera el diff.` }],
        isError: true,
      };
    }

    if (dry_run) {
      // Contar líneas añadidas y eliminadas
      const added = (unified_diff.match(/^\+[^+]/gm) ?? []).length;
      const removed = (unified_diff.match(/^-[^-]/gm) ?? []).length;
      return {
        content: [{ type: 'text', text: `DRY RUN OK: El diff es válido. +${added} líneas, -${removed} líneas. Llama de nuevo con dry_run=false para aplicar.` }],
      };
    }

    writeFileSync(file_path, result, 'utf-8');
    logger.info({ file_path, reason, operation: 'apply_diff' });

    return {
      content: [{ type: 'text', text: `✅ Diff aplicado exitosamente a ${file_path}. Razón: ${reason}` }],
    };
  }
);
```

### 5.3 Seguridad: Allowlist Guard

```typescript
// src/security/allowlist.ts

import { resolve, relative } from 'path';

export class AllowlistGuard {
  private allowedRoots: string[];

  constructor(allowedRoots: string[]) {
    this.allowedRoots = allowedRoots.map(r => resolve(r));
  }

  validate(filePath: string): void {
    const resolved = resolve(filePath);

    const isAllowed = this.allowedRoots.some(root => {
      const rel = relative(root, resolved);
      // El path no debe empezar con '..' (path traversal)
      return !rel.startsWith('..') && !require('path').isAbsolute(rel);
    });

    if (!isAllowed) {
      throw new Error(
        `SECURITY: Path "${filePath}" está fuera del directorio permitido. ` +
        `Raíces permitidas: ${this.allowedRoots.join(', ')}`
      );
    }

    // Bloquear paths sospechosos
    const suspicious = ['/etc/', '/root/', '~/.ssh/', '.env'];
    if (suspicious.some(p => resolved.includes(p))) {
      throw new Error(`SECURITY: Path "${filePath}" contiene una ubicación sospechosa.`);
    }
  }
}
```

### 5.4 detect_stack (La Herramienta Más Útil Para Agentes)

```typescript
// src/modules/project/detect.ts

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
  'Detecta automáticamente el stack tecnológico del proyecto. Llama esto al inicio de una sesión en un proyecto nuevo.',
  { project_root: z.string().optional() },
  async ({ project_root }) => {
    const root = project_root ? resolve(project_root) : rootDir;
    guard.validate(root);

    const info: StackInfo = await analyzeProject(root);
    return {
      content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
    };
  }
);
```

---

## 6. Configuración en Claude Code / NSP-ANT

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "filesystem-pro": {
      "command": "npx",
      "args": [
        "mcp-filesystem-pro",
        "/path/to/your/project"
      ]
    }
  }
}
```

```toml
# nsp-ant.toml (integración con NSP-ANT)
[[mcp_servers]]
name = "filesystem-pro"
command = "mcp-filesystem-pro"
args = ["${project_root}"]
startup_timeout_ms = 3000
```

---

## 7. Testing

### Tests Unitarios (Bun test)

```typescript
// tests/filesystem.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { tmpdir } from 'os';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('apply_diff', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mcp-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true });
  });

  it('applies a valid unified diff', async () => {
    const filePath = join(tmpDir, 'test.ts');
    writeFileSync(filePath, 'function hello() {\n  return "world";\n}\n');

    const diff = `--- a/test.ts\n+++ b/test.ts\n@@ -1,3 +1,3 @@\n function hello() {\n-  return "world";\n+  return "universe";\n }\n`;

    // Llamar a la tool y verificar que el archivo fue modificado
    const result = readFileSync(filePath, 'utf-8');
    expect(result).toContain('universe');
  });

  it('returns error when diff does not apply', async () => {
    // Test que el mensaje de error es claro y accionable
  });

  it('blocks path traversal attempts', () => {
    expect(() => guard.validate('/etc/passwd')).toThrow('SECURITY');
    expect(() => guard.validate('../../../etc/passwd')).toThrow('SECURITY');
  });
});
```

### Tests de Integración con Claude Code

```bash
# Ejecutar el servidor y verificar que Claude Code puede conectarse
bunx @modelcontextprotocol/inspector mcp-filesystem-pro /tmp/test-project

# El inspector muestra todas las tools y permite probarlas manualmente
```

---

## 8. README del Repositorio (Lo Que Verán en GitHub)

El README del repositorio público debe incluir:

```markdown
# mcp-filesystem-pro

> Production-grade MCP server for filesystem and git operations.
> 18 tools for AI agents that actually need to work with code.

## Why not the official server?

The official `@modelcontextprotocol/server-filesystem` is too basic for real agent use:
- No diff support (overwrites entire files)
- No git operations
- No project analysis

mcp-filesystem-pro gives agents the tools they actually need.

## Quick Start

\`\`\`bash
npx mcp-filesystem-pro /path/to/project
\`\`\`

## Tools (18 total)
[table of all 18 tools]

## Security Model
- All paths validated against configured root directory
- Path traversal attacks blocked
- Git operations scoped to project root
- No network access

## Used in Production
- [NSP-ANT](link) — local AI agent infrastructure
```

---

## 9. Referencias Validadas

### Documentación Oficial MCP

| Recurso | URL | Para qué |
|---------|-----|----------|
| MCP Specification | https://spec.modelcontextprotocol.io | Entender el protocolo completo |
| MCP TypeScript SDK | https://github.com/modelcontextprotocol/typescript-sdk | SDK que usamos |
| MCP Inspector | https://github.com/modelcontextprotocol/inspector | Debuggear el servidor |
| MCP Servers (referencia oficial) | https://github.com/modelcontextprotocol/servers | Ver el servidor filesystem oficial |

### Servidores MCP de Referencia en GitHub

| Repositorio | Estrellas | Qué aprender |
|------------|-----------|--------------|
| https://github.com/modelcontextprotocol/servers | 14k+ | Estructura oficial de MCP servers |
| https://github.com/punkpeye/awesome-mcp-servers | 8k+ | Catálogo de todos los MCP servers |
| https://github.com/wong2/awesome-mcp-servers | 3k+ | Más ejemplos de MCP servers |
| https://github.com/upstash/mcp-server | 500+ | Ejemplo de MCP server con Redis |
| https://github.com/github/github-mcp-server | 5k+ | MCP server de GitHub (referencia) |

### Librerías que Usamos

| Librería | URL | Para qué |
|----------|-----|----------|
| simple-git | https://github.com/steveukzx/simple-git | Operaciones git en TypeScript |
| diff | https://github.com/kpdecker/jsdiff | Aplicar unified diffs |
| zod | https://github.com/colinhacks/zod | Validación de schemas de tools |
| glob | https://github.com/isaacs/node-glob | Búsqueda de archivos por patrón |

### Artículos de Referencia

| Artículo | URL | Por qué leerlo |
|----------|-----|----------------|
| Anthropic: Build MCP servers | https://www.anthropic.com/news/model-context-protocol | Introducción oficial al protocolo |
| MCP Quickstart | https://modelcontextprotocol.io/quickstart/server | Tutorial oficial para crear tu primer server |
| Building MCP servers with TypeScript | https://modelcontextprotocol.io/tutorials/building-a-server | Tutorial completo |

---

## 10. Comandos de Desarrollo

```bash
# Setup inicial
git clone github.com/[tu-usuario]/mcp-filesystem-pro
cd mcp-filesystem-pro
bun install

# Desarrollo
bun run dev                    # Inicia el servidor en modo watch
bun test                       # Ejecuta todos los tests
bun test --watch               # Tests en modo watch

# Debug con MCP Inspector
bun run inspector              # Abre el inspector visual para debuggear tools

# Build y publicación
bun run build                  # Compila TypeScript
bun run build:check            # Verifica tipos sin compilar
npm version patch              # Incrementa versión
npm publish                    # Publica en npm (requiere estar logueado)

# Probar localmente antes de publicar
npm pack                       # Crea .tgz para probar
npm install -g ./mcp-filesystem-pro-1.0.0.tgz
mcp-filesystem-pro /tmp/test
```

---

## 11. Pasos de Publicación en npm

```bash
# 1. Verificar que el package.json está correcto
cat package.json
# Debe tener: "bin": { "mcp-filesystem-pro": "./dist/index.js" }
# Y: "files": ["dist/", "README.md"]

# 2. Login en npm
npm login

# 3. Publicar
npm publish --access=public

# 4. Verificar que funciona
npx mcp-filesystem-pro --version
```

**package.json mínimo:**
```json
{
  "name": "mcp-filesystem-pro",
  "version": "1.0.0",
  "description": "Production-grade MCP server for filesystem and git operations",
  "bin": {
    "mcp-filesystem-pro": "./dist/index.js"
  },
  "files": ["dist/", "README.md", "SECURITY.md"],
  "keywords": ["mcp", "model-context-protocol", "claude", "ai-agent", "filesystem"],
  "license": "MIT",
  "engines": { "node": ">=20" }
}
```

---

## 12. Criterio de Completitud

El proyecto está completo cuando:

- [ ] Los 18 tools están implementados y testeados
- [ ] `bun test` pasa con 0 fallos
- [ ] `apply_diff` maneja correctamente diffs inválidos (mensaje de error accionable)
- [ ] El AllowlistGuard bloquea path traversal en todos los casos
- [ ] README tiene quick start, tabla de tools, y modelo de seguridad
- [ ] Publicado en npm (`npm install -g mcp-filesystem-pro` funciona)
- [ ] Probado con Claude Code real en un proyecto TypeScript
- [ ] Al menos 1 issue o PR abierto por la comunidad (indica adopción real)
- [ ] GitHub Actions: CI pasa en cada PR

---

## 13. Valor Para el Portafolio

Al publicar este proyecto, el portafolio demuestra:

1. **Conocimiento del ecosistema MCP** — No solo usé el servidor oficial, construí uno mejor
2. **Producción real** — Publicado en npm, instalable en un comando
3. **Seguridad** — AllowlistGuard documenta pensamiento de seguridad
4. **Testing** — Suite de tests visible en GitHub
5. **Open source** — Contributions externas son evidencia de adopción

**Frase para LinkedIn/CV:** "Built and published `mcp-filesystem-pro`, a production-grade MCP server with 18 tools (filesystem + git + project analysis), used in NSP-ANT and publicly available on npm."
