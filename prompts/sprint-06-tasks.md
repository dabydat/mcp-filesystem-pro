# Sprint 6 Task Prompts — Publish & CI/CD

**Sprint:** 6 — Publish & CI/CD
**Duration:** 2026-06-02 to 2026-06-08
**Agent:** @project-manager

---

## T6.1: Build Configuration

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. Build configuration.
TASK: Verify build configuration and run build

Verify tsconfig.json and package.json are correct for building.

Run `bun run build` and verify:
- dist/ directory is created
- dist/index.js exists
- dist/index.d.ts exists (TypeScript declarations)
- No TypeScript errors

If build fails, fix the configuration.
```

### Acceptance
- `bun run build` succeeds
- dist/ directory created with correct files

---

## T6.2: npm Package Setup

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. npm package preparation.
TASK: Verify package.json and test local pack

### package.json requirements:
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
  "engines": {
    "node": ">=20"
  }
}
```

1. Verify package.json has correct bin entry
2. Verify files array includes dist/, README.md, SECURITY.md
3. Run `npm pack` to create .tgz
4. Verify mcp-filesystem-pro-*.tgz was created

If package.json needs updates, make them.
```

### Acceptance
- package.json has correct bin entry
- `npm pack` creates .tgz file
- All required files included

---

## T6.3: GitHub Repository

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. GitHub repo setup.
TASK: Create GitHub repository and push code

1. Create .gitignore:
```
node_modules/
dist/
*.tgz
.DS_Store
*.log
```

2. Initialize git if not already:
```bash
git init
git add .
git commit -m "Initial commit: mcp-filesystem-pro"
```

3. Create GitHub repo (manual or via gh cli):
```bash
gh repo create mcp-filesystem-pro --public --push
```

4. Verify push succeeded

If gh CLI not available, provide instructions for manual creation.
```

### Files
- .gitignore (create)

### Acceptance
- GitHub repo created
- Code pushed to main branch

---

## T6.4: GitHub Actions CI

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. CI/CD setup.
TASK: Create GitHub Actions workflow

### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - name: Install
        run: bun install
      - name: Type check
        run: bun run build
      - name: Test
        run: bun test
```

Create this file:
- .github/workflows/ci.yml

Run a test workflow by pushing to main and verify CI passes.
```

### Files
- .github/workflows/ci.yml (create)

### Acceptance
- CI workflow file created
- CI passes on main branch

---

## T6.5: npm Publish

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. npm publication.
TASK: Publish package to npm

1. Login to npm:
```bash
npm login
```

2. Publish package:
```bash
npm publish --access=public
```

3. Verify publication:
```bash
npm view mcp-filesystem-pro
npx mcp-filesystem-pro --version
```

If 'mcp-filesystem-pro' name is taken, rename to something available.

Do NOT proceed if npm login fails — user must provide credentials.
```

### Acceptance
- Package appears on npm
- `npx mcp-filesystem-pro --version` works

---

## T6.6: Post-Publish

### Prompt
```
ROLE: project-manager
CONTEXT: MCP server. Post-publish tasks.
TASK: Complete post-publish checklist

1. Verify README.md looks good on npm page:
   - npm view mcp-filesystem-pro homepage link works

2. Add CI badge to README.md:
   ```markdown
   [![CI](https://github.com/[username]/mcp-filesystem-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/[username]/mcp-filesystem-pro/actions/workflows/ci.yml)
   ```

3. Create GitHub release:
   - Go to GitHub repo → Releases → Draft new release
   - Tag: v1.0.0
   - Title: Initial release
   - Description: mcp-filesystem-pro v1.0.0

4. Verify npx works:
   ```bash
   npx mcp-filesystem-pro --version
   ```

Update README.md with CI badge and release link.
```

### Acceptance
- README.md has CI badge
- GitHub release created
- Package installable via npm