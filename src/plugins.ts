/**
 * Plugin loader. Scans ~/.config/codachi/plugins/*.{mjs,js} and imports each as
 * an ES module. Every plugin's default export is expected to match `Plugin`:
 *
 *   // ~/.config/codachi/plugins/midnight.mjs
 *   export default {
 *     name: 'midnight',
 *     messages: {
 *       BUSY_MESSAGES: ['⌘ focused', '⌘ flow state'],
 *       EVENT_MESSAGES: { test_passed: ['green — ship it'] },
 *     },
 *     palettes: [
 *       { name: 'Midnight', body: [20,30,70], accent: [60,80,140],
 *         face: [180,190,220], blush: [120,140,180] },
 *     ],
 *   };
 *
 * Palettes use [r,g,b] tuples (not pre-rendered SGR strings) so the render
 * tier's color-downgrade logic can handle them like built-in palettes.
 *
 * Loading is best-effort: a broken plugin logs an error and is skipped. The
 * statusline must always render something.
 *
 * This module is awaited at top level of i18n.ts so plugin-provided message
 * overrides are visible to every messages/*.ts file at their first import.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { logError, logWarn } from './log.js';
import { rgb } from './render/colors.js';
import type { PetColors } from './types.js';
import { PLUGIN_MESSAGES, REGISTERED_PALETTES, PALETTE_NAMES, LOADED_PLUGINS } from './plugin-store.js';

export interface PluginPalette {
  name?: string;
  body:   [number, number, number];
  accent: [number, number, number];
  face:   [number, number, number];
  blush:  [number, number, number];
}

export interface Plugin {
  name?: string;
  messages?: Record<string, unknown>;
  palettes?: PluginPalette[];
}

const PLUGIN_DIR = path.join(os.homedir(), '.config', 'codachi', 'plugins');

function listPluginFiles(): string[] {
  try {
    return fs.readdirSync(PLUGIN_DIR)
      .filter(f => f.endsWith('.mjs') || f.endsWith('.js'))
      .sort()
      .map(f => path.join(PLUGIN_DIR, f));
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      logError('plugins.list', err);
    }
    return [];
  }
}

function validatePalette(p: unknown, origin: string): PetColors | null {
  if (!p || typeof p !== 'object') { logWarn(origin, 'palette is not an object'); return null; }
  const raw = p as Record<string, unknown>;
  const toTriple = (v: unknown): [number, number, number] | null => {
    if (!Array.isArray(v) || v.length !== 3) return null;
    const [r, g, b] = v;
    if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') return null;
    return [r | 0, g | 0, b | 0];
  };
  const body = toTriple(raw.body);
  const accent = toTriple(raw.accent);
  const face = toTriple(raw.face);
  const blush = toTriple(raw.blush);
  if (!body || !accent || !face || !blush) {
    logWarn(origin, 'palette missing one of body/accent/face/blush [r,g,b]');
    return null;
  }
  return {
    body:   rgb(body[0], body[1], body[2]),
    accent: rgb(accent[0], accent[1], accent[2]),
    face:   rgb(face[0], face[1], face[2]),
    blush:  rgb(blush[0], blush[1], blush[2]),
  };
}

async function loadOne(file: string): Promise<void> {
  let mod: { default?: Plugin } | Plugin;
  try {
    // Use file: URL for Windows compatibility (file path → URL).
    mod = await import(pathToFileURL(file).href);
  } catch (err) {
    logError('plugins.import:' + file, err);
    return;
  }
  const plugin = ('default' in mod && mod.default ? mod.default : mod) as Plugin;
  if (!plugin || typeof plugin !== 'object') {
    logWarn('plugins.' + file, 'plugin has no default export');
    return;
  }
  const name = plugin.name || path.basename(file).replace(/\.(mjs|js)$/, '');
  const origin = `plugins.${name}`;

  const messageKeys: string[] = [];
  if (plugin.messages && typeof plugin.messages === 'object') {
    for (const [k, v] of Object.entries(plugin.messages)) {
      // Later plugins win over earlier ones; locale files will win over both.
      PLUGIN_MESSAGES[k] = v;
      messageKeys.push(k);
    }
  }

  let paletteCount = 0;
  if (Array.isArray(plugin.palettes)) {
    for (const raw of plugin.palettes) {
      const validated = validatePalette(raw, origin);
      if (validated) {
        REGISTERED_PALETTES.push(validated);
        PALETTE_NAMES.push((raw as PluginPalette).name || `${name}:${paletteCount}`);
        paletteCount++;
      }
    }
  }

  LOADED_PLUGINS.push({ name, path: file, messageKeys, paletteCount });
}

export async function loadPlugins(): Promise<void> {
  const files = listPluginFiles();
  if (!files.length) return;
  // Sequential load so failure diagnostics are ordered and plugin precedence
  // matches filename sort — parallelism isn't worth the determinism cost here.
  for (const f of files) {
    await loadOne(f);
  }
}
