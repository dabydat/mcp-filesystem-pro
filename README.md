# mcp-filesystem-pro

Production-grade MCP server for filesystem, git, and HTTP operations — 26 tools for AI agents.

[![CI](https://github.com/dabydat/mcp-filesystem-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/dabydat/mcp-filesystem-pro/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/mcp-filesystem-pro.svg)](https://www.npmjs.com/package/mcp-filesystem-pro)

## Overview

mcp-filesystem-pro is a Model Context Protocol server that provides secure filesystem, git, and HTTP operations for AI agents. All operations are scoped to a configured root directory via AllowlistGuard security.

## Quick Start

### Install

```bash
npm install -g mcp-filesystem-pro
```

### Run as MCP Server

```bash
# Run with default /tmp root
mcp-filesystem-pro /tmp

# Run with custom root directory
mcp-filesystem-pro /path/to/project
```

### Docker

```bash
docker run -v /path/to/project:/project ghcr.io/dabydat/mcp-filesystem-pro /project
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpFilesystemPro": {
    "command": "mcp-filesystem-pro",
    "args": ["/path/to/allowed/directory"]
  }
}
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

### HTTP (17 tools)

| Tool | Description |
|------|-------------|
| `http_get` | Make GET request |
| `http_post` | Make POST request |
| `http_put` | Make PUT request |
| `http_delete` | Make DELETE request |
| `http_patch` | Make PATCH request |
| `http_head` | Make HEAD request |
| `http_set_auth_api_key` | Set API key authentication |
| `http_set_auth_bearer` | Set bearer token authentication |
| `http_set_auth_basic` | Set basic authentication |
| `http_clear_auth` | Clear all authentication |
| `http_set_headers` | Set custom headers |
| `http_clear_headers` | Clear custom headers |
| `http_set_timeout` | Set request timeout |
| `http_parse_json` | Parse JSON string |
| `http_parse_text` | Return text as-is |
| `http_get_response_headers` | Get last response headers |
| `http_get_status_code` | Get last status code |
| `http_add_query_param` | Store query parameter |
| `http_validate_url` | Validate URL security |
| `http_add_url_allowlist` | Add URL to allowlist |
| `http_remove_url_allowlist` | Remove URL from allowlist |
| `http_list_allowlist` | List all allowlist patterns |

## Architecture

```
mcp-filesystem-pro/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── server.ts             # MCP server factory
│   ├── modules/
│   │   ├── filesystem/       # 8 tools: read, write, diff, search, list
│   │   ├── git/              # 6 tools: status, diff, log, add, commit, branch
│   │   └── project/          # 4 tools: detect_stack, summary, find_config
│   ├── security/
│   │   └── allowlist.ts      # Path validation + path traversal blocking
│   └── types/                # Result types
├── tests/                    # Bun test suite (75 tests)
└── docs/
    ├── TOOLS.md              # Detailed tool documentation
    └── SECURITY.md            # Security model
```

## Security

**Path Allowlisting:** All file operations are scoped to an allowed root directory. Path traversal attacks (`../..`, symlinks) are blocked.

**Blocked Paths:**
- `/etc/`, `/root/`, `~/.ssh/`
- `.env` files
- `/proc/`, `/sys/`

**Input Sanitization:** All tool inputs are validated against the allowlist before any filesystem operation.

See [docs/SECURITY.md](docs/SECURITY.md) for details.

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run build:check

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
