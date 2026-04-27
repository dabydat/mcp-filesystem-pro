# Sprint 03 - Response Parsing

**Duration:** Week 3
**Capacity:** 1 agent x 5 days

## Goal

Implement comprehensive response parsing for JSON and text, plus robust error handling.

## Tasks

- [ ] Implement JSON response parsing
- [ ] Implement text/plain response handling
- [ ] Add response status code handling
- [ ] Create error types for HTTP errors
- [ ] Implement retry-handler with exponential backoff
- [ ] Add set-retry-config tool
- [ ] Handle timeout errors gracefully
- [ ] Add response metadata (headers, status, timing)
- [ ] Write response parsing tests
- [ ] Test edge cases (empty body, malformed JSON)

## Acceptance Criteria

1. JSON responses are parsed to object
2. Text responses returned as string
3. Non-JSON responses handled without crash
4. HTTP error codes (4xx, 5xx) returned as structured errors
5. Retry logic triggers on 5xx and network errors
6. Exponential backoff: 1s, 2s, 4s, 8s max
7. set-retry-config allows configuring max retries
8. Response includes status code, headers, body
9. Timeout errors clearly communicated
10. All tests passing

## Dependencies

- Sprint 01 (server foundation)
- src/tools/retry-handler.ts

## Risks

- Large JSON responses may cause memory issues
- Need to handle binary responses gracefully