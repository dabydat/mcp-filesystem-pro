# Tools Documentation — mcp-filesystem-pro

18 tools across 3 modules.

## Filesystem Module (8 tools)

### read_file

Read a single file with optional line range.

**Parameters:**
- `path` (string, required): Absolute path
- `startLine` (number, optional): Start line (1-indexed)
- `endLine` (number, optional): End line (inclusive)

**Example:**
```
read_file("/path/to/file.ts", startLine=10, endLine=50)
```

---

### read_files

Read multiple files in one call.

**Parameters:**
- `paths` (string[], required): Array of absolute paths

**Example:**
```
read_files(["/path/a.ts", "/path/b.ts"])
```

---

### write_file

Write content to a NEW file only.

**Parameters:**
- `path` (string, required): Absolute path
- `content` (string, required): Content to write

**Note:** Use `apply_diff` for existing files.

---

### apply_diff

Apply a unified diff to an existing file.

**Parameters:**
- `path` (string, required): Absolute path
- `unified_diff` (string, required): Diff in unified format
- `reason` (string, required): Why this change
- `dry_run` (boolean, optional): Validate without applying

---

### delete_file

Delete a file. Requires `confirm: true`.

**Parameters:**
- `path` (string, required): Absolute path
- `confirm` (literal true, required): Must be true to confirm

---

### list_dir

List directory with metadata (size, date, type).

**Parameters:**
- `path` (string, optional): Directory path (default: project root)
- `include_hidden` (boolean, optional): Include hidden files (default: false)

---

### find_files

Find files by glob pattern.

**Parameters:**
- `pattern` (string, required): Glob pattern (e.g., "*.ts", "**/*.json")
- `root` (string, optional): Root directory to search (default: project root)

---

### search_text

Search text/regex within files with context.

**Parameters:**
- `pattern` (string, required): Regex or text pattern to search
- `path` (string, optional): Directory to search (default: project root)
- `file_pattern` (string, optional): Only search files matching glob (e.g., "*.ts")
- `context_lines` (number, optional): Lines of context around matches (default: 2)
- `max_results` (number, optional): Maximum number of results (default: 50)

---

## Git Module (6 tools)

### git_status

Get repository status.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)

**Returns:** Object with staged, modified, not_added, untracked files

---

### git_diff

Show working tree changes.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)
- `staged` (boolean, optional): Show staged changes (default: false)
- `commit` (string, optional): Show diff for specific commit

---

### git_log

Show commit history.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)
- `max_count` (number, optional): Maximum number of commits (default: 20)
- `format` (string, optional): Format string (default: hash|author email|timestamp|subject)

---

### git_add

Stage files for commit.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)
- `files` (string or string[], required): Files to stage (use "." for all)

---

### git_commit

Create commit with message.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)
- `message` (string, required): Commit message

---

### git_branch

List, create, switch, or delete branches.

**Parameters:**
- `path` (string, optional): Repository path (default: project root)
- `action` (enum, optional): Action to perform (list, create, switch, delete)
- `name` (string, optional): Branch name (required for create/switch/delete)

---

## Project Module (4 tools)

### detect_stack

Detect tech stack (npm/bun/cargo/go/etc).

**Parameters:**
- `project_root` (string, optional): Project root path

**Returns:** Object with language, framework, packageManager, testFramework, configFiles, hasDockerfile, hasAgentsMd

---

### find_config_files

Find configuration files in project.

**Parameters:**
- `project_root` (string, optional): Project root path
- `type` (enum, optional): Type of config files (all, eslint, prettier, tsconfig, docker, git)

---

### project_summary

Generate project overview: structure, stack, conventions.

**Parameters:**
- `project_root` (string, optional): Project root path
- `depth` (number, optional): Directory depth to show (default: 2)

---

### read_agents_md

Read and parse AGENTS.md if it exists in the project.

**Parameters:**
- `project_root` (string, optional): Project root path

**Returns:** Object with exists, content, message
