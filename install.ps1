$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WikiRoot = (Resolve-Path $ScriptDir).Path
$SkillDir = "$env:USERPROFILE\.claude\skills\llm-wiki"
$ObsidianSkillDir = "$env:USERPROFILE\.claude\skills\obsidian-vault"
$McpFile = "$env:USERPROFILE\.mcp.json"
$SettingsFile = "$env:USERPROFILE\.claude\settings.local.json"

Write-Host "==> LLM Wiki — One-Shot Setup" -ForegroundColor Cyan
Write-Host "    This script downloads and installs everything automatically." -ForegroundColor Gray
Write-Host ""

# ── 1. Python ──────────────────────────────────────────────────
Write-Host "[1/7] Checking Python..." -ForegroundColor Yellow
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try { $null = Get-Command $cmd -ErrorAction Stop; $pythonCmd = $cmd; break } catch {}
}
if ($pythonCmd) {
    $pyVer = & $pythonCmd --version 2>&1
    Write-Host "      Python: $pyVer" -ForegroundColor Green
} else {
    Write-Host "      Python not found. Install from https://python.org" -ForegroundColor Red
    Write-Host "      Then re-run this script." -ForegroundColor Gray
    exit 1
}

# ── 2. RTFM MCP ────────────────────────────────────────────────
Write-Host "[2/7] Installing RTFM MCP..." -ForegroundColor Yellow

# pip install rtfm-ai
$rtfmCheck = & $pythonCmd -m pip show rtfm-ai 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      rtfm-ai already installed" -ForegroundColor Green
} else {
    & $pythonCmd -m pip install rtfm-ai --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      rtfm-ai installed" -ForegroundColor Green
    } else {
        Write-Host "      Failed to install rtfm-ai" -ForegroundColor Red
    }
}

# Configure ~/.mcp.json
$rtfmDbPath = "$WikiRoot\wiki\.rtfm\library.db" -replace '\\', '/'

if (Test-Path $McpFile) {
    $mcpJson = Get-Content $McpFile -Raw | ConvertFrom-Json
    if (-not $mcpJson.mcpServers) { $mcpJson | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} }
    $rtfmEntry = @{
        command = "python"
        args    = @("-m", "rtfm.mcp")
        env     = @{ RTFM_DB = $rtfmDbPath }
    }
    $mcpJson.mcpServers | Add-Member -NotePropertyName "rtfm" -NotePropertyValue $rtfmEntry -Force
    $mcpJson | ConvertTo-Json -Depth 10 | Set-Content $McpFile
    Write-Host "      RTFM MCP configured in $McpFile" -ForegroundColor Green
} else {
    $mcpJson = @{ mcpServers = @{ rtfm = @{ command = "python"; args = @("-m", "rtfm.mcp"); env = @{ RTFM_DB = $rtfmDbPath } } } }
    $mcpJson | ConvertTo-Json -Depth 10 | Set-Content $McpFile
    Write-Host "      RTFM MCP configured in $McpFile" -ForegroundColor Green
}

# Enable RTFM in Claude Code settings
if (Test-Path $SettingsFile) {
    $settings = Get-Content $SettingsFile -Raw | ConvertFrom-Json
    $servers = $settings.enabledMcpjsonServers
    if ($null -eq $servers) { $servers = @() }
    if ($servers -notcontains "rtfm") {
        $servers += "rtfm"
        $settings | Add-Member -NotePropertyName "enabledMcpjsonServers" -NotePropertyValue $servers -Force
        $settings | ConvertTo-Json -Depth 10 | Set-Content $SettingsFile
        Write-Host "      RTFM enabled in Claude Code settings" -ForegroundColor Gray
    } else {
        Write-Host "      RTFM already enabled in Claude Code settings" -ForegroundColor Gray
    }
}

# ── 3. Obsidian ────────────────────────────────────────────────
Write-Host "[3/7] Installing Obsidian..." -ForegroundColor Yellow

$obsidianPaths = @(
    "${env:LOCALAPPDATA}\Obsidian\Obsidian.exe",
    "${env:ProgramFiles}\Obsidian\Obsidian.exe",
    "${env:ProgramFiles(x86)}\Obsidian\Obsidian.exe"
)
$obsidianFound = $false
foreach ($p in $obsidianPaths) {
    if (Test-Path $p) { $obsidianFound = $true; break }
}

if ($obsidianFound) {
    Write-Host "      Obsidian already installed" -ForegroundColor Green
} else {
    Write-Host "      Downloading Obsidian installer..." -ForegroundColor Gray
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest" -Headers @{"User-Agent"="PowerShell"}
        $exeAsset = $release.assets | Where-Object { $_.name -like "*.exe" -and $_.name -notlike "*.portable*" } | Select-Object -First 1
        if ($exeAsset) {
            $installerPath = "$env:TEMP\Obsidian-Installer.exe"
            Write-Host "      Downloading $($exeAsset.name)..." -ForegroundColor Gray
            Invoke-WebRequest -Uri $exeAsset.browser_download_url -OutFile $installerPath -UseBasicParsing
            Write-Host "      Running installer (this may need admin approval)..." -ForegroundColor Gray
            Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
            Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
            Write-Host "      Obsidian installed" -ForegroundColor Green
        } else {
            Write-Host "      Could not find installer — download from https://obsidian.md/download" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "      Download failed — install manually from https://obsidian.md/download" -ForegroundColor Yellow
    }
}

# ── 4. Obsidian Vault Skill ────────────────────────────────────
Write-Host "[4/7] Installing Obsidian Vault skill..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ObsidianSkillDir | Out-Null

$obsidianSkill = @"
---
name: obsidian-vault
description: >
  Work with Obsidian vaults -- flat structure, Title Case filenames, [[wikilinks]],
  index notes, search via find/grep.
  Triggers: obsidian, vault, note, markdown notes, "create note", "search vault".
version: 1.0.0
tags: [obsidian, vault, markdown, notes, knowledge]
---

# Obsidian Vault

Vault location: the current working directory (your Obsidian vault).

Mostly flat at root level.

## Naming Conventions
- Index notes: aggregate related topics (e.g., ``Docker Index.md``, ``Skills Index.md``)
- Title case for all note names
- No folders for organization -- use links and index notes instead

## Linking
- Use Obsidian [[wikilinks]] syntax: [[Note Title]]
- Notes link to dependencies/related notes at the bottom
- Index notes are just lists of [[wikilinks]]

## Workflows
- Search for notes: find/grep on vault path
- Create a new note: Title Case filename + content + [[wikilinks]] at bottom
- Find related notes: grep for [[Note Title]] across vault
- Find index notes: find ""*Index"" files
"@

Set-Content -Path "$ObsidianSkillDir\SKILL.md" -Value $obsidianSkill -Encoding UTF8
Write-Host "      Obsidian Vault skill installed to $ObsidianSkillDir" -ForegroundColor Green

# ── 5. LLM Wiki Skill ──────────────────────────────────────────
Write-Host "[5/7] Installing LLM Wiki skill..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
Copy-Item "$ScriptDir\skill\SKILL.md" "$SkillDir\SKILL.md" -Force
Write-Host "      LLM Wiki skill installed to $SkillDir" -ForegroundColor Green

# ── 6. Web UI ──────────────────────────────────────────────────
Write-Host "[6/7] Installing web UI..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    Push-Location "$ScriptDir\web"
    npm install --silent 2>&1 | Out-Null
    Pop-Location
    Write-Host "      Web UI dependencies installed" -ForegroundColor Green
} else {
    Write-Host "      Node.js not found — install from https://nodejs.org" -ForegroundColor Yellow
    Write-Host "      Then run: cd web && npm install" -ForegroundColor Gray
}

# ── 7. Git + RTFM init ─────────────────────────────────────────
Write-Host "[7/7] Finalizing..." -ForegroundColor Yellow

if (Test-Path "$ScriptDir\.git") {
    Write-Host "      Git already initialized" -ForegroundColor Gray
} else {
    Push-Location $ScriptDir
    git init 2>$null
    Pop-Location
    Write-Host "      Git initialized" -ForegroundColor Green
}

# RTFM sync
try {
    $null = Get-Command rtfm -ErrorAction Stop
    Push-Location $ScriptDir
    rtfm sync wiki --corpus wiki 2>$null
    Pop-Location
    Write-Host "      RTFM synced wiki content" -ForegroundColor Green
} catch {
    Write-Host "      RTFM not in PATH -- restart terminal, then: rtfm sync wiki --corpus wiki" -ForegroundColor Gray
}

# ── Done ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==> Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your wiki is ready:" -ForegroundColor Cyan
Write-Host "  1. Open this folder as an Obsidian vault" -ForegroundColor White
Write-Host "  2. Restart Claude Code (to load MCP servers)" -ForegroundColor White
Write-Host "  3. Say: ingest <url>  to add your first source" -ForegroundColor White
Write-Host "  4. Say: cd web && npm run dev  to view the graph" -ForegroundColor White
Write-Host ""
Write-Host "Tip: Add auto-save rules to Claude Code memory -- see docs/auto-rules.md" -ForegroundColor Gray
Write-Host ""
