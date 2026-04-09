/**
 * Shared in-memory registry for plugin contributions.
 *
 * Kept separate from both plugins.ts (the loader) and i18n.ts (the message
 * consumer) to avoid import cycles. Everything in here is module-level mutable
 * state, populated once at startup by `plugins.ts#loadPlugins()` and
 * read-only after that.
 */
import type { PetColors } from './types.js';

/** Raw message overrides from plugins, keyed exactly like a locale file. */
export const PLUGIN_MESSAGES: Record<string, unknown> = {};

/** Extra palettes contributed by plugins, appended after the built-in 10. */
export const REGISTERED_PALETTES: PetColors[] = [];

/** Display names for the palette index, for `codachi config` UIs. */
export const PALETTE_NAMES: string[] = [];

/** One entry per loaded plugin, for diagnostics / `codachi plugins` listing. */
export interface LoadedPlugin {
  name: string;
  path: string;
  messageKeys: string[];
  paletteCount: number;
}
export const LOADED_PLUGINS: LoadedPlugin[] = [];
