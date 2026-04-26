# Sprint 1 Plan — mcp-filesystem-pro

**Duration:** 2026-04-28 to 2026-05-09 (2 weeks)
**Capacity:** 1 agent × 10 days
**Goal:** Publish `mcp-filesystem-pro` to npm with 18 tools

---

## Critical Path

```
T1: Foundation → T2: Core FS Tools → T3: Git Module → T4: Project Module + Tests → T5: Publish
Day 1-2          Day 3-5               Day 6-8           Day 9-11                Day 12-14
```

## Phase 1: Foundation (Day 1-2)
**Agent:** @backend-dev
**Files:** `package.json`, `tsconfig.json`, `bunfig.toml`, `src/index.ts`, `src/server.ts`
**Depends on:** None
**Acceptance criteria:**
- [ ] `bun install` succeeds
- [ ] `bun run dev` starts MCP server
- [ ] Server responds to `initialize` handshake

## Phase 2: Filesystem Module (Day 3-5)
**Agent:** @backend-dev
**Files:** `src/modules/filesystem/*.ts`, `src/security/allowlist.ts`, `src/utils/*`
**Depends on:** Phase 1
**Acceptance criteria:**
- [ ] 8 tools: read_file, read_files, write_file, apply_diff, delete_file, list_dir, find_files, search_text
- [ ] AllowlistGuard blocks path traversal
- [ ] `apply_diff` handles conflicts with clear error

## Phase 3: Git Module (Day 6-8)
**Agent:** @backend-dev
**Files:** `src/modules/git/*.ts`
**Depends on:** Phase 2
**Acceptance criteria:**
- [ ] 6 tools: git_status, git_diff, git_log, git_add, git_commit, git_branch

## Phase 4: Project Module + Tests (Day 9-11)
**Agent:** @qa-engineer
**Files:** `src/modules/project/*.ts`, `tests/*.test.ts`, `docs/TOOLS.md`
**Depends on:** Phase 3
**Acceptance criteria:**
- [ ] 4 tools: detect_stack, project_summary, find_config_files, read_agents_md
- [ ] `bun test` passes with 0 failures

## Phase 5: Publish (Day 12-14)
**Agent:** @project-manager
**Depends on:** Phase 4 (all prior AC met)
**Acceptance criteria:**
- [ ] `npm publish --access=public` succeeds
- [ ] `npx mcp-filesystem-pro --version` works
- [ ] README: quick start + tools table + security model

---

## Risks
- MCP SDK breaking changes → pin `^1.0.0`
- npm naming conflict → claim `mcp-filesystem-pro` early
