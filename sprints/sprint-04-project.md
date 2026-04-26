# Sprint 4 — Project Module (4 tools)

**Duration:** 2026-05-19 to 2026-05-25 (1 week)
**Capacity:** 1 agent
**Goal:** Project analysis tools working

---

## Tasks

### T4.1: Detection
- [ ] Create src/modules/project/detect.ts
  - `detect_stack` — identify tech stack (npm/bun/cargo/etc)
  - `find_config_files` — locate relevant config files

### T4.2: Summary
- [ ] Create src/modules/project/summary.ts
  - `project_summary` — project overview (structure, stack, conventions)

### T4.3: Agents.md Support
- [ ] Create src/modules/project/agents-md.ts
  - `read_agents_md` — parse project AGENTS.md if exists

### T4.4: Module Export
- [ ] Create src/modules/project/index.ts
- [ ] Wire all 4 tools to server

---

## Dependencies
- Sprint 3 complete (git module)

## Tools (4 total)
| Tool | Purpose |
|------|---------|
| detect_stack | Identify tech stack (npm/yarn/bun/cargo/go) |
| find_config_files | Locate config files |
| project_summary | Project overview |
| read_agents_md | Parse AGENTS.md |

## Stack Detection Logic
```typescript
const stackIndicators = {
  npm: ['package.json', 'package-lock.json'],
  yarn: ['yarn.lock'],
  bun: ['bun.lockb'],
  cargo: ['Cargo.toml'],
  go: ['go.mod'],
  python: ['requirements.txt', 'pyproject.toml'],
};
```

## Acceptance Criteria
- [ ] All 4 tools respond correctly
- [ ] detect_stack correctly identifies npm/yarn/bun/cargo/go projects
- [ ] read_agents_md gracefully handles missing file
- [ ] All tools use guard.validate()

## Agent
@backend-dev