#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$HOME/.claude/skills/llm-wiki"

echo "==> LLM Wiki Setup"
echo ""

# 1. Check Obsidian
echo "[1/5] Checking Obsidian..."
if command -v obsidian &> /dev/null 2>&1 || [ -d "/Applications/Obsidian.app" ] || [ -d "$HOME/Applications/Obsidian.app" ]; then
  echo "      Obsidian found"
else
  echo "      Obsidian not detected."
  echo "      Please download and install it from: https://obsidian.md/download"
  echo "      Then open this folder as a vault in Obsidian."
fi

# 2. Check RTFM MCP
echo "[2/5] Checking RTFM MCP..."
if command -v rtfm &> /dev/null 2>&1 || pip show rtfm-mcp &> /dev/null 2>&1; then
  echo "      RTFM MCP found"
else
  echo "      RTFM MCP not detected."
  echo "      Install it from: https://github.com/pashpashpash/rtfm-mcp"
  echo "      Then add it to your Claude Code MCP settings."
fi

# 3. Install skill
echo "[3/5] Installing Claude Code skill..."
mkdir -p "$SKILL_DIR"
cp "$SCRIPT_DIR/skill/SKILL.md" "$SKILL_DIR/SKILL.md"
echo "      Skill installed to $SKILL_DIR"

# 4. Install web dependencies
echo "[4/5] Installing web UI dependencies..."
cd "$SCRIPT_DIR/web" && npm install
echo "      Web UI ready"

# 5. Git init
echo "[5/5] Setting up git..."
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
echo "  1. Install Obsidian from https://obsidian.md/download"
echo "  2. Open this directory as an Obsidian vault"
echo "  3. Install RTFM MCP from https://github.com/pashpashpash/rtfm-mcp"
echo "  4. Add auto-rules to Claude Code memory (see docs/auto-rules.md)"
echo "  5. Open this directory in Claude Code"
echo "  6. Say 'ingest <url>' to add your first source"
echo "  7. Run 'cd web && npm run dev' to view the graph"
echo ""
