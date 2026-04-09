import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AnimalType } from './types.js';
import { logWarn, logError } from './log.js';

export interface CodachiConfig {
  name?: string;             // custom pet name (default: species name)
  animal?: AnimalType;       // force a specific animal (overrides random)
  palette?: number;          // force a specific palette index 0-9
  widgets?: string[];        // line 1 widget order: model, context, velocity, rateLimit5h, rateLimit7d
  showTokens?: boolean;      // show token summary "550K/1M" (default: true)
  showVelocity?: boolean;    // show context burn speed (default: true)
  showUptime?: boolean;      // show session uptime (default: true)
  showGit?: boolean;         // show git info line (default: true)
  animationSpeed?: number;   // seconds per frame (default: 1.5)
}

export const CONFIG_PATH = path.join(os.homedir(), '.config', 'codachi', 'config.json');

const CONFIG_PATHS = [
  path.join(os.homedir(), '.config', 'codachi', 'config.json'),
  path.join(os.homedir(), '.codachi.json'),
];

const VALID_ANIMALS: ReadonlySet<string> = new Set(['cat', 'penguin', 'owl', 'octopus', 'bunny']);
const VALID_WIDGETS: ReadonlySet<string> = new Set(['model', 'context', 'velocity', 'rateLimit5h', 'rateLimit7d']);
const PALETTE_COUNT = 10;

let config: CodachiConfig = {};

/**
 * Validate raw JSON from disk into a clean CodachiConfig. Unknown or malformed
 * fields are dropped (with a warning in codachi.log) rather than throwing —
 * the statusline must always render something.
 */
export function validateConfig(raw: unknown, source = 'config'): CodachiConfig {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    logWarn(source, 'config is not an object, using defaults');
    return {};
  }
  const r = raw as Record<string, unknown>;
  const out: CodachiConfig = {};

  if (typeof r.name === 'string') {
    const trimmed = r.name.trim().slice(0, 32);
    if (trimmed) out.name = trimmed;
  } else if (r.name !== undefined) {
    logWarn(source, `name must be a string, got ${typeof r.name}`);
  }

  if (typeof r.animal === 'string') {
    if (VALID_ANIMALS.has(r.animal)) {
      out.animal = r.animal as AnimalType;
    } else {
      logWarn(source, `unknown animal "${r.animal}" — valid: ${[...VALID_ANIMALS].join(', ')}`);
    }
  } else if (r.animal !== undefined) {
    logWarn(source, `animal must be a string, got ${typeof r.animal}`);
  }

  if (typeof r.palette === 'number' && Number.isInteger(r.palette)) {
    if (r.palette >= 0 && r.palette < PALETTE_COUNT) {
      out.palette = r.palette;
    } else {
      logWarn(source, `palette must be 0-${PALETTE_COUNT - 1}, got ${r.palette}`);
    }
  } else if (r.palette !== undefined) {
    logWarn(source, `palette must be an integer, got ${typeof r.palette}`);
  }

  if (Array.isArray(r.widgets)) {
    const filtered = r.widgets.filter((w): w is string => typeof w === 'string' && VALID_WIDGETS.has(w));
    const dropped = r.widgets.length - filtered.length;
    if (dropped > 0) logWarn(source, `dropped ${dropped} unknown widget(s); valid: ${[...VALID_WIDGETS].join(', ')}`);
    if (filtered.length) out.widgets = filtered;
  } else if (r.widgets !== undefined) {
    logWarn(source, `widgets must be an array, got ${typeof r.widgets}`);
  }

  for (const key of ['showTokens', 'showVelocity', 'showUptime', 'showGit'] as const) {
    if (r[key] !== undefined) {
      if (typeof r[key] === 'boolean') out[key] = r[key] as boolean;
      else logWarn(source, `${key} must be a boolean, got ${typeof r[key]}`);
    }
  }

  if (r.animationSpeed !== undefined) {
    if (typeof r.animationSpeed === 'number' && r.animationSpeed > 0 && r.animationSpeed <= 60) {
      out.animationSpeed = r.animationSpeed;
    } else {
      logWarn(source, `animationSpeed must be a positive number ≤ 60, got ${r.animationSpeed}`);
    }
  }

  // Surface unknown top-level keys to help users catch typos.
  const knownKeys = new Set(['name', 'animal', 'palette', 'widgets',
    'showTokens', 'showVelocity', 'showUptime', 'showGit', 'animationSpeed']);
  for (const k of Object.keys(r)) {
    if (!knownKeys.has(k)) logWarn(source, `unknown config key "${k}"`);
  }

  return out;
}

export function loadConfig(): CodachiConfig {
  for (const p of CONFIG_PATHS) {
    let raw: string;
    try {
      raw = fs.readFileSync(p, 'utf8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        logError('config.read:' + p, err);
      }
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      logError('config.parse:' + p, err);
      config = {};
      return config;
    }
    config = validateConfig(parsed, p);
    return config;
  }
  config = {};
  return config;
}

export function getConfig(): CodachiConfig {
  return config;
}
