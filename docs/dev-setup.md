# Development Environment Setup

## Prerequisites

- **Node.js** >= 20.0.0
- **Bun** >= 1.0.0 (recommended) or npm/yarn

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/mcp-filesystem-pro.git
cd mcp-filesystem-pro

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test

# Start development server (watch mode)
bun run dev
```

## Using npm/yarn instead of Bun

```bash
npm install
npm run build
npm test
```

## MCP Inspector

To debug MCP connections:

```bash
bun run inspector
```

Then connect your MCP client to `http://localhost:3000`.

## Project Structure

```
src/
├── index.ts          # CLI entry point
├── server.ts         # MCP server factory
├── types/
│   └── index.ts      # Shared TypeScript types
├── utils/
│   └── logger.ts     # Logging utility
└── security/
    ├── allowlist.ts  # Path allowlist guard
    └── sanitize.ts   # Input sanitization

tests/
├── setup.ts          # Test configuration
└── handshake.test.ts # MCP handshake tests

sprints/
├── sprint-01-foundation.md
├── sprint-02-filesystem.md
└── ...
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Logging level: debug, info, warn, error |
| `ALLOWLIST_ROOT` | `.` | Allowed base directory for file operations |

## Troubleshooting

### "Command not found: bun"
Install Bun: `curl -fsSL https://bun.sh/install | bash`

### TypeScript errors
Ensure `bun run build` completes without errors before running tests.

### MCP connection refused
Verify the server is running with `bun run dev` and the correct URL is configured.