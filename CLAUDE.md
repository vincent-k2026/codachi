# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**codachi** — a tamagotchi pet that lives in the Claude Code statusline. Zero runtime dependencies, pure TypeScript compiled to ESM. Two binaries: `codachi` (statusline renderer, reads JSON from stdin → writes ANSI to stdout) and `codachi-hook` (PostToolExecution hook that records events to disk).

## Commands

```bash
npm run build          # tsc → dist/ + copy locales
npm run dev            # tsc --watch
npm test               # vitest run (full suite)
npm run test:cov       # coverage
npm run bench          # render p50/p95/p99 benchmark (budget 50ms)
npx vitest run src/mood.test.ts        # single test file
npx vitest run -t "pattern"            # single test by name
node dist/index.js demo                # live terminal demo
node dist/index.js config              # interactive config TUI
node dist/index.js init                # install into ~/.claude/settings.json
node dist/index.js uninstall           # remove from settings.json
node dist/index.js stats               # local productivity dashboard
node dist/index.js plugins             # list loaded plugins
```

Node ≥18 required. No lint step configured; `tsc` is the type gate.

## Architecture

Data flow — two independent processes sharing state on disk:

```
Claude Code ──stdin JSON──▶ index.ts (renderer, p95 ~0.1ms) ──ANSI──▶ statusline
                │
                └──PostToolUse──▶ hook.ts ──▶ events.json ──▶ mood engine on next render
```

The renderer never calls APIs and never blocks on I/O longer than a git status (cached 2s). The hook's only job is to classify a tool-use event and append it; it must stay fast and cannot assume the renderer is running. Events use an optimistic-concurrency generation counter to prevent lost updates from concurrent hooks.

**State lives in** `~/.claude/plugins/codachi/` (session state, events, memory, error log) and `~/.config/codachi/config.json` (user config). All writes are atomic (write-tmp + rename) via `fs-utils.ts`. Pet identity is bound to `transcript_path` so each Claude session gets a stable species/palette.

**Key modules** (read these together to understand a change):
- `index.ts` routes subcommands (`init`/`uninstall`/`demo`/`config`/`stats`/`plugins`) vs. default stdin render path
- `stdin.ts` → `state.ts` → `mood.ts` → `render/` is the render pipeline
- `events.ts` classifies ~40 tool-use categories; `hook.ts` recognizes Bash, Edit, Write, Read, Glob, Grep, Agent, WebSearch, WebFetch, LSP (not just Bash+file ops)
- `mood.ts` is a 15-tier priority engine that picks a message from `messages/*` based on event freshness (hot <15s, warm <60s, cold <5m), context %, velocity, memory tier, and idle fallbacks
- `messages/` holds 900+ strings split by domain (events, idle, context, social, git) — when adding reactions, add to the right file and the category in `events.ts`
- `animals/` is species × size (5 context buckets) × mood (idle/happy/busy/danger/sleep) × 4 animation frames; `identity.ts` picks species+palette (10 truecolor palettes + plugin palettes)
- `state.ts` tracks velocity (context burn %/min), session uptime, memory tiers (stranger→bestie at 0/3/15/50 sessions), and the "struggling" / "recovery" / "rapid editing" pattern detectors. State and memory files carry a schema `version` for forward-compatible migration.
- `render/colors.ts` detects terminal capability (truecolor/ansi256/ansi16/none) and `rgb()` auto-downgrades. Honors `NO_COLOR`, `FORCE_COLOR`, `COLORTERM`.
- `log.ts` writes errors to `~/.claude/plugins/codachi/codachi.log` (256KB auto-rotation). Never touches stdout.
- `i18n.ts` loads locale overrides (`CODACHI_LOCALE` env) and plugin message overrides at top-level await, before any `messages/*.ts` evaluates
- `plugins.ts` scans `~/.config/codachi/plugins/*.{mjs,js}` for custom palettes and message packs
- `width.ts` is CJK-aware — use it, not `.length`, for any statusline width math

**Widgets** on line 1 (`model`, `context`, `velocity`, `rateLimit5h`, `rateLimit7d`) are registered in `widgets/` and ordered by user config.

## Testing

Vitest, ~370 tests, ~79% line coverage. Tests sit next to sources (`*.test.ts`). Mood/events/state have the densest coverage — when touching message selection or event classification, extend the existing table-driven tests rather than adding new files. Set `FORCE_COLOR=3` at the top of any test file that imports from `render/colors.ts` to ensure truecolor mode in CI.
