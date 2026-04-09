# Wiki Auto-Rules — Template for MEMORY.md

Copy this block into your Claude Code project memory file
(`~/.claude/projects/<project-path>/memory/MEMORY.md`).

Replace `<WIKI_ROOT>` with the absolute path to your wiki directory.

---

```markdown
# Wiki Auto-Rules (SEMPRE attivo)

## Auto-Retrieve
- Prima di rispondere a qualsiasi domanda tecnica, cerca nel wiki tramite RTFM MCP (`rtfm_search` nel corpus `wiki`)
- Se trovi pagine rilevanti, leggile con `rtfm_expand` e usa le informazioni nella risposta
- Citazione: "Dal wiki: [[pagina]]"

## Auto-Save
- Quando emerge una conoscenza utile da una conversazione (tecniche, decisioni, scoperte, soluzioni a problemi), salvala **immediatamente** nel wiki — NON aspettare che l'utente lo chieda
- Flusso completo in un solo passo: crea pagina wiki → aggiorna index.md → aggiorna log.md → rtfm_sync → git commit
- Crea/aggiorna pagine in `<WIKI_ROOT>/wiki/` seguendo lo schema in `<WIKI_ROOT>/CLAUDE.md`

## Wiki Path
- Wiki root: `<WIKI_ROOT>/`
- Pagine: `<WIKI_ROOT>/wiki/`
- Fonti raw: `<WIKI_ROOT>/raw/`
- Schema: `<WIKI_ROOT>/CLAUDE.md`
```

### How to find your memory file path

Run this in Claude Code:
```
What is my project memory file path?
```

The path follows the pattern: `~/.claude/projects/<encoded-project-path>/memory/MEMORY.md`
