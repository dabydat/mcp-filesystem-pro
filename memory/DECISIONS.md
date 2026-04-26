# DECISIONS — Architecture Decision Records

| # | Decision | Date | Reason | Status |
|---|----------|------|--------|--------|
| 1 | Use Bun runtime over Node | 2026-04-25 | 3x faster script execution, 10x faster installs, better memory for long-running processes | Accepted |
| 2 | Pin @modelcontextprotocol/sdk to ^1.0.0 | 2026-04-25 | Avoid breaking changes from future versions | Accepted |
| 3 | Use diff ^7.x for unified diff parsing | 2026-04-25 | Battle-tested, supports applyPatch | Accepted |
| 4 | AllowlistGuard security model | 2026-04-25 | Validate all paths against configured root, prevent traversal | Accepted |
| 5 | 6-sprint structure | 2026-04-25 | 1 week per sprint, manageable scope | Accepted |
| 6 | qa-engineer for Sprint 5 | 2026-04-25 | Testing and documentation sprint needs QA focus | Accepted |
| 7 | prompt-architect generates all prompts | 2026-04-25 | Ensure quality and consistency across all tasks | Accepted |
| 8 | CLI --help and --version flags | 2026-04-25 | Standard CLI practice, user-friendly help output | Accepted |
| 9 | Docker multi-stage build with non-root user | 2026-04-26 | Security: containers should not run as root | Accepted |
| 10 | Docker CI/CD with GitHub Actions | 2026-04-26 | Automated lint → typecheck → test → build → image push | Accepted |
| 11 | Multi-arch Docker builds via buildx | 2026-04-26 | Support linux/amd64 and linux/arm64 | Accepted |
| 12 | Docker security hardening | 2026-04-26 | Non-root user, no-new-privileges, mem limits, STOPSIGNAL, cache cleanup | Accepted |
| 13 | CI/CD with Trivy vulnerability scanning | 2026-04-26 | SBOM + provenance + SARIF output to GitHub Security | Accepted |

---

## ADR-1: Use Bun Runtime
**Status:** Accepted
**Date:** 2026-04-25

**Context:** MCP server runs as long-lived process, needs fast startup and good memory management

**Options:**
1. Node.js — Most common, npm ecosystem
2. Bun — 3x faster, 10x faster installs, better memory
3. Deno — Modern but less npm compatibility

**Decision:** Bun — faster execution and installs, full npm compatibility

**Consequences:** Team must have Bun installed; bun test for testing

---

## ADR-2: Pin MCP SDK Version
**Status:** Accepted
**Date:** 2026-04-25

**Context:** MCP SDK is relatively new, APIs may change

**Decision:** Pin @modelcontextprotocol/sdk to ^1.0.0

**Consequences:** Will need to update pin periodically for new features

---

## ADR-3: Use diff Library for Unified Diffs
**Status:** Accepted
**Date:** 2026-04-25

**Context:** apply_diff tool needs to parse and apply unified diffs

**Decision:** Use diff ^7.x with applyPatch function

**Consequences:** One more dependency but well-tested library

---

## ADR-4: AllowlistGuard Security Model
**Status:** Accepted
**Date:** 2026-04-25

**Context:** Prevent path traversal attacks, scope operations to project root

**Decision:** All file paths validated against configured root directory. Block /etc, /root, ~/.ssh, .env, /proc, /sys

**Consequences:** Every tool must call guard.validate() before file operations

---

## ADR-5: 6-Sprint Structure
**Status:** Accepted
**Date:** 2026-04-25

**Context:** Project needs structured implementation phases

**Decision:** 6 sprints, 1 week each:
- Sprint 1: Foundation (server setup)
- Sprint 2: Filesystem module (8 tools)
- Sprint 3: Git module (6 tools)
- Sprint 4: Project module (4 tools)
- Sprint 5: Testing + Documentation
- Sprint 6: Publish + CI/CD

**Consequences:** 6-week timeline, each sprint has clear deliverables