# Sprint 3 — Git Module (6 tools)

**Duration:** 2026-05-12 to 2026-05-18 (1 week)
**Capacity:** 1 agent
**Goal:** All git operations working

---

## Tasks

### T3.1: Status Operations
- [ ] Create src/modules/git/status.ts
  - `git_status` — staged, unstaged, untracked
  - `git_diff` — working tree diff

### T3.2: History Operations
- [ ] Create src/modules/git/history.ts
  - `git_log` — commit history with configurable format

### T3.3: Operations
- [ ] Create src/modules/git/operations.ts
  - `git_add` — stage files
  - `git_commit` — create commit with message
  - `git_branch` — list, create, switch branches

### T3.4: Module Export
- [ ] Create src/modules/git/index.ts
- [ ] Wire all 6 tools to server
- [ ] All git ops scoped to project root via AllowlistGuard

---

## Dependencies
- Sprint 2 complete (filesystem module)

## Tools (6 total)
| Tool | Purpose |
|------|---------|
| git_status | Repository status (staged/unstaged/untracked) |
| git_diff | Working tree diff |
| git_log | Commit history |
| git_add | Stage files |
| git_commit | Create commit |
| git_branch | Branch operations |

## Dependencies
- simple-git ^3.x
- AllowlistGuard for path scoping

## Acceptance Criteria
- [ ] All 6 tools respond correctly
- [ ] Git operations scoped to project root
- [ ] Clear error messages on git failures
- [ ] Test with real git repository

## Agent
@backend-dev

## Notes
- simple-git handles all git operations
- No direct git CLI calls
- Guard.validate() on all file paths