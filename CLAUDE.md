# geemong — LLM Wiki

Mode: B (Repository)
Purpose: Persistent architecture wiki for the When? (กี่โมง?) monorepo, seeded from `/understand` knowledge graph.
Created: 2026-06-13

## Structure

```
.raw/                    # immutable sources (understand graph snapshot)
wiki/
├── index.md             # master catalog
├── hot.md               # recent context (~500 words) — read first
├── overview.md          # executive summary
├── log.md               # append-only operation log
├── modules/             # architectural layers (from /understand)
├── components/          # feature areas (engine, dating, merch, api, backend)
├── flows/               # 12-step guided tour
├── dependencies/        # tech stack
├── sources/             # provenance for ingested knowledge
└── meta/
```

## Conventions

- All notes use YAML frontmatter: `type`, `status`, `created`, `updated`, `tags` (minimum)
- Wikilinks: `[[Note Name]]` or `[[path/to/note|Label]]`
- `.raw/` is immutable — never edit source snapshots
- `wiki/index.md` is the master catalog — update on every ingest
- `wiki/log.md` is append-only — new entries at the TOP
- `wiki/hot.md` is overwritten completely after each significant operation

## Operations

| Command | Action |
|---------|--------|
| `/wiki-query <question>` | Answer from wiki (hot → index → drill down) |
| `/understand` | Rebuild knowledge graph after major changes |
| `/understand-chat <q>` | Query live graph directly |
| `ingest` | After `/understand`, refresh wiki from new graph |

## Agent routing

When exploring architecture or unfamiliar code in this repo:

1. Read `wiki/hot.md` first (~500 words)
2. If not enough, read `wiki/index.md` and `wiki/overview.md`
3. For a feature area, read `wiki/components/<name>.md`
4. For onboarding path, follow `wiki/flows/_index.md`
5. For live graph detail, grep `.understand-anything/knowledge-graph.json`

Do NOT read the full knowledge graph JSON unless a specific node lookup is needed.

## Live graph

`.understand-anything/knowledge-graph.json` is the machine-readable source of truth.
`wiki/` is the human-navigable synthesis. Refresh wiki after `/understand --full` or major refactors.
