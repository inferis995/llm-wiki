<p align="center">
  <h1 align="center">LLM Wiki</h1>
  <p align="center">
    <strong>Personal knowledge base powered by Claude Code.</strong><br>
    Obsidian-compatible markdown with an interactive web graph viewer.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/D3.js-7-orange?logo=d3.js" alt="D3.js">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
    <img src="https://img.shields.io/badge/Claude_Code-Skill-purple" alt="Claude Code">
  </p>
</p>

<p align="center">
  <img src="web/public/screenshot.png" alt="LLM Wiki Web UI" width="800">
</p>

---

## What You Get

| Feature | Description |
|---------|-------------|
| **Wiki Engine** | Structured markdown with `[[wikilinks]]`, auto-indexing, categories (sources, entities, concepts, comparisons) |
| **Claude Code Skill** | Ingest sources, query knowledge, auto-save, health-check your wiki |
| **Web UI** | Next.js + D3.js force-directed graph + markdown viewer with clickable wikilinks |
| **Obsidian Compatible** | Open the repo as an Obsidian vault for GUI editing |
| **Clippings Support** | Browser clippings saved via Obsidian appear automatically in the web UI |
| **RTFM Optional** | Semantic search over wiki content via RTFM MCP |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/inferis995/llm-wiki.git my-wiki
cd my-wiki

# 2. Install (copies skill + installs web dependencies)
./install.sh        # Linux/macOS
# or
.\install.ps1       # Windows

# 3. Add auto-rules to Claude Code memory
#    Copy the template from docs/auto-rules.md into your project MEMORY.md
#    (see docs/auto-rules.md for instructions)

# 4. Use it
#    - Open this directory in Claude Code
#    - Say "ingest <url>" to add your first source
#    - Ask questions — knowledge is auto-saved
```

## Usage

### Ingest a source
```
> ingest https://github.com/some/project
```
Claude reads the source, creates wiki pages, updates the index, and commits.

### Query the wiki
```
> What do I know about Docker networking?
```
Claude searches the wiki and answers with `[[wikilink]]` citations.

### Health check
```
> wiki lint
```
Claude scans for orphans, contradictions, and missing cross-references.

### Auto-save
Knowledge is saved automatically during conversations when useful information emerges. No manual action needed.

## Web UI

Interactive force-directed graph visualization of your wiki.

```bash
cd web
npm run dev
# Open http://localhost:3000
```

**Features:**
- D3.js force-directed graph with zoom and drag
- Color-coded nodes by category (blue=sources, green=entities, yellow=concepts, purple=comparisons, red=clippings)
- Click nodes to read pages
- Clickable `[[wikilinks]]` in content
- Sidebar navigation with search
- Backlinks and related pages

### Custom wiki path
Create `web/.env.local`:
```
WIKI_PATH=/path/to/your/wiki/content
```

## Obsidian Setup (Optional)

The wiki is fully Obsidian-compatible. Use Obsidian as a GUI editor:

1. **Download** Obsidian from [obsidian.md/download](https://obsidian.md/download)
2. **Open** this repo folder as a vault ("Open folder as vault")
3. **Edit** pages in Obsidian — Claude reads and updates them too
4. **Graph view** shows connections between all wiki pages
5. **Clippings** saved from the browser via Obsidian appear in the web UI automatically

## Project Structure

```
llm-wiki/
├── CLAUDE.md          # Wiki schema (operations, page format, conventions)
├── README.md          # This file
├── LICENSE            # MIT
├── .gitignore
├── install.sh         # Setup script (Unix)
├── install.ps1        # Setup script (Windows)
│
├── skill/
│   └── SKILL.md       # Claude Code skill (installed to ~/.claude/skills/llm-wiki/)
│
├── web/               # Next.js graph viewer
│   ├── src/
│   │   ├── app/       # Server components (reads wiki at build time)
│   │   ├── components/ # ForceGraph, MarkdownViewer, HomeClient
│   │   └── lib/       # wiki.ts (file reader), types.ts
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── wiki/              # Your knowledge (markdown files)
│   ├── index.md       # Page catalog
│   ├── log.md         # Chronological record
│   ├── sources/       # Source summaries
│   ├── entities/      # Things (software, hardware, protocols...)
│   ├── concepts/      # Ideas (patterns, architectures, concepts...)
│   └── comparisons/   # Head-to-head comparisons
│
├── Clippings/         # Browser clippings (saved via Obsidian)
│
├── raw/               # Original source documents (immutable)
│
└── docs/
    └── auto-rules.md  # Template for Claude Code auto-save rules
```

## Wiki Categories

| Category | Folder | Color | Description |
|----------|--------|-------|-------------|
| **Sources** | `wiki/sources/` | Blue | Summaries of ingested content (prefix `src-`) |
| **Entities** | `wiki/entities/` | Green | Things: software, hardware, protocols, tools |
| **Concepts** | `wiki/concepts/` | Yellow | Ideas: patterns, architectures, abstractions |
| **Comparisons** | `wiki/comparisons/` | Purple | Head-to-head feature comparisons |
| **Clippings** | `Clippings/` | Red | Browser clippings saved via Obsidian |

## How It Works

```
┌──────────────┐     ingest      ┌──────────────┐
│   Source      │ ──────────────► │  raw/         │  (immutable originals)
│  (URL/file)   │                  └──────────────┘
└──────────────┘                         │
                                          ▼
┌──────────────┐     create      ┌──────────────┐
│  Claude Code │ ──────────────► │  wiki/        │  (structured markdown)
│  (skill)     │ ◄────────────── │  sources/     │
└──────────────┘     query       │  entities/    │
        │                        │  concepts/    │
        ▼                        │  comparisons/ │
┌──────────────┐                  └──────┬───────┘
│  Web UI      │ ◄─────────────────────┘
│  (Next.js)   │    reads wiki/ + Clippings/
└──────────────┘
```

## Requirements

- **Node.js 18+** (for web UI)
- **Claude Code** (for AI operations)
- **Git** (for version control)

### Optional

- **RTFM MCP** — semantic search over wiki content
- **Obsidian** — GUI markdown editor (open repo as vault)

## License

MIT &copy; 2026 [inferis995](https://github.com/inferis995)
