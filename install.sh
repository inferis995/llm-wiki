#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WIKI_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
SKILL_DIR="$HOME/.claude/skills/llm-wiki"
OBSIDIAN_SKILL_DIR="$HOME/.claude/skills/obsidian-vault"
MCP_FILE="$HOME/.mcp.json"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

log_ok()   { echo -e "      ${GREEN}$1${NC}"; }
log_info() { echo -e "      ${GRAY}$1${NC}"; }
log_warn() { echo -e "      ${YELLOW}$1${NC}"; }
log_err()  { echo -e "      ${RED}$1${NC}"; }

echo -e "${CYAN}==> LLM Wiki — One-Shot Setup${NC}"
echo -e "${GRAY}    This script downloads and installs everything automatically.${NC}"
echo ""

# ── 1. Python / pip ──────────────────────────────────────────────
echo -e "${YELLOW}[1/7] Checking Python...${NC}"
if command -v python3 &>/dev/null; then
  PYTHON="python3"
elif command -v python &>/dev/null; then
  PYTHON="python"
else
  log_err "Python not found. Install it from https://python.org or your package manager."
  exit 1
fi
log_ok "Python: $($PYTHON --version 2>&1)"

# ── 2. RTFM MCP (pip install + config) ──────────────────────────
echo -e "${YELLOW}[2/7] Installing RTFM MCP...${NC}"

if $PYTHON -m pip show rtfm-ai &>/dev/null 2>&1; then
  log_ok "rtfm-ai already installed"
else
  $PYTHON -m pip install rtfm-ai --quiet 2>&1 && log_ok "rtfm-ai installed" || log_err "Failed to install rtfm-ai"
fi

# Configure ~/.mcp.json
RTFM_DB_PATH="$WIKI_ROOT/wiki/.rtfm/library.db"
if [ -f "$MCP_FILE" ]; then
  # Merge RTFM entry using Python (jq may not be available)
  $PYTHON -c "
import json, sys
with open('$MCP_FILE') as f:
    data = json.load(f)
if 'mcpServers' not in data:
    data['mcpServers'] = {}
data['mcpServers']['rtfm'] = {
    'command': 'python',
    'args': ['-m', 'rtfm.mcp'],
    'env': {'RTFM_DB': '$RTFM_DB_PATH'}
}
with open('$MCP_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('MCP config updated')
" 2>&1 && log_ok "RTFM MCP configured in $MCP_FILE" || log_err "Failed to update MCP config"
else
  $PYTHON -c "
import json
data = {'mcpServers': {'rtfm': {'command': 'python', 'args': ['-m', 'rtfm.mcp'], 'env': {'RTFM_DB': '$RTFM_DB_PATH'}}}}
with open('$MCP_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('MCP config created')
" 2>&1 && log_ok "RTFM MCP configured in $MCP_FILE" || log_err "Failed to create MCP config"
fi

# Enable RTFM in Claude Code settings
SETTINGS_FILE="$HOME/.claude/settings.local.json"
if [ -f "$SETTINGS_FILE" ]; then
  $PYTHON -c "
import json, sys
with open('$SETTINGS_FILE') as f:
    data = json.load(f)
servers = data.get('enabledMcpjsonServers', [])
if 'rtfm' not in servers:
    servers.append('rtfm')
    data['enabledMcpjsonServers'] = servers
    with open('$SETTINGS_FILE', 'w') as f:
        json.dump(data, f, indent=2)
    print('RTFM enabled in Claude Code settings')
else:
    print('RTFM already enabled')
" 2>&1 | while read -r line; do log_info "$line"; done
fi

# ── 3. Obsidian ─────────────────────────────────────────────────
echo -e "${YELLOW}[3/7] Installing Obsidian...${NC}"

OBSIDIAN_INSTALLED=false
if [ -d "/Applications/Obsidian.app" ] || [ -d "$HOME/Applications/Obsidian.app" ]; then
  OBSIDIAN_INSTALLED=true
  log_ok "Obsidian already installed"
elif command -v obsidian &>/dev/null 2>&1; then
  OBSIDIAN_INSTALLED=true
  log_ok "Obsidian already installed"
fi

if [ "$OBSIDIAN_INSTALLED" = false ]; then
  log_info "Downloading Obsidian..."

  OS="$(uname -s)"
  case "$OS" in
    Linux)
      ARCH="$(uname -m)"
      case "$ARCH" in
        x86_64)  SUFFIX="linux-x64.tar.gz" ;;
        aarch64) SUFFIX="linux-arm64.tar.gz" ;;
        *)       SUFFIX="linux-x64.tar.gz" ;;
      esac
      ;;
    Darwin)
      SUFFIX="mac.dmg"
      ;;
    *)
      log_warn "Unsupported OS: $OS — download Obsidian manually from https://obsidian.md/download"
      ;;
  esac

  if [ -n "${SUFFIX:-}" ]; then
    # Get latest release URL from GitHub API
    RELEASE_URL=$($PYTHON -c "
import json, urllib.request
req = urllib.request.Request('https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest')
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
for asset in data.get('assets', []):
    if asset['name'].endswith('$SUFFIX'):
        print(asset['browser_download_url'])
        break
" 2>&1)

    if [ -n "$RELEASE_URL" ] && [ "$RELEASE_URL" != "None" ]; then
      TMPDIR="$(mktemp -d)"
      TMPFILE="$TMPDIR/obsidian-download"

      if command -v curl &>/dev/null; then
        curl -sL "$RELEASE_URL" -o "$TMPFILE" 2>&1
      elif command -v wget &>/dev/null; then
        wget -q "$RELEASE_URL" -O "$TMPFILE" 2>&1
      fi

      if [ -f "$TMPFILE" ] && [ -s "$TMPFILE" ]; then
        case "$OS" in
          Linux)
            sudo tar -xzf "$TMPFILE" -C /opt/ 2>/dev/null || {
              mkdir -p "$HOME/.local/bin"
              tar -xzf "$TMPFILE" -C "$HOME/.local/" 2>/dev/null
              log_ok "Obsidian extracted to $HOME/.local/"
            }
            if [ -f "/opt/Obsidian/obsidian" ]; then
              sudo ln -sf /opt/Obsidian/obsidian /usr/local/bin/obsidian 2>/dev/null
              log_ok "Obsidian installed to /opt/Obsidian/"
            fi
            ;;
          Darwin)
            hdiutil attach "$TMPFILE" -nobrowse -quiet
            cp -R "/Volumes/Obsidian/Obsidian.app" "/Applications/" 2>/dev/null
            hdiutil detach "/Volumes/Obsidian" -quiet 2>/dev/null
            log_ok "Obsidian installed to /Applications/"
            ;;
        esac
      else
        log_warn "Download failed — install Obsidian manually from https://obsidian.md/download"
      fi
      rm -rf "$TMPDIR"
    else
      log_warn "Could not find Obsidian release — install manually from https://obsidian.md/download"
    fi
  fi
fi

# ── 4. Obsidian Vault Skill ─────────────────────────────────────
echo -e "${YELLOW}[4/7] Installing Obsidian Vault skill...${NC}"
mkdir -p "$OBSIDIAN_SKILL_DIR"

OBSIDIAN_SKILL_CONTENT='---
name: obsidian-vault
description: >
  Work with Obsidian vaults — flat structure, Title Case filenames, [[wikilinks]],
  index notes, search via find/grep.
  Triggers: obsidian, vault, note, markdown notes, "create note", "search vault".
version: 1.0.0
tags: [obsidian, vault, markdown, notes, knowledge]
---

# Obsidian Vault

Vault location: the current working directory (your Obsidian vault).

Mostly flat at root level.

## Naming Conventions
- Index notes: aggregate related topics (e.g., `Docker Index.md`, `Skills Index.md`)
- Title case for all note names
- No folders for organization — use links and index notes instead

## Linking
- Use Obsidian [[wikilinks]] syntax: [[Note Title]]
- Notes link to dependencies/related notes at the bottom
- Index notes are just lists of [[wikilinks]]

## Workflows
- Search for notes: find/grep on vault path
- Create a new note: Title Case filename + content + [[wikilinks]] at bottom
- Find related notes: grep for [[Note Title]] across vault
- Find index notes: find "*Index*" files
'

echo "$OBSIDIAN_SKILL_CONTENT" > "$OBSIDIAN_SKILL_DIR/SKILL.md"
log_ok "Obsidian Vault skill installed to $OBSIDIAN_SKILL_DIR"

# ── 5. LLM Wiki Skill ──────────────────────────────────────────
echo -e "${YELLOW}[5/7] Installing LLM Wiki skill...${NC}"
mkdir -p "$SKILL_DIR"
cp "$SCRIPT_DIR/skill/SKILL.md" "$SKILL_DIR/SKILL.md"
log_ok "LLM Wiki skill installed to $SKILL_DIR"

# ── 6. Web UI ──────────────────────────────────────────────────
echo -e "${YELLOW}[6/7] Installing web UI...${NC}"
if command -v node &>/dev/null; then
  (cd "$SCRIPT_DIR/web" && npm install --silent 2>&1) && log_ok "Web UI dependencies installed" || log_warn "npm install failed — run manually: cd web && npm install"
elif command -v npx &>/dev/null; then
  (cd "$SCRIPT_DIR/web" && npx --yes npm install --silent 2>&1) && log_ok "Web UI dependencies installed" || log_warn "npm install failed"
else
  log_warn "Node.js not found — install from https://nodejs.org, then run: cd web && npm install"
fi

# ── 7. Git + RTFM init ─────────────────────────────────────────
echo -e "${YELLOW}[7/7] Finalizing...${NC}"

# Git init
if [ -d "$SCRIPT_DIR/.git" ]; then
  log_info "Git already initialized"
else
  git init "$SCRIPT_DIR" 2>/dev/null && log_ok "Git initialized" || log_info "Git init skipped"
fi

# RTFM init + sync
if command -v rtfm &>/dev/null 2>&1; then
  rtfm sync "$SCRIPT_DIR/wiki" --corpus wiki 2>/dev/null && log_ok "RTFM synced wiki content" || log_info "RTFM sync skipped (run manually: rtfm sync wiki/ --corpus wiki)"
else
  log_info "RTFM not in PATH — restart your terminal after pip install, then run: rtfm sync wiki/ --corpus wiki"
fi

# ── Done ────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}==> Setup complete!${NC}"
echo ""
echo -e "${CYAN}Your wiki is ready:${NC}"
echo "  1. Open this folder as an Obsidian vault"
echo "  2. Restart Claude Code (to load MCP servers)"
echo "  3. Say: ingest <url>  to add your first source"
echo "  4. Say: cd web && npm run dev  to view the graph"
echo ""
echo -e "${GRAY}Tip: Add auto-save rules to Claude Code memory — see docs/auto-rules.md${NC}"
echo ""
