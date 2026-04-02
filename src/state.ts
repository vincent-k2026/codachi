import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { PetState } from './types.js';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'claude-pet');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

export function loadState(): PetState {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as PetState;
    // Keep sessionStart from disk, update frameIndex from time
    return { ...parsed, frameIndex: 0, lastUpdate: Date.now() };
  } catch {
    return { frameIndex: 0, lastUpdate: Date.now(), sessionStart: Date.now() };
  }
}

export function saveState(state: PetState): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

export function nextFrame(state: PetState): PetState {
  return {
    frameIndex: (state.frameIndex + 1) % 3600,
    lastUpdate: Date.now(),
    sessionStart: state.sessionStart,
  };
}

/**
 * Animation tick based on wall-clock time, not frame counter.
 * Changes every ~1.5 seconds regardless of refresh rate.
 * This means the pet "moves" between refreshes too.
 */
export function animTick(): number {
  return Math.floor(Date.now() / 1500);
}

/** Mood tick based on wall-clock time. Changes every ~10 seconds. */
export function moodTick(): number {
  return Math.floor(Date.now() / 10000);
}

/** Session uptime string */
export function sessionUptime(state: PetState): string {
  const start = state.sessionStart ?? state.lastUpdate;
  const ms = Date.now() - start;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h${rem}m`;
}
