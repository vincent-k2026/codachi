/**
 * Tiny i18n shim for codachi messages.
 *
 * Strategy: keep the English message files as the canonical / default source.
 * At module load time, each message export is wrapped in `localize(key, default)`.
 * If a locale file exists for the current locale AND it contains an override
 * for `key`, we return the override (structure-merged for object-shaped pools
 * like EVENT_MESSAGES). Otherwise we return the default unchanged.
 *
 * Locale detection (first match wins):
 *   1. CODACHI_LOCALE env var                    — explicit user override
 *   2. `locale` field in ~/.config/codachi/config.json (not yet wired)
 *   3. LANG / LC_ALL env vars, first two chars   — OS default
 *   4. 'en'                                       — ultimate fallback
 *
 * Locale file lookup (first existing wins):
 *   1. ~/.config/codachi/locales/<locale>.json   — user override
 *   2. <dist>/locales/<locale>.json              — bundled (optional)
 *
 * A locale file is a flat JSON object whose keys match the message export
 * names, e.g.:
 *
 *   {
 *     "BUSY_MESSAGES": ["正在做事情~", "一起加油!"],
 *     "EVENT_MESSAGES": { "test_passed": { "hot": ["全绿! *happy dance*"] } }
 *   }
 *
 * Missing keys fall through to English — translators can ship partial locales
 * without breaking anything.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { logError, logWarn } from './log.js';
import { loadPlugins } from './plugins.js';
import { PLUGIN_MESSAGES } from './plugin-store.js';

// Top-level await: load plugins BEFORE any messages/*.ts module evaluates.
// Because i18n.ts is the first thing every messages file imports, we're
// guaranteed to run first — message defaults are then wrapped by localize()
// which can see plugin overrides.
//
// If disabled via CODACHI_NO_PLUGINS=1 (or tests), we skip the scan entirely
// so unrelated code paths don't pay the import-resolution cost.
if (process.env.CODACHI_NO_PLUGINS !== '1') {
  try {
    await loadPlugins();
  } catch (err) {
    logError('i18n.loadPlugins', err);
  }
}

function detectLocale(): string {
  const override = process.env.CODACHI_LOCALE;
  if (override) return override.toLowerCase().slice(0, 5);
  const sys = process.env.LC_ALL || process.env.LANG || '';
  if (sys) {
    const short = sys.toLowerCase().slice(0, 2);
    if (short) return short;
  }
  return 'en';
}

const LOCALE = detectLocale();

function loadLocaleFile(): Record<string, unknown> {
  if (LOCALE === 'en') return {}; // English is the source — no file needed.

  const candidates = [
    path.join(os.homedir(), '.config', 'codachi', 'locales', `${LOCALE}.json`),
  ];
  // Bundled locales, if shipped: dist/locales/<locale>.json relative to this file.
  try {
    const here = path.dirname(new URL(import.meta.url).pathname);
    candidates.push(path.join(here, 'locales', `${LOCALE}.json`));
  } catch {
    // ignored — not fatal if import.meta.url isn't resolvable
  }

  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      logWarn('i18n', `locale file ${p} is not an object`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        logError('i18n.load:' + p, err);
      }
    }
  }
  return {};
}

const LOCALE_DATA: Record<string, unknown> = loadLocaleFile();

/**
 * Deep-merge a locale override onto the default structure.
 *   - For primitives and arrays: override wins if it's the same shape.
 *   - For plain objects: merge key-by-key so translators can override just a
 *     few entries of a big nested pool (e.g. EVENT_MESSAGES.test_passed only).
 */
function merge<T>(fallback: T, override: unknown): T {
  if (override === undefined || override === null) return fallback;

  // Arrays: override must be an array to be accepted; otherwise fallback wins.
  if (Array.isArray(fallback)) {
    return Array.isArray(override) ? (override as T) : fallback;
  }

  // Plain object: recursively merge.
  if (fallback && typeof fallback === 'object') {
    if (typeof override !== 'object' || Array.isArray(override)) return fallback;
    const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
      out[k] = merge((fallback as Record<string, unknown>)[k], v);
    }
    return out as T;
  }

  // Primitives: straightforward override.
  return (typeof override === typeof fallback ? override : fallback) as T;
}

export function localize<T>(key: string, fallback: T): T {
  // Precedence (outermost wins): locale file > plugin override > default.
  // We merge in that order so the user's chosen language is always the final
  // say, but plugins can still contribute new entries the locale file doesn't
  // know about.
  let current = fallback;
  const pluginOverride = PLUGIN_MESSAGES[key];
  if (pluginOverride !== undefined) current = merge(current, pluginOverride);
  if (LOCALE !== 'en') {
    const localeOverride = LOCALE_DATA[key];
    if (localeOverride !== undefined) current = merge(current, localeOverride);
  }
  return current;
}

export function getLocale(): string { return LOCALE; }
