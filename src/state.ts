import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'claude-pet');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

interface DiskState {
  transcriptPath?: string;
  sessionStart?: number;
  animalIndex?: number;
  paletteIndex?: number;
}

function loadDiskState(): DiskState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as DiskState;
  } catch {
    return {};
  }
}

function saveDiskState(state: DiskState): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch {}
}

let diskState: DiskState = {};

/**
 * Initialize session. A new transcript_path from Claude Code = new session.
 * Same transcript_path = same pet.
 */
export function initSession(transcriptPath?: string): void {
  diskState = loadDiskState();
  const isSameSession = transcriptPath && diskState.transcriptPath === transcriptPath;

  if (!isSameSession) {
    diskState = {
      transcriptPath: transcriptPath ?? '',
      sessionStart: Date.now(),
      animalIndex: Math.floor(Math.random() * 6),
      paletteIndex: Math.floor(Math.random() * 10),
    };
    saveDiskState(diskState);
  }
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
