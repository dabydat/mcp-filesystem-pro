#!/usr/bin/env bun
import { createServer } from './server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

function showHelp() {
  console.log(`
mcp-filesystem-pro — Production-grade MCP server for filesystem and git operations

USAGE
  mcp-filesystem-pro [root_dir]

ARGUMENTS
  root_dir    Root directory for file operations (default: current directory)

OPTIONS
  --help      Show this help message
  --version   Show version information

EXAMPLES
  mcp-filesystem-pro
  mcp-filesystem-pro /home/user/project

TOOLS (18 total)
  Filesystem:  read_file, read_files, write_file, apply_diff, delete_file,
               find_files, search_text, list_dir
  Git:         git_status, git_diff, git_log, git_add, git_commit, git_branch
  Project:     detect_stack, find_config_files, project_summary, read_agents_md

SECURITY
  All file operations are scoped to the root directory. Path traversal
  attacks are blocked by the AllowlistGuard.

DOCS
  https://github.com/your-org/mcp-filesystem-pro
`);
}

function showVersion() {
  console.log('mcp-filesystem-pro v1.0.0');
}

async function main() {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
    if (arg === '--version' || arg === '-v') {
      showVersion();
      process.exit(0);
    }
  }

  const rootDir = args[0] ?? process.cwd();
  const server = createServer(rootDir);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);