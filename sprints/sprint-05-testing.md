# Sprint 5 — Testing & Documentation

**Duration:** 2026-05-26 to 2026-06-01 (1 week)
**Capacity:** 1 agent (qa-engineer focus)
**Goal:** Full test coverage + documentation

---

## Tasks

### T5.1: Unit Tests - Filesystem
- [ ] Create tests/filesystem.test.ts
- [ ] Test read_file with line ranges
- [ ] Test read_files multi-file
- [ ] Test write_file new file only
- [ ] Test apply_diff valid and invalid diffs
- [ ] Test delete_file with confirm
- [ ] Test list_dir metadata
- [ ] Test find_files glob patterns
- [ ] Test search_text regex

### T5.2: Unit Tests - Git
- [ ] Create tests/git.test.ts
- [ ] Test git_status output format
- [ ] Test git_diff staged/unstaged
- [ ] Test git_log format
- [ ] Test git_add / git_commit
- [ ] Test git_branch list/create

### T5.3: Unit Tests - Security
- [ ] Create tests/security.test.ts
- [ ] Test AllowlistGuard blocks /etc/passwd
- [ ] Test AllowlistGuard blocks path traversal
- [ ] Test AllowlistGuard blocks ~/.ssh
- [ ] Test AllowlistGuard blocks .env

### T5.4: Documentation
- [ ] Create docs/TOOLS.md (all 18 tools documented)
- [ ] Create docs/SECURITY.md (security model)
- [ ] Create README.md

### T5.5: Test Verification
- [ ] Run `bun test` — all must pass
- [ ] Verify 0 failures
- [ ] Coverage check (target: 80%+)

---

## Dependencies
- Sprint 4 complete (all modules implemented)

## Files to Create
```
tests/filesystem.test.ts
tests/git.test.ts
tests/security.test.ts
docs/TOOLS.md
docs/SECURITY.md
README.md
```

## Acceptance Criteria
- [ ] `bun test` passes with 0 failures
- [ ] All tools have tests
- [ ] AllowlistGuard security tests pass
- [ ] docs/TOOLS.md has all 18 tools
- [ ] README.md has quick start + tools table

## Agent
@qa-engineer

## Notes
- Use Bun test (bun:test)
- beforeEach/afterEach for cleanup
- tmpdir for file operations
- Mock git where needed