#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$HOME/.claude/skills/llm-wiki"

echo "==> LLM Wiki Setup"
echo ""

# 1. Install skill
echo "[1/3] Installing Claude Code skill..."
mkdir -p "$SKILL_DIR"
cp "$SCRIPT_DIR/skill/SKILL.md" "$SKILL_DIR/SKILL.md"
echo "      Skill installed to $SKILL_DIR"

# 2. Install web dependencies
echo "[2/3] Installing web UI dependencies..."
cd "$SCRIPT_DIR/web" && npm install
echo "      Web UI ready"

# 3. Git init
echo "[3/3] Setting up git..."
cd "$SCRIPT_DIR"
if [ ! -d .git ]; then
  git init
  git add -A
  git commit -m "init: LLM Wiki"
  echo "      Git initialized"
else
  echo "      Git already initialized"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add auto-rules to Claude Code memory (see docs/auto-rules.md)"
echo "  2. Open this directory in Claude Code"
echo "  3. Say 'ingest <url>' to add your first source"
echo "  4. Run 'cd web && npm run dev' to view the graph"
echo ""
