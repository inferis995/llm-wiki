---
name: llm-wiki
description: >
  Personal knowledge wiki with Obsidian vault, web graph viewer, RTFM semantic search, and Claude Code auto-save.
  Ingest sources, create wiki pages, query knowledge base, lint health.
  Triggers: wiki, knowledge base, ingest source, note-taking, personal wiki,
  markdown knowledge, obsidian vault, "save to wiki", "wiki ingest", "wiki query", "wiki lint".
version: 2.0.0
tags: [wiki, knowledge, markdown, obsidian, rtfm, notes, claude-code]
author: inferis995
license: MIT
repository_url: https://github.com/inferis995/llm-wiki
---

# LLM Wiki — Claude Code Skill

You are the maintainer of a personal knowledge wiki built on an Obsidian vault. You write, update, and organize all content. The user reads, sources, and directs.

## Prerequisites

This wiki requires:

1. **Obsidian** — Markdown editor with `[[wikilinks]]`, graph view, and browser clippings
   - Download: https://obsidian.md/download
   - The project root IS an Obsidian vault — open it with Obsidian
2. **RTFM MCP** — Semantic search server for wiki content
   - Setup: https://github.com/pashpashpash/rtfm-mcp
   - Must be configured in your Claude Code MCP settings before using this skill

## Wiki Location

The wiki root is the current working directory (also your Obsidian vault). Key paths:
- **Pages**: `./wiki/` — markdown files organized by category
- **Raw sources**: `./raw/` — original documents (immutable)
- **Schema**: `./CLAUDE.md` — this file defines conventions
- **Index**: `./wiki/index.md` — catalog of every page
- **Log**: `./wiki/log.md` — append-only chronological record
- **Clippings**: `./Clippings/` — browser clippings saved via Obsidian web clipper

## Obsidian Vault

This project root is an Obsidian vault. All wiki pages use `[[wikilinks]]` which resolve natively in Obsidian.

### Obsidian Skill Integration

If the [Obsidian Vault skill](https://skills.sh/mattpocock/skills/obsidian-vault) is installed, follow its conventions:
- **Flat structure preferred** — keep notes at the vault root when possible
- **Title Case filenames** — e.g., `Docker.md`, `Reverse Proxy.md`
- **Index notes** — maintain `wiki/index.md` as the master catalog
- **Search** — use Obsidian search (Ctrl/Cmd+Shift+F) or `grep` for backlinks
- **Related notes** — link related pages at the bottom of each page with `[[wikilinks]]`

### Obsidian Web Clipper

Install the Obsidian web clipper browser extension to save clippings directly to `Clippings/`. These appear automatically in the web UI as red nodes.

## Operations

### Ingest
When the user provides a new source (URL, file, or text):
1. Save it to `raw/` (or read from URL/path)
2. Read the full source carefully
3. Discuss key takeaways with the user
4. Create/update wiki pages:
   - Summary page for the source (in `wiki/sources/` with `src-` prefix)
   - Entity pages for key subjects (in `wiki/entities/`)
   - Concept pages for abstract ideas (in `wiki/concepts/`)
   - Comparison pages when comparing things (in `wiki/comparisons/`)
   - Add `[[wikilinks]]` cross-references between related pages
   - Note contradictions with existing content
5. Update `wiki/index.md`
6. Append entry to `wiki/log.md`
7. Run `rtfm_sync` on the wiki directory
8. Git commit

### Query
When the user asks a question:
1. Search the wiki with `rtfm_search` in corpus `wiki`
2. Read relevant pages with `rtfm_expand`
3. Synthesize answer with `[[page]]` citations
4. If the answer is valuable, offer to file it as a new wiki page
5. Cite: "Dal wiki: [[pagina]]"

### Lint
When the user asks to health-check:
1. Scan all pages for:
   - Contradictions between pages
   - Orphan pages (no inbound links)
   - Missing cross-references
   - Concepts mentioned but lacking their own page
   - Stale claims superseded by newer sources
2. Report findings and offer to fix

## Page Format

Every wiki page uses this format:

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [[source-page-1]], [[source-page-2]]
tags: [tag1, tag2]
---

# Page Title

Content with [[wikilinks]] to other pages.

## Key Points
- Point 1
- Point 2

## Related
- [[related-page-1]]
- [[related-page-2]]
```

## Conventions

- Use `[[wikilinks]]` for all cross-references (Obsidian-compatible)
- Source pages: `wiki/sources/` with prefix `src-` (e.g., `src-article-name.md`)
- Entity pages: `wiki/entities/` (e.g., `docker.md`)
- Concept pages: `wiki/concepts/` (e.g., `reverse-proxy.md`)
- Comparison pages: `wiki/comparisons/` (e.g., `docker-vs-podman.md`)
- Be concise — prefer bullet points over paragraphs
- Always cite sources with `[[links]]`
- When in doubt, create a new page rather than cramming info into an existing one

## Index Format

`wiki/index.md` is organized by category:

```markdown
# Wiki Index

## Sources
- [[src-article-name]] — One-line summary

## Entities
- [[docker]] — Container runtime platform

## Concepts
- [[reverse-proxy]] — Pattern for forwarding requests

## Comparisons
- [[docker-vs-podman]] — Feature comparison
```

## Log Format

`wiki/log.md` entries:

```
## [YYYY-MM-DD] ingest | Source Title
- Created: [[src-source-name]], [[entity-1]], [[concept-1]]
- Updated: [[existing-page]] with new info

## [YYYY-MM-DD] query | Question topic
- Answered using: [[page-1]], [[page-2]]

## [YYYY-MM-DD] lint | Health check
- Found: 2 orphans, 1 contradiction
- Fixed: [[orphan-page]] linked from [[main-page]]

## [YYYY-MM-DD] build | Project/tool description
- Created/updated: [[page]]
```

## Auto-Save Rules

When useful knowledge emerges during ANY conversation (techniques, decisions, discoveries, solutions):
1. **Immediately** create or update the relevant wiki page
2. Update `wiki/index.md`
3. Append entry to `wiki/log.md`
4. Run `rtfm_sync` on the wiki directory
5. Git commit

Do NOT wait for the user to ask. Save proactively.

## Auto-Retrieve

Before answering technical questions:
1. Search the wiki with `rtfm_search` in corpus `wiki`
2. If relevant pages exist, read them with `rtfm_expand` and incorporate into your answer
3. Cite sources: "Dal wiki: [[pagina]]"

## RTFM MCP

RTFM MCP is **required** for semantic search over wiki content:
- **Search**: `rtfm_search` in corpus `wiki`
- **Read**: `rtfm_expand` on results
- **Sync**: `rtfm_sync` on `wiki/` directory after every save
- Setup guide: https://github.com/pashpashpash/rtfm-mcp

## Web UI

The project includes a Next.js web app in `web/` that visualizes the wiki:
- **Start**: `cd web && npm install && npm run dev`
- **URL**: http://localhost:3000
- Shows a force-directed graph of all wiki pages and their connections
- Click nodes to read pages, click wikilinks to navigate
- Clippings from Obsidian web clipper appear as red nodes
- Customizable path: set `WIKI_PATH` env var in `web/.env.local`
