import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'claude-pet');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

interface DiskState {
  sessionStart?: number;
}

function loadDiskState(): DiskState {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(raw) as DiskState;
  } catch {
    return {};
  }
}

function saveDiskState(state: DiskState): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

let sessionStart: number | null = null;

/** Initialize session tracking. Call once at startup. */
export function initSession(): void {
  const disk = loadDiskState();
  sessionStart = disk.sessionStart ?? Date.now();
  if (!disk.sessionStart) {
    saveDiskState({ sessionStart });
  }
}

/** Animation tick based on wall-clock time. Changes every ~1.5 seconds. */
export function animTick(): number {
  return Math.floor(Date.now() / 1500);
}

/** Mood tick based on wall-clock time. Changes every ~10 seconds. */
export function moodTick(): number {
  return Math.floor(Date.now() / 10000);
}

/** Session uptime string. */
export function sessionUptime(): string {
  if (!sessionStart) return '<1m';
  const ms = Date.now() - sessionStart;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hours}h`;
  return `${hours}h${rem}m`;
}
