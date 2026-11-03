import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { clearEvents } from './events.js';
import { atomicWrite } from './fs-utils.js';
import { logError } from './log.js';

const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'codachi');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const MEMORY_FILE = path.join(STATE_DIR, 'memory.json');

// Schema versions. Bump when shape changes and add a migration below.
// Rule: never break an older codachi trying to read a newer file — be
// additive when possible and carry old fields forward.
const STATE_SCHEMA_VERSION = 1;
const MEMORY_SCHEMA_VERSION = 1;

// ── Session state ────────────────────────────────────
//
// Several Claude Code sessions can render at once, and they all share this
// file, so each session's identity lives in its own entry of `sessions`,
// keyed by transcript path. The top-level fields mirror the most recently
// started session: they are what codachi wrote before `sessions` existed,
// so older versions and `codachi stats` keep reading them unchanged.

interface SessionEntry {
  sessionStart: number;
  /** Last render, refreshed at most once per SEEN_REFRESH_MS. */
  lastSeen: number;
  /** Up to when this session's uptime has been added to memory. */
  creditedUntil: number;
  animalIndex: number;
  paletteIndex: number;
}

interface DiskState {
  version?: number;
  transcriptPath?: string;
  sessionStart?: number;
  animalIndex?: number;
  paletteIndex?: number;
  sessions?: Record<string, SessionEntry>;
}

/** Sessions not rendered for this long are pruned (and their uptime credited). */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
/** Upper bound on remembered sessions, oldest by lastSeen dropped first. */
const MAX_SESSIONS = 50;
/** How stale lastSeen may get before a render rewrites the file. */
const SEEN_REFRESH_MS = 60 * 1000;

function loadJSON<T>(file: string): T | null {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as T; }
  catch (err) {
    // ENOENT is normal on first run; only log real parse/IO failures.
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      logError('state.loadJSON:' + file, err);
    }
    return null;
  }
}

function saveJSON(file: string, data: unknown): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    atomicWrite(file, JSON.stringify(data));
  } catch (err) {
    logError('state.saveJSON:' + file, err);
  }
}

let diskState: DiskState = {};
/** The entry for the session this process renders. */
let current: SessionEntry | null = null;

function isEntry(e: unknown): e is SessionEntry {
  const o = e as SessionEntry;
  return !!o && typeof o === 'object'
    && Number.isFinite(o.sessionStart) && Number.isFinite(o.lastSeen)
    && Number.isFinite(o.creditedUntil)
    && Number.isInteger(o.animalIndex) && Number.isInteger(o.paletteIndex);
}

/** The valid entries of a loaded file, adopting a pre-`sessions` top level. */
function loadSessions(state: DiskState): Record<string, SessionEntry> {
  const out: Record<string, SessionEntry> = {};
  const raw = state.sessions;
  if (raw && typeof raw === 'object') {
    for (const [k, e] of Object.entries(raw)) if (isEntry(e)) out[k] = e;
  }
  // A file from an older codachi (or rewritten by one) carries its session
  // only at the top level; keep that session's identity rather than re-roll.
  const tp = state.transcriptPath;
  if (tp && !out[tp] && Number.isFinite(state.sessionStart)
      && Number.isInteger(state.animalIndex) && Number.isInteger(state.paletteIndex)) {
    const start = state.sessionStart as number;
    out[tp] = {
      sessionStart: start,
      lastSeen: Date.now(),
      // Nothing has credited this session's uptime yet: an older codachi
      // only does that when the next session starts.
      creditedUntil: start,
      animalIndex: state.animalIndex as number,
      paletteIndex: state.paletteIndex as number,
    };
  }
  return out;
}

/** Add a session's not-yet-credited uptime to memory, in whole minutes. */
function creditUptime(m: PetMemory, e: SessionEntry): void {
  const mins = Math.floor((e.lastSeen - e.creditedUntil) / 60000);
  if (mins > 0) {
    m.totalUptimeMin += mins;
    e.creditedUntil += mins * 60000;
  }
}

/** Drop sessions unseen for SESSION_TTL_MS, then the oldest beyond MAX_SESSIONS. */
function pruneSessions(sessions: Record<string, SessionEntry>, m: PetMemory, now: number): void {
  for (const [k, e] of Object.entries(sessions)) {
    if (now - e.lastSeen > SESSION_TTL_MS) {
      creditUptime(m, e);
      delete sessions[k];
    }
  }
  const keys = Object.keys(sessions).sort((a, b) => sessions[a].lastSeen - sessions[b].lastSeen);
  for (const k of keys.slice(0, Math.max(0, keys.length - MAX_SESSIONS))) {
    creditUptime(m, sessions[k]);
    delete sessions[k];
  }
}

export function initSession(transcriptPath?: string): void {
  diskState = migrateState(loadJSON<DiskState>(STATE_FILE));
  const sessions = loadSessions(diskState);
  const now = Date.now();
  const key = transcriptPath ?? '';
  const existing = transcriptPath ? sessions[key] : undefined;

  if (existing) {
    current = existing;
    if (now - existing.lastSeen < SEEN_REFRESH_MS && diskState.sessions) return;
    existing.lastSeen = now;
  } else {
    // A session this file has never seen: count it, give it an identity,
    // and clear stale events. Other sessions' entries are left alone.
    const m = loadMemory();
    for (const e of Object.values(sessions)) creditUptime(m, e);
    pruneSessions(sessions, m, now);
    countSession(m);
    current = {
      sessionStart: now,
      lastSeen: now,
      creditedUntil: now,
      animalIndex: Math.floor(Math.random() * 5),
      paletteIndex: Math.floor(Math.random() * 10),
    };
    sessions[key] = current;
    clearEvents();
    diskState = {
      transcriptPath: key,
      sessionStart: current.sessionStart,
      animalIndex: current.animalIndex,
      paletteIndex: current.paletteIndex,
    };
  }
  diskState = { ...diskState, version: STATE_SCHEMA_VERSION, sessions };
  saveJSON(STATE_FILE, diskState);
}

/** Forward-compatible state loader. Unknown/future versions fall back to defaults. */
function migrateState(raw: DiskState | null): DiskState {
  if (!raw) return {};
  const v = raw.version ?? 0;
  if (v === 0) {
    // Pre-versioned file: stamp with current version, keep fields as-is.
    return { ...raw, version: STATE_SCHEMA_VERSION };
  }
  if (v > STATE_SCHEMA_VERSION) {
    logError('state.migrate', new Error(`state file version ${v} newer than supported ${STATE_SCHEMA_VERSION}`));
    return {};
  }
  return raw;
}

export function getSessionAnimalIndex(): number { return current?.animalIndex ?? 0; }
export function getSessionPaletteIndex(): number { return current?.paletteIndex ?? 0; }

export function animTick(speedSec: number = 1.5): number {
  return Math.floor(Date.now() / (speedSec * 1000));
}
export function moodTick(): number { return Math.floor(Date.now() / 10000); }

export function sessionUptime(): string {
  const start = current?.sessionStart ?? Date.now();
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
  version?: number;
  totalSessions: number;
  totalUptimeMin: number;
  firstMet: number; // timestamp
  lastSeen: number;
  lastShownTier?: string; // for tier upgrade notifications
}

let memory: PetMemory | null = null;
let tierJustUpgraded: boolean = false;

function loadMemory(): PetMemory {
  const raw = loadJSON<PetMemory>(MEMORY_FILE);
  if (!raw) {
    return {
      version: MEMORY_SCHEMA_VERSION,
      totalSessions: 0,
      totalUptimeMin: 0,
      firstMet: Date.now(),
      lastSeen: Date.now(),
    };
  }
  const v = raw.version ?? 0;
  if (v > MEMORY_SCHEMA_VERSION) {
    logError('memory.migrate', new Error(`memory file version ${v} newer than supported ${MEMORY_SCHEMA_VERSION}`));
    // Don't wipe — preserve counts and stamp an unknown version so older clients
    // degrade gracefully while newer codachi takes over.
  }
  // Defensive floors in case disk is corrupted.
  return {
    version: MEMORY_SCHEMA_VERSION,
    totalSessions: Math.max(0, Number(raw.totalSessions) || 0),
    totalUptimeMin: Math.max(0, Number(raw.totalUptimeMin) || 0),
    firstMet: Number(raw.firstMet) || Date.now(),
    lastSeen: Number(raw.lastSeen) || Date.now(),
    lastShownTier: raw.lastShownTier,
  };
}

/** Count one new session in memory (already loaded and credited) and save it. */
function countSession(m: PetMemory): void {
  m.totalSessions += 1;
  m.lastSeen = Date.now();

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
