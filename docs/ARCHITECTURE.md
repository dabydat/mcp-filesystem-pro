# Architecture Documentation

This document describes the system architecture of mcp-filesystem-pro, a production-grade MCP server for filesystem, git, project analysis, and HTTP operations.

---

## 1. System Architecture Diagram

The MCP server follows a modular architecture with a central server that orchestrates multiple tool modules.

```mermaid
flowchart TB
    subgraph Entry["Entry Point (index.ts)"]
        CLI["CLI Arguments<br/>/root/dir, --help, --version"]
    end

    subgraph Core["Core Server"]
        Server["McpServer<br/>(SDK)"]
        Transport["StdioServerTransport<br/>(stdio)"]
    end

    subgraph Security["Security Layer"]
        Guard["AllowlistGuard"]
        SUSP["SUSPICIOUS_PATHS<br/>/etc/, /root/, ~/.ssh/, .env"]
    end

    subgraph Modules["Tool Modules"]
        FsMod["Filesystem Module"]
        GitMod["Git Module"]
        ProjMod["Project Module"]
        HttpMod["HTTP Module"]
    end

    CLI --> Server
    Server --> Transport

    Server --> Guard
    Guard --> SUSP

    Server --> FsMod
    Server --> GitMod
    Server --> ProjMod
    Server --> HttpMod

    subgraph FsTools["Filesystem Tools"]
        read["read_file"]
        reads["read_files"]
        write["write_file"]
        diff["apply_diff"]
        delete["delete_file"]
        list["list_dir"]
        find["find_files"]
        search["search_text"]
    end

    subgraph GitTools["Git Tools"]
        status["git_status"]
        diffg["git_diff"]
        log["git_log"]
        add["git_add"]
        commit["git_commit"]
        branch["git_branch"]
    end

    subgraph ProjTools["Project Tools"]
        detect["detect_stack"]
        configs["find_config_files"]
        summary["project_summary"]
        agents["read_agents_md"]
    end

    subgraph HttpTools["HTTP Tools"]
        get["http_get"]
        post["http_post"]
        put["http_put"]
        del["http_delete"]
        patch["http_patch"]
        head["http_head"]
        auth["http_set_auth_*"]
        headers["http_set_headers"]
        parse["http_parse_*"]
        allow["http_validate_url"]
    end

    FsMod --> FsTools
    GitMod --> GitTools
    ProjMod --> ProjTools
    HttpMod --> HttpTools
```

**Description:**
- The entry point parses CLI arguments and creates the server
- The `McpServer` from the SDK handles tool registration and request routing
- `StdioServerTransport` communicates via stdin/stdout (standard MCP protocol)
- `AllowlistGuard` validates all file paths before operations
- Four modules register their tools with the server
- Each module exposes multiple tools (18 tools total)

---

## 2. Tool Module Architecture

Each module follows a factory pattern: `create[Module]Module(server, guard, rootDir)` registers all tools for that domain.

### 2.1 Filesystem Module

```mermaid
flowchart LR
    FsIndex["filesystem/index.ts"]
    subgraph Files["Tool Implementations"]
        read["read.ts<br/>read_file, read_files"]
        write["write.ts<br/>write_file, apply_diff"]
        delete["delete.ts<br/>delete_file"]
        search["search.ts<br/>find_files, search_text"]
        list["list.ts<br/>list_dir"]
    end

    FsIndex --> read
    FsIndex --> write
    FsIndex --> delete
    FsIndex --> search
    FsIndex --> list

    read --> |uses| Guard
    write --> |uses| Guard
    delete --> |uses| Guard
    search --> |uses| Guard
    list --> |uses| Guard
```

**Tools (8):**
- `read_file` - Read single file with optional line range
- `read_files` - Read multiple files in one call
- `write_file` - Write to new file (not overwrite)
- `apply_diff` - Apply unified diff (most important tool)
- `delete_file` - Delete with confirmation required
- `list_dir` - List directory with metadata
- `find_files` - Find by glob pattern
- `search_text` - Regex search with context lines

### 2.2 Git Module

```mermaid
flowchart LR
    GitIndex["git/index.ts"]
    subgraph GitImpl["Tool Implementations"]
        status["status.ts<br/>git_status, git_diff"]
        history["history.ts<br/>git_log"]
        ops["operations.ts<br/>git_add, git_commit, git_branch"]
    end

    GitIndex --> status
    GitIndex --> history
    GitIndex --> ops

    status --> |uses| simple-git
    history --> |uses| simple-git
    ops --> |uses| simple-git

    ops --> |uses| Guard
```

**Tools (6):**
- `git_status` - Repository state (staged, unstaged, untracked)
- `git_diff` - Working tree diff or between commits
- `git_log` - Commit history with configurable format
- `git_add` - Stage files
- `git_commit` - Create commit with message
- `git_branch` - List, create, or switch branches

### 2.3 Project Module

```mermaid
flowchart LR
    ProjIndex["project/index.ts"]
    subgraph ProjImpl["Tool Implementations"]
        detect["detect.ts<br/>detect_stack, find_config_files"]
        summary["summary.ts<br/>project_summary"]
        agents["agents-md.ts<br/>read_agents_md"]
    end

    ProjIndex --> detect
    ProjIndex --> summary
    ProjIndex --> agents

    detect --> |uses| Guard
    summary --> |uses| Guard
    agents --> |uses| Guard
```

**Tools (4):**
- `detect_stack` - Detect technology stack (package.json, Cargo.toml, etc.)
- `find_config_files` - Find relevant configuration files
- `project_summary` - Generate project overview
- `read_agents_md` - Parse AGENTS.md if present

### 2.4 HTTP Module

```mermaid
flowchart TB
    HttpIndex["http/index.ts"]
    HttpClient["http/client.ts<br/>HttpClient class"]
    HttpMethods["http/methods.ts<br/>httpGet, httpPost, etc."]

    HttpIndex --> HttpClient
    HttpIndex --> HttpMethods

    subgraph HttpTools["HTTP Tools"]
        REQ["GET, POST, PUT,<br/>DELETE, PATCH, HEAD"]
        AUTH["set_auth_*<br/>api-key, bearer, basic"]
        HEAD["set_headers,<br/>clear_headers"]
        PARSE["parse_json,<br/>parse_text"]
        SEC["validate_url,<br/>add_url_allowlist"]
    end

    HttpIndex --> REQ
    HttpIndex --> AUTH
    HttpIndex --> HEAD
    HttpIndex --> PARSE
    HttpIndex --> SEC

    REQ --> HttpClient
    AUTH --> HttpClient
    HEAD --> HttpClient
```

**Tools (20+):**
- Request methods: `http_get`, `http_post`, `http_put`, `http_delete`, `http_patch`, `http_head`
- Auth: `http_set_auth_api_key`, `http_set_auth_bearer`, `http_set_auth_basic`, `http_clear_auth`
- Headers: `http_set_headers`, `http_clear_headers`
- Response: `http_parse_json`, `http_parse_text`, `http_get_response_headers`, `http_get_status_code`
- Security: `http_validate_url`, `http_add_url_allowlist`, `http_remove_url_allowlist`, `http_list_allowlist`

---

## 3. Security Flow (AllowlistGuard)

The AllowlistGuard validates all file paths to prevent path traversal attacks.

```mermaid
flowchart TB
    start["Tool Request<br/>file_path: /path/to/file"]
    resolve["resolve(file_path)<br/>Normalize to absolute path"]
    check1{"isPathTraversal?<br/>relative(path, root).startsWith('..')"}
    check2{"containsSuspiciousPath?<br/>/etc/, /root/, etc."}
    allow["Path Allowed<br/>Proceed with operation"]
    block["SECURITY ERROR<br/>Path outside allowed directory"]
    error["SECURITY ERROR<br/>Suspicious path detected"]

    start --> resolve
    resolve --> check1
    check1 --> |No| check2
    check1 --> |Yes| block
    check2 --> |No| allow
    check2 --> |Yes| error
```

**Validation Rules:**
1. Resolve path to absolute form
2. Check path traversal: relative path from root must not start with `..`
3. Check suspicious paths: block `/etc/`, `/root/`, `~/.ssh/`, `.env`, `/proc/`, `/sys/`
4. Throw error with clear message on any violation

**Example validation:**
```
Root: /home/user/project
Input: /home/user/project/src/index.ts -> ALLOWED
Input: /home/user/project/../../../etc/passwd -> BLOCKED (starts with ..)
Input: /etc/passwd -> BLOCKED (suspicious)
```

---

## 4. Request Flow (HTTP Module)

HTTP requests flow through multiple layers with authentication, headers, and security validation.

```mermaid
sequenceDiagram
    participant Client
    participant Server as MCP Server
    participant HttpMod as HTTP Module
    participant HttpClient as HttpClient
    participant Fetch

    Client->>Server: http_get({ url, params })
    Server->>HttpMod: route to tool handler
    HttpMod->HttpClient: get(url, params)
    HttpClient->HttpClient: buildUrl(url, params)
    HttpClient->HttpClient: buildAuthHeader()
    HttpClient->HttpClient: buildRequestHeaders()
    HttpClient->Fetch: fetch(fullUrl, config)
    Fetch-->>HttpClient: Response
    HttpClient-->>HttpMod: HttpResponse
    HttpMod-->>Server: { content: [...] }
    Server-->>Client: ToolResult
```

**Flow Details:**
1. Tool handler receives request with URL and optional params
2. `HttpClient.get()` builds full URL with query parameters
3. Auth header is built based on current auth settings (api-key, bearer, basic)
4. Custom headers and content-type are added
5. Fetch is called with timeout and abort controller
6. Response is parsed (JSON or text) based on content-type
7. Last response is stored for later inspection
8. Result is returned with status code and headers

---

## 5. Project Structure Tree

```
mcp-filesystem-pro/
|
|-- src/
|   |-- index.ts                    # Entry point, CLI handling
|   |-- server.ts                   # Server factory function
|   |
|   |-- modules/
|   |   |-- filesystem/
|   |   |   |-- index.ts           # Module factory
|   |   |   |-- read.ts            # read_file, read_files
|   |   |   |-- write.ts           # write_file, apply_diff
|   |   |   |-- delete.ts          # delete_file
|   |   |   |-- search.ts          # find_files, search_text
|   |   |   |-- list.ts            # list_dir
|   |   |
|   |   |-- git/
|   |   |   |-- index.ts           # Module factory
|   |   |   |-- status.ts          # git_status, git_diff
|   |   |   |-- history.ts         # git_log
|   |   |   |-- operations.ts      # git_add, git_commit, git_branch
|   |   |   |-- git-context.ts
|   |   |
|   |   |-- project/
|   |   |   |-- index.ts           # Module factory
|   |   |   |-- detect.ts          # detect_stack, find_config_files
|   |   |   |-- summary.ts         # project_summary
|   |   |   |-- agents-md.ts       # read_agents_md
|   |   |
|   |   |-- http/
|   |       |-- index.ts           # Module factory (20+ tools)
|   |       |-- client.ts          # HttpClient class
|   |       |-- methods.ts        # httpGet, httpPost, etc.
|   |
|   |-- security/
|   |   |-- allowlist.ts           # AllowlistGuard class
|   |   |-- sanitize.ts            # Input sanitization
|   |
|   |-- constants/
|   |   |-- index.ts
|   |   |-- shared.ts              # SUSPICIOUS_PATHS, DOUBLE_DOT
|   |   |-- filesystem.ts
|   |   |-- git.ts
|   |   |-- http.ts
|   |   |-- project.ts
|   |   |-- limits.ts
|   |   |-- operations.ts
|   |
|   |-- types/
|   |   |-- index.ts               # Shared TypeScript types
|   |
|   |-- utils/
|       |-- logger.ts              # Structured logging
|       |-- retry.ts               # Retry with backoff
|       |-- url-validator.ts       # URL security validation
|       |-- file.ts                # File utilities
|
|-- tests/
|   |-- filesystem.test.ts
|   |-- git.test.ts
|   |-- security.test.ts
|   |-- http.test.ts
|
|-- docs/
|   |-- ARCHITECTURE.md            # This file
|   |-- TOOLS.md                  # Tool documentation
|   |-- SECURITY.md                # Security model
|   |-- dev-setup.md              # Development setup
|
|-- package.json
|-- tsconfig.json
|-- bunfig.toml
|-- Dockerfile
|-- docker-compose.yml
```

---

## 6. Module Factory Pattern

Each module uses a consistent factory pattern for registration:

```mermaid
flowchart TB
    createServer["createServer(rootDir)"]
    createModule["create[Module]Module(server, guard, rootDir)"]
    registerTool["server.registerTool(name, schema, handler)"]

    createServer --> |"for each module"| createModule
    createModule --> registerTool

    subgraph ModuleX["Example: Git Module"]
        createStatusTools
        createHistoryTools
        createOperationTools
    end

    createModule --> createStatusTools
    createModule --> createHistoryTools
    createModule --> createOperationTools
```

**Benefits:**
- Each module is self-contained and testable
- Guards are injected, not imported directly
- Server reference allows dynamic tool registration
- Consistent pattern across all modules

---

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Modular architecture | Each domain (filesystem, git, project, http) is isolated |
| AllowlistGuard | Prevents path traversal, blocks sensitive system paths |
| Factory pattern | Modules are self-contained and testable |
| Stdio transport | Standard MCP protocol for Claude Code compatibility |
| Shared HttpClient | Persistent auth and headers across requests |
| Zod schemas | Runtime validation of tool inputs |
| Bun runtime | 3x faster than Node for long-running server process |