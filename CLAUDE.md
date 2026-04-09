# LLM Wiki — Technical Knowledge Base

You are the maintainer of this wiki. You write, update, and organize all content. The user reads, sources, and directs.

## Prerequisites

- **Obsidian** — This directory is an Obsidian vault. Open it with Obsidian for editing, graph view, and browser clippings.
- **RTFM MCP** — Required for semantic search. Install: `pip install rtfm-ai`. Use `rtfm_search` (corpus `wiki`), `rtfm_expand`, and `rtfm_sync` after every save.

## Structure

```
wiki/
├── raw/              ← Source documents (IMMUTABLE — never modify)
│   └── assets/       ← Downloaded images
├── wiki/             ← LLM-generated markdown (you own this)
│   ├── index.md      ← Catalog of every page
│   ├── log.md        ← Append-only chronological record
│   └── *.md          ← Entity, concept, summary, comparison pages
├── Clippings/        ← Browser clippings (saved via Obsidian web clipper)
└── CLAUDE.md         ← This file — schema and conventions
```

## Operations

### Ingest
When the user provides a new source:
1. Save it to `raw/` (or read from URL/path)
2. Read the full source carefully
3. Discuss key takeaways with the user
4. Create/update wiki pages:
   - Summary page for the source
   - Update relevant entity/concept pages with new info
   - Add cross-references with `[[wikilinks]]`
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
- Source pages go in `wiki/sources/` with prefix `src-` (e.g. `src-article-name.md`)
- Entity pages go in `wiki/entities/` (e.g. `docker.md`, `nginx.md`)
- Concept pages go in `wiki/concepts/` (e.g. `reverse-proxy.md`, `containerization.md`)
- Comparison pages go in `wiki/comparisons/` (e.g. `docker-vs-podman.md`)
- Be concise — prefer bullet points over paragraphs
- Always cite sources with `[[links]]`
- When in doubt, create a new page rather than cramming info into an existing one

## Index Format

`wiki/index.md` is organized by category with one-line descriptions:

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

`wiki/log.md` entries use this format:

```
## [YYYY-MM-DD] ingest | Source Title
- Created: [[src-source-name]], [[entity-1]], [[concept-1]]
- Updated: [[existing-page]] with new info

## [YYYY-MM-DD] query | Question topic
- Answered using: [[page-1]], [[page-2]]
- Filed: [[new-analysis-page]]

## [YYYY-MM-DD] lint | Health check
- Found: 2 orphans, 1 contradiction
- Fixed: [[orphan-page]] linked from [[main-page]]
```
