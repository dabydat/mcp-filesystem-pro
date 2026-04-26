# Sprint 2 — Filesystem Module (8 tools)

**Duration:** 2026-05-05 to 2026-05-11 (1 week)
**Capacity:** 1 agent
**Goal:** All filesystem tools implemented

---

## Tasks

### T2.1: Read Operations
- [ ] Create src/modules/filesystem/read.ts
  - `read_file` — single file with line range support
  - `read_files` — multiple files in one call

### T2.2: Write Operations
- [ ] Create src/modules/filesystem/write.ts
  - `write_file` — write new files only
  - `apply_diff` — apply unified diff (CRITICAL tool)

### T2.3: Delete Operations
- [ ] Create src/modules/filesystem/delete.ts
  - `delete_file` — requires confirm:true

### T2.4: Search Operations
- [ ] Create src/modules/filesystem/search.ts
  - `find_files` — glob pattern matching
  - `search_text` — regex search with context lines

### T2.5: List Operations
- [ ] Create src/modules/filesystem/list.ts
  - `list_dir` — directory listing with metadata

### T2.6: Module Export
- [ ] Create src/modules/filesystem/index.ts
- [ ] Wire all 8 tools to server

---

## Dependencies
- Sprint 1 complete (foundation)

## Tools (8 total)
| Tool | Purpose |
|------|---------|
| read_file | Read single file with optional line range |
| read_files | Read multiple files |
| write_file | Write new files |
| apply_diff | Apply unified diff (most important) |
| delete_file | Delete with confirmation |
| list_dir | Directory listing |
| find_files | Glob pattern search |
| search_text | Regex search |

## Acceptance Criteria
- [ ] All 8 tools respond correctly
- [ ] apply_diff handles conflicts with clear error
- [ ] AllowlistGuard blocks path traversal on all tools
- [ ] All tools validated with Bun test

## Agent
@backend-dev