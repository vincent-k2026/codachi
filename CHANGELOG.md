# Changelog

All notable changes to codachi are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-04-09

First release published to npm. Same cute pet, but now survivable in the wild:
ships with an extension API, localization, productivity dashboard, and
terminal/Windows robustness.

### Added

- **`codachi stats`** — local productivity dashboard (sessions, total uptime,
  average session length, relationship-tier progress bar, last-24h
  test/commit/edit summary). Zero telemetry; reads only local state.
- **Plugin API** — drop an `.mjs` file into `~/.config/codachi/plugins/` to
  register custom message packs and palettes. Auto-loaded at startup; use
  `codachi plugins` to inspect what's loaded. `CODACHI_NO_PLUGINS=1` disables.
- **i18n** — `localize(key, default)` shim powers every message pool.
  Bundled 简体中文 (`zh.json`) covers the most visible pools; partial locale
  files supported, missing keys fall through to English. Detection via
  `CODACHI_LOCALE` > `LANG`/`LC_ALL` > `en`. User-provided locales go in
  `~/.config/codachi/locales/`.
- **Terminal capability detection** — auto-downgrades truecolor → 256 → 16 →
  monochrome. Honors `NO_COLOR`, `FORCE_COLOR`, `COLORTERM`, and common
  terminal markers (iTerm2, WezTerm, Kitty, Alacritty, Windows Terminal).
  Override explicitly via `CODACHI_COLOR`.
- **Error log** — failures land in `~/.claude/plugins/codachi/codachi.log`
  (auto-rotated at 256 KB) instead of being silently swallowed.
  `CODACHI_QUIET=1` silences writes, `CODACHI_DEBUG=1` adds verbose entries.
- **Render benchmark** — `npm run bench` runs 500 synthetic renders and
  reports p50/p95/p99 with a configurable budget. Current p95 ≈ 0.1 ms.
- **Schema versioning** — `state.json` and `memory.json` now carry a
  `version` field and a forward-compatible migration path, with defensive
  floors on counters to survive disk corruption.

### Changed

- **`codachi init`** detects whether it's running from `npx` / global install
  or a local clone, and writes `codachi` / `codachi-hook` bin references
  instead of absolute paths when possible. Re-running `init` is now
  idempotent: it replaces any existing codachi hook in-place.
- **Config validation** (`validateConfig`) runtime-checks every field,
  whitelists `animal` / `widgets`, warns on unknown keys, and degrades
  invalid values to defaults instead of failing silently.
- **README** repositioned as a productivity copilot disguised as a
  tamagotchi. New sections: Productivity dashboard, Plugins, Localization,
  Environment variables, debug log.
- **`CLAUDE.md`** added for agent onboarding.

### Fixed

- **Windows compatibility** — `git.ts` no longer shells out through bash
  (`2>/dev/null; echo ---SEP---` is gone). Uses `spawnSync` with
  `shell: false` and `windowsHide: true`, so git detection works from
  cmd.exe and PowerShell.
- **Silent failure modes** — replaced `catch {}` sites across
  `fs-utils.ts`, `state.ts`, `events.ts`, `hook.ts`, and `index.ts` with
  scoped `logError` calls. ENOENT on first-run files is no longer logged.

### Performance

- Verified render p95 ≈ 0.1 ms under `npm run bench` (budget 50 ms).
  README previously claimed "~50 ms render" without a benchmark; the real
  number is 500× faster once stdin parsing and git are excluded.

### Tests

- **304 tests passing** (up from 292). New coverage in `colors.test.ts` and
  the rewritten `git.test.ts` (switched from `execSync` to `spawnSync`
  mock surface).

## [0.1.0]

Initial development release (unpublished to npm). Widget registry, interactive
TUI config, mood engine, 850+ messages, five animal species, ten palettes,
context velocity prediction, pet memory with relationship tiers.
