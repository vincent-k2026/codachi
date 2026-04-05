import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AnimalType } from './types.js';

export interface CodachiConfig {
  name?: string;             // custom pet name (default: species name)
  animal?: AnimalType;       // force a specific animal (overrides random)
  palette?: number;          // force a specific palette index 0-9
  showTokens?: boolean;      // show token summary "550K/1M" (default: true)
  showVelocity?: boolean;    // show context burn speed (default: true)
  showCache?: boolean;       // show cache hit rate (default: true)
  showUptime?: boolean;      // show session uptime (default: true)
  showGit?: boolean;         // show git info line (default: true)
  animationSpeed?: number;   // seconds per frame (default: 1.5)
}

const CONFIG_PATHS = [
  path.join(os.homedir(), '.config', 'codachi', 'config.json'),
  path.join(os.homedir(), '.codachi.json'),
];

let config: CodachiConfig = {};

export function loadConfig(): CodachiConfig {
  for (const p of CONFIG_PATHS) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      config = JSON.parse(raw) as CodachiConfig;
      return config;
    } catch {
      // try next path
    }
  }
  config = {};
  return config;
}

export function getConfig(): CodachiConfig {
  return config;
}
