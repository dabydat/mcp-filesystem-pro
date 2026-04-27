# Sprint 04 - Security & Testing

**Duration:** Week 4
**Capacity:** 1 agent x 5 days

## Goal

Implement URL allowlisting security and comprehensive test coverage.

## Tasks

- [ ] Implement add-url-allowlist tool
- [ ] Implement remove-url-allowlist tool
- [ ] Implement list-allowlist tool
- [ ] Create url-validator utility
- [ ] Block requests to non-allowlisted URLs
- [ ] Add security test suite
- [ ] Test URL validation edge cases
- [ ] Test injection attacks (newline in headers)
- [ ] Run integration tests
- [ ] Performance test with concurrent requests

## Acceptance Criteria

1. Only allowlisted URLs can be accessed
2. Non-allowlisted URLs return security error
3. add-url-allowlist adds URL to allowlist
4. remove-url-allowlist removes URL from allowlist
5. list-allowlist shows current allowlist
6. Wildcards supported (e.g., *.example.com)
7. Header injection attacks prevented
8. All security tests pass
9. Integration tests cover full request flow
10. Performance: <100ms overhead per request

## Dependencies

- Sprint 01 (basic server)
- src/utils/url-validator.ts

## Risks

- Allowlist regex may have ReDoS vulnerabilities
- Need to handle file:// and other schemes