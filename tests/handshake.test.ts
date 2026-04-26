import { describe, it, expect } from 'bun:test';

describe('MCP Server', () => {
  it('should have valid package.json', async () => {
    const pkg = await import('../package.json', { with: { type: 'json' } });
    expect(pkg.name).toBe('mcp-filesystem-pro');
    expect(pkg.version).toBe('1.0.0');
  });

  it('should export server creation function', async () => {
    const { createServer } = await import('../src/server.js');
    expect(createServer).toBeDefined();
  });
});