# mcp-filesystem-pro — Spec

**Status:** Draft
**Created:** 2026-04-25
**Pattern:** Modular MCP Server (18 tools across 3 domains)
**Files:** 20+ files across src/modules/filesystem, git, project + tests

---

## 1. Overview

### Problem Statement
The official `@modelcontextprotocol/server-filesystem` is too basic for real AI agent use — no diff support, no git operations, no project analysis.

### Solution Summary
Build and publish `mcp-filesystem-pro`, a production-grade MCP server with 18 tools for filesystem + git + project analysis, installable via `npm install -g`.

---

## 2. Design

### Architecture
```
mcp-filesystem-pro/
├── src/
│   ├── index.ts              ← Entry point (bun + stdio)
│   ├── server.ts             ← McpServer config
│   ├── modules/
│   │   ├── filesystem/      ← 8 tools: read, write, diff, search, list
│   │   ├── git/             ← 6 tools: status, diff, log, add, commit, branch
│   │   └── project/         ← 4 tools: detect_stack, summary, find_config, read_agents_md
│   ├── security/
│   │   └── allowlist.ts     ← Path validation + path traversal blocking
│   └── types/index.ts
├── tests/                   ← Bun test suite
└── docs/                    ← TOOLS.md, SECURITY.md
```

### Files to Create/Modify
```
package.json            — name: mcp-filesystem-pro, bin: mcp-filesystem-pro
tsconfig.json          — strict mode, ESM
bunfig.toml            — Bun config
src/index.ts          — Entry: parse args, init AllowlistGuard, connect transport
src/server.ts         — Server config
src/modules/filesystem/index.ts
src/modules/filesystem/read.ts     — read_file, read_files
src/modules/filesystem/write.ts   — write_file, apply_diff
src/modules/filesystem/delete.ts  — delete_file
src/modules/filesystem/search.ts  — find_files, search_text
src/modules/filesystem/list.ts     — list_dir
src/modules/git/index.ts
src/modules/git/status.ts         — git_status, git_diff
src/modules/git/history.ts        — git_log
src/modules/git/operations.ts     — git_add, git_commit, git_branch
src/modules/project/index.ts
src/modules/project/detect.ts     — detect_stack, find_config_files
src/modules/project/summary.ts    — project_summary
src/modules/project/agents-md.ts  — read_agents_md
src/security/allowlist.ts
src/types/index.ts
src/utils/diff.ts
src/utils/tokens.ts
src/utils/logger.ts
tests/filesystem.test.ts
tests/git.test.ts
tests/security.test.ts
docs/TOOLS.md
docs/SECURITY.md
```

---

## 3. Dependencies

### External
- `@modelcontextprotocol/sdk` ^1.0 — MCP protocol
- `simple-git` ^3.x — Git operations
- `diff` ^7.x — Unified diff parsing
- `zod` — Tool schema validation
- `glob` — File pattern matching

---

## 4. Acceptance Criteria

- [ ] `bun install` succeeds
- [ ] `bun run dev` starts MCP server and passes handshake
- [ ] `apply_diff` applies valid unified diffs; returns clear error on conflict
- [ ] `AllowlistGuard` blocks path traversal (`/etc/passwd`, `../..`)
- [ ] All 8 filesystem tools functional
- [ ] All 6 git tools functional
- [ ] All 4 project tools functional
- [ ] `detect_stack` identifies npm/Bun/Cargo projects correctly
- [ ] `bun test` passes with 0 failures
- [ ] `npm publish --access=public` succeeds
- [ ] README: quick start + tools table + security model

---

## 5. Dev Commands

```bash
bun install
bun run dev          # watch mode
bun test             # run tests
bun run inspector    # MCP inspector GUI
bun run build        # compile TypeScript
npm publish          # publish to npm
```
