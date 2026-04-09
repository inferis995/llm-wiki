$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillDir = "$env:USERPROFILE\.claude\skills\llm-wiki"

Write-Host "==> LLM Wiki Setup" -ForegroundColor Cyan
Write-Host ""

# 1. Check Obsidian
Write-Host "[1/5] Checking Obsidian..." -ForegroundColor Yellow
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
    Write-Host "      Obsidian found" -ForegroundColor Gray
} else {
    Write-Host "      Obsidian not detected." -ForegroundColor Red
    Write-Host "      Please download and install it from: https://obsidian.md/download" -ForegroundColor Gray
    Write-Host "      Then open this folder as a vault in Obsidian." -ForegroundColor Gray
}

# 2. Check RTFM MCP
Write-Host "[2/5] Checking RTFM MCP..." -ForegroundColor Yellow
try {
    $null = Get-Command rtfm -ErrorAction Stop
    Write-Host "      RTFM MCP found" -ForegroundColor Gray
} catch {
    Write-Host "      RTFM MCP not detected." -ForegroundColor Red
    Write-Host "      Install it from: https://github.com/pashpashpash/rtfm-mcp" -ForegroundColor Gray
    Write-Host "      Then add it to your Claude Code MCP settings." -ForegroundColor Gray
}

# 3. Install skill
Write-Host "[3/5] Installing Claude Code skill..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
Copy-Item "$ScriptDir\skill\SKILL.md" "$SkillDir\SKILL.md" -Force
Write-Host "      Skill installed to $SkillDir" -ForegroundColor Gray

# 4. Install web dependencies
Write-Host "[4/5] Installing web UI dependencies..." -ForegroundColor Yellow
Push-Location "$ScriptDir\web"
npm install
Pop-Location
Write-Host "      Web UI ready" -ForegroundColor Gray

# 5. Git init
Write-Host "[5/5] Setting up git..." -ForegroundColor Yellow
Push-Location $ScriptDir
if (-not (Test-Path ".git")) {
    git init
    git add -A
    git commit -m "init: LLM Wiki"
    Write-Host "      Git initialized" -ForegroundColor Gray
} else {
    Write-Host "      Git already initialized" -ForegroundColor Gray
}
Pop-Location

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Install Obsidian from https://obsidian.md/download"
Write-Host "  2. Open this directory as an Obsidian vault"
Write-Host "  3. Install RTFM MCP from https://github.com/pashpashpash/rtfm-mcp"
Write-Host "  4. Add auto-rules to Claude Code memory (see docs/auto-rules.md)"
Write-Host "  5. Open this directory in Claude Code"
Write-Host "  6. Say 'ingest <url>' to add your first source"
Write-Host "  7. Run 'cd web && npm run dev' to view the graph"
