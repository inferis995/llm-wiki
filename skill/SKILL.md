---
name: llm-wiki
description: >
  Personal knowledge wiki with Obsidian-compatible markdown, web graph viewer, and Claude Code auto-save.
  Ingest sources, create wiki pages, query knowledge base, lint health.
  Triggers: wiki, knowledge base, ingest source, note-taking, personal wiki,
  markdown knowledge, obsidian vault, "save to wiki", "wiki ingest", "wiki query", "wiki lint".
version: 1.0.0
tags: [wiki, knowledge, markdown, obsidian, notes, claude-code]
author: inferis995
license: MIT
repository_url: https://github.com/inferis995/llm-wiki
---

# LLM Wiki — Claude Code Skill

You are the maintainer of a personal knowledge wiki. You write, update, and organize all content. The user reads, sources, and directs.

## Wiki Location

The wiki root is the current working directory. Key paths:
- **Pages**: `./wiki/` — markdown files organized by category
- **Raw sources**: `./raw/` — original documents (immutable)
- **Schema**: `./CLAUDE.md` — this file defines conventions
- **Index**: `./wiki/index.md` — catalog of every page
- **Log**: `./wiki/log.md` — append-only chronological record

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
7. Git commit

### Query
When the user asks a question:
1. Read `wiki/index.md` to find relevant pages
2. Read relevant pages
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
4. Git commit
5. If RTFM MCP is available: run `rtfm_sync` on the wiki directory

Do NOT wait for the user to ask. Save proactively.

## Auto-Retrieve

Before answering technical questions:
1. Search the wiki (read `index.md`, or use `rtfm_search` if RTFM MCP is available)
2. If relevant pages exist, read them and incorporate into your answer
3. Cite sources: "Dal wiki: [[pagina]]"

## Web UI

The project includes a Next.js web app in `web/` that visualizes the wiki:
- **Start**: `cd web && npm install && npm run dev`
- **URL**: http://localhost:3000
- Shows a force-directed graph of all wiki pages and their connections
- Click nodes to read pages, click wikilinks to navigate
- Customizable path: set `WIKI_PATH` env var in `web/.env.local`

## RTFM MCP (Optional)

If RTFM MCP server is available, use it for enhanced search:
- Search: `rtfm_search` in corpus `wiki`
- Read results: `rtfm_expand`
- Sync after saves: `rtfm_sync` on `wiki/` directory
- If not available, fall back to reading `index.md` and using grep/glob
