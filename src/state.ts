import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'claude-pet');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

interface DiskState {
  sessionStart?: number;
  lastSeen?: number;
  animalIndex?: number;
  paletteIndex?: number;
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

let diskState: DiskState = {};

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 min gap = new session

/** Initialize session. New animal + palette if session expired or first run. */
export function initSession(): void {
  diskState = loadDiskState();
  const now = Date.now();
  const isNewSession = diskState.sessionStart == null
    || diskState.lastSeen == null
    || (now - diskState.lastSeen) > SESSION_TIMEOUT_MS;

  if (isNewSession) {
    diskState.sessionStart = now;
    diskState.animalIndex = Math.floor(Math.random() * 6);
    diskState.paletteIndex = Math.floor(Math.random() * 10);
  }
  diskState.lastSeen = now;
  saveDiskState(diskState);
}

export function getSessionAnimalIndex(): number {
  return diskState.animalIndex ?? 0;
}

export function getSessionPaletteIndex(): number {
  return diskState.paletteIndex ?? 0;
}

export function animTick(): number {
  return Math.floor(Date.now() / 1500);
}

export function moodTick(): number {
  return Math.floor(Date.now() / 10000);
}

export function sessionUptime(): string {
  const start = diskState.sessionStart ?? Date.now();
  const ms = Date.now() - start;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hours}h`;
  return `${hours}h${rem}m`;
}
