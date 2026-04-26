# mcp-filesystem-pro

Production-grade MCP server for filesystem and git operations — 18 tools for AI agents.

## Quick Start

```bash
# Install
npm install -g mcp-filesystem-pro

# Run as MCP server (stdio mode)
mcp-filesystem-pro

# Start in dev mode with inspector
bun run dev
```

## Architecture

```
mcp-filesystem-pro/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── server.ts             # MCP server factory
│   ├── modules/
│   │   ├── filesystem/      # 8 tools: read, write, diff, search, list
│   │   ├── git/             # 6 tools: status, diff, log, add, commit, branch
│   │   └── project/         # 4 tools: detect_stack, summary, find_config, read_agents_md
│   ├── security/
│   │   └── allowlist.ts     # Path validation + path traversal blocking
│   └── types/index.ts
├── tests/                    # Bun test suite
└── docs/
    ├── TOOLS.md              # Detailed tool documentation
    └── SECURITY.md           # Security model
```

## Tools

### Filesystem (8 tools)

| Tool | Description |
|------|-------------|
| `read_file` | Read single file with UTF-8 decode |
| `read_files` | Read multiple files in one call |
| `write_file` | Create/update file with content |
| `apply_diff` | Apply unified diff to file |
| `delete_file` | Delete file or directory |
| `find_files` | Glob pattern file search |
| `search_text` | Grep-like content search |
| `list_dir` | Directory listing with metadata |

### Git (6 tools)

| Tool | Description |
|------|-------------|
| `git_status` | Working tree status |
| `git_diff` | File/directory diff |
| `git_log` | Commit history |
| `git_add` | Stage files |
| `git_commit` | Create commit |
| `git_branch` | List/create/delete branches |

### Project (4 tools)

| Tool | Description |
|------|-------------|
| `detect_stack` | Identify tech stack (npm/Bun/Cargo/etc) |
| `find_config_files` | Locate project configuration files |
| `project_summary` | Project overview and statistics |
| `read_agents_md` | Parse .claude/AGENTS.md |

## Security

**Path Allowlisting:** All file operations are scoped to an allowed root directory. Path traversal attacks (`../..`, symlinks) are blocked.

**Input Sanitization:** All tool inputs are validated against the allowlist before any filesystem operation.

See [docs/SECURITY.md](docs/SECURITY.md) for details.

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Dev mode (watch)
bun run dev

# Inspector
bun run inspector
```

## Requirements

- Node.js >= 20.0.0
- Bun >= 1.0.0 (recommended) or npm

## License

MIT