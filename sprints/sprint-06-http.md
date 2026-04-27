# Sprint 06 - HTTP Client Foundation

**Duration:** 2026-06-09 to 2026-06-15 (1 week)
**Capacity:** 1 agent
**Goal:** Add HTTP client module to mcp-filesystem-pro

## Goal

Establish HTTP client capabilities integrated into mcp-filesystem-pro. After this sprint, mcp-filesystem-pro becomes a complete "AI agent workbench" with filesystem + git + project + HTTP.

## Tasks

- [ ] Add axios dependency to package.json
- [ ] Create src/modules/http/ directory
- [ ] Implement http_get tool
- [ ] Implement http_post tool
- [ ] Implement http_put tool
- [ ] Implement http_delete tool
- [ ] Implement http_patch tool
- [ ] Register HTTP tools in server
- [ ] Write unit tests for HTTP methods
- [ ] Update server.ts to wire HTTP module

## Dependencies

- axios (for HTTP requests)

## 6 New Tools

| Tool | Description |
|------|-------------|
| `http_get` | Make GET request |
| `http_post` | Make POST request |
| `http_put` | Make PUT request |
| `http_delete` | Make DELETE request |
| `http_patch` | Make PATCH request |
| `http_head` | Make HEAD request |

## Acceptance Criteria

1. All 6 HTTP tools registered
2. Tools make real HTTP requests
3. Responses parsed and returned
4. Error handling works
5. Unit tests pass
6. No TypeScript errors