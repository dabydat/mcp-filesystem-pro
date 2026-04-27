# Changelog — mcp-filesystem-pro

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-04-26

### Added

#### HTTP Module (22 tools)

- `http_get` — Perform HTTP GET requests with optional query parameters
- `http_post` — Perform HTTP POST requests with optional body
- `http_put` — Perform HTTP PUT requests with optional body
- `http_delete` — Perform HTTP DELETE requests
- `http_patch` — Perform HTTP PATCH requests with optional body
- `http_head` — Perform HTTP HEAD requests (headers only)
- `http_set_auth_api_key` — Set API key authentication with custom header support
- `http_set_auth_bearer` — Set bearer token authentication
- `http_set_auth_basic` — Set basic authentication (username/password)
- `http_clear_auth` — Clear all authentication credentials
- `http_set_headers` — Set custom headers for requests
- `http_clear_headers` — Clear all custom headers
- `http_set_timeout` — Set request timeout (100-300000ms)
- `http_parse_json` — Parse JSON string to object
- `http_parse_text` — Return text as-is
- `http_get_response_headers` — Get headers from last HTTP response
- `http_get_status_code` — Get status code from last HTTP response
- `http_add_query_param` — Store query parameters for next request
- `http_validate_url` — Validate URL against security rules
- `http_add_url_allowlist` — Add URL pattern to allowlist (supports wildcards)
- `http_remove_url_allowlist` — Remove URL pattern from allowlist
- `http_list_allowlist` — List all allowlist patterns

### Changed

- Updated `@modelcontextprotocol/sdk` dependency to version 1.29.0
- Updated `zod` dependency to version 3.22.0 for improved validation
- Updated `glob` dependency to version 10.3.0

### Fixed

- None

### Security

- URL validation prevents requests to blocked schemes (javascript:, data:)
- Path traversal prevention in URL validation
- Allowlist-based URL filtering with wildcard support

### Breaking Changes

- None

---

## [1.0.0] — 2026-04-24

### Added

- Initial release with Filesystem, Git, and Project modules
- 18 tools across 3 modules
- AllowlistGuard security model
- Path traversal prevention
- Docker and npm distribution