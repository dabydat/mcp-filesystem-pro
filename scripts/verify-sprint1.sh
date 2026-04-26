#!/bin/bash
# Local Verification Script for Sprint 1
# Run this from the project root: bash scripts/verify-sprint1.sh

set -e

echo "=========================================="
echo "Sprint 1 Verification"
echo "=========================================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[1/4] Checking bun installation..."
if ! command -v bun &> /dev/null; then
  echo "ERROR: bun not found. Install from https://bun.sh"
  exit 1
fi
echo "  bun $(bun --version)"
echo ""

echo "[2/4] Running bun install..."
bun install
echo ""

echo "[3/4] Running bun run build..."
bun run build
echo ""

echo "[4/4] Running bun test..."
bun test
echo ""

echo "=========================================="
echo "All verification checks passed!"
echo "=========================================="