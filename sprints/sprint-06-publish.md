# Sprint 6 — Publish & CI/CD

**Duration:** 2026-06-02 to 2026-06-08 (1 week)
**Capacity:** 1 agent
**Goal:** Published to npm + GitHub Actions

---

## Tasks

### T6.1: Build Configuration
- [ ] Verify tsconfig.json correct for build
- [ ] Create build script (bun run build)
- [ ] Verify dist/ output correctly

### T6.2: npm Package Setup
- [ ] Verify package.json has correct bin entry
- [ ] Verify files array (dist/, README.md, SECURITY.md)
- [ ] Test local pack: `npm pack`
- [ ] Test local install: `npm install -g ./mcp-filesystem-pro-*.tgz`

### T6.3: GitHub Repository
- [ ] Create GitHub repo (github.com/[user]/mcp-filesystem-pro)
- [ ] Push initial commit
- [ ] Create .gitignore (node_modules, dist, *.tgz)

### T6.4: GitHub Actions CI
- [ ] Create .github/workflows/ci.yml
- [ ] Lint + typecheck on PR
- [ ] `bun test` on PR
- [ ] Verify CI passes on first PR

### T6.5: npm Publish
- [ ] Login to npm
- [ ] Run `npm publish --access=public`
- [ ] Verify package appears on npm
- [ ] Test: `npx mcp-filesystem-pro --version`

### T6.6: Post-Publish
- [ ] Verify README.md on npm page
- [ ] Add GitHub Actions badge to README
- [ ] Create first release on GitHub

---

## Dependencies
- Sprint 5 complete (tests pass, docs done)

## Files to Create
```
.github/workflows/ci.yml
.gitignore
```

## Package.json Requirements
```json
{
  "name": "mcp-filesystem-pro",
  "version": "1.0.0",
  "bin": { "mcp-filesystem-pro": "./dist/index.js" },
  "files": ["dist/", "README.md", "SECURITY.md"],
  "keywords": ["mcp", "model-context-protocol", "claude", "ai-agent", "filesystem"]
}
```

## Acceptance Criteria
- [ ] `npm publish --access=public` succeeds
- [ ] `npx mcp-filesystem-pro --version` works
- [ ] GitHub Actions CI green on main
- [ ] README.md on npm page looks good
- [ ] GitHub repo created with CI

## Agent
@project-manager

## Notes
- Claim 'mcp-filesystem-pro' name early on npm
- Use conventional commits (feat:, fix:, docs:)
- Keep version in package.json only