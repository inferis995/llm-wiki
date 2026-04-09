$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillDir = "$env:USERPROFILE\.claude\skills\llm-wiki"

Write-Host "==> LLM Wiki Setup" -ForegroundColor Cyan
Write-Host ""

# 1. Install skill
Write-Host "[1/3] Installing Claude Code skill..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
Copy-Item "$ScriptDir\skill\SKILL.md" "$SkillDir\SKILL.md" -Force
Write-Host "      Skill installed to $SkillDir" -ForegroundColor Gray

# 2. Install web dependencies
Write-Host "[2/3] Installing web UI dependencies..." -ForegroundColor Yellow
Push-Location "$ScriptDir\web"
npm install
Pop-Location
Write-Host "      Web UI ready" -ForegroundColor Gray

# 3. Git init
Write-Host "[3/3] Setting up git..." -ForegroundColor Yellow
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
Write-Host "  1. Add auto-rules to Claude Code memory (see docs/auto-rules.md)"
Write-Host "  2. Open this directory in Claude Code"
Write-Host "  3. Say 'ingest <url>' to add your first source"
Write-Host "  4. Run 'cd web && npm run dev' to view the graph"
