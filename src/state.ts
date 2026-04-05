import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { clearEvents } from './events.js';
import { atomicWrite } from './fs-utils.js';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'codachi');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const MEMORY_FILE = path.join(STATE_DIR, 'memory.json');

// ── Session state ────────────────────────────────────

interface DiskState {
  transcriptPath?: string;
  sessionStart?: number;
  animalIndex?: number;
  paletteIndex?: number;
}

function loadJSON<T>(file: string): T | null {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as T; }
  catch { return null; }
}

function saveJSON(file: string, data: unknown): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    atomicWrite(file, JSON.stringify(data));
  } catch {}
}

let diskState: DiskState = {};

export function initSession(transcriptPath?: string): void {
  diskState = loadJSON<DiskState>(STATE_FILE) ?? {};
  const isSameSession = transcriptPath && diskState.transcriptPath === transcriptPath;

  if (!isSameSession) {
    // New session: update memory, reset state, clear stale events
    updateMemory();
    clearEvents();
    diskState = {
      transcriptPath: transcriptPath ?? '',
      sessionStart: Date.now(),
      animalIndex: Math.floor(Math.random() * 5),
      paletteIndex: Math.floor(Math.random() * 10),
    };
    saveJSON(STATE_FILE, diskState);
  }
}

export function getSessionAnimalIndex(): number { return diskState.animalIndex ?? 0; }
export function getSessionPaletteIndex(): number { return diskState.paletteIndex ?? 0; }

export function animTick(speedSec: number = 1.5): number {
  return Math.floor(Date.now() / (speedSec * 1000));
}
export function moodTick(): number { return Math.floor(Date.now() / 10000); }

export function sessionUptime(): string {
  const start = diskState.sessionStart ?? Date.now();
  const ms = Date.now() - start;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h` : `${hours}h${rem}m`;
}

// ── Context velocity (ring buffer) ───────────────────

const CTX_HISTORY_SIZE = 20;
const ctxHistory: { pct: number; t: number }[] = [];

export function recordContextPercent(pct: number): void {
  const now = Date.now();
  // Don't record too frequently (min 1s gap)
  if (ctxHistory.length > 0 && now - ctxHistory[ctxHistory.length - 1].t < 1000) return;
  ctxHistory.push({ pct, t: now });
  if (ctxHistory.length > CTX_HISTORY_SIZE) ctxHistory.shift();
}

/** Returns context velocity in %/min. Positive = growing. */
export function getContextVelocity(): number {
  if (ctxHistory.length < 2) return 0;
  const recent = ctxHistory[ctxHistory.length - 1];
  // Look back ~30s for a stable reading
  let oldest = ctxHistory[0];
  for (const entry of ctxHistory) {
    if (recent.t - entry.t >= 15000) { oldest = entry; break; }
  }
  const dtMin = (recent.t - oldest.t) / 60000;
  if (dtMin < 0.1) return 0; // too short
  return Math.round(((recent.pct - oldest.pct) / dtMin) * 10) / 10;
}

/** Estimate minutes remaining before context is full. Returns null if velocity <= 0 or unstable. */
export function getContextTimeRemaining(currentPct: number): string | null {
  const vel = getContextVelocity();
  if (vel <= 0.3) return null; // not growing or too slow to predict
  const remaining = 100 - currentPct;
  const mins = Math.round(remaining / vel);
  if (mins <= 0) return null;
  if (mins < 60) return `~${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h}h${m}m` : `~${h}h`;
}

// ── Pet memory (cross-session persistence) ───────────

export interface PetMemory {
  totalSessions: number;
  totalUptimeMin: number;
  firstMet: number; // timestamp
  lastSeen: number;
  lastShownTier?: string; // for tier upgrade notifications
}

let memory: PetMemory | null = null;
let tierJustUpgraded: boolean = false;

function loadMemory(): PetMemory {
  return loadJSON<PetMemory>(MEMORY_FILE) ?? {
    totalSessions: 0,
    totalUptimeMin: 0,
    firstMet: Date.now(),
    lastSeen: Date.now(),
  };
}

function updateMemory(): void {
  // Called when a NEW session starts — save stats from previous session
  const m = loadMemory();
  m.totalSessions += 1;
  m.lastSeen = Date.now();
  // Uptime from previous session (approximate)
  if (diskState.sessionStart) {
    m.totalUptimeMin += Math.floor((Date.now() - diskState.sessionStart) / 60000);
  }

  // Check for tier upgrade
  const oldTier = m.lastShownTier ?? 'stranger';
  const newTier = tierFromSessions(m.totalSessions);
  if (newTier !== oldTier && tierRank(newTier) > tierRank(oldTier)) {
    tierJustUpgraded = true;
    m.lastShownTier = newTier;
  }

  saveJSON(MEMORY_FILE, m);
  memory = m;
}

export function getMemory(): PetMemory {
  if (!memory) memory = loadMemory();
  return memory;
}

/** Returns true once when a tier upgrade just happened, then resets. */
export function didTierUpgrade(): boolean {
  if (tierJustUpgraded) {
    tierJustUpgraded = false;
    return true;
  }
  return false;
}

export type RelationshipTier = 'stranger' | 'acquaintance' | 'friend' | 'bestie';

function tierFromSessions(n: number): RelationshipTier {
  if (n >= 50) return 'bestie';
  if (n >= 15) return 'friend';
  if (n >= 3) return 'acquaintance';
  return 'stranger';
}

function tierRank(tier: string): number {
  const ranks: Record<string, number> = { stranger: 0, acquaintance: 1, friend: 2, bestie: 3 };
  return ranks[tier] ?? 0;
}

export function getRelationshipTier(): RelationshipTier {
  return tierFromSessions(getMemory().totalSessions);
}
