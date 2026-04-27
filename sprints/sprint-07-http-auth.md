# Sprint 02 - Auth & Headers

**Duration:** Week 2
**Capacity:** 1 agent x 5 days

## Goal

Implement authentication support (API Key, Bearer, Basic) and comprehensive header management.

## Tasks

- [ ] Implement set-auth-api-key tool
- [ ] Implement set-auth-bearer tool
- [ ] Implement set-auth-basic tool
- [ ] Implement clear-auth tool
- [ ] Implement set-header tool
- [ ] Add authentication to all HTTP requests
- [ ] Support custom content-type headers
- [ ] Validate header values
- [ ] Write authentication unit tests
- [ ] Document auth usage patterns

## Acceptance Criteria

1. API key authentication works with header injection
2. Bearer token authentication works
3. Basic auth (username/password) works
4. clear-auth removes all auth from subsequent requests
5. set-header adds custom headers to requests
6. Multiple auth methods cannot be combined (last one wins)
7. Tests cover all auth scenarios
8. Documentation updated with auth examples

## Dependencies

- Sprint 01 complete
- Auth handler utilities in src/utils/auth-handlers.ts

## Risks

- Different APIs expect auth in different headers
- May need to support custom header names for auth