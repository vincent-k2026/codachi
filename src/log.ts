/**
 * Lightweight error log. codachi runs inside Claude Code's statusline, so it
 * must never write to stdout/stderr during a normal render — failures instead
 * land in ~/.claude/plugins/codachi/codachi.log and are rotated at 256KB.
 *
 * Usage:
 *   import { logError } from './log.js';
 *   try { ... } catch (e) { logError('git.compute', e); }
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const LOG_DIR = path.join(os.homedir(), '.claude', 'plugins', 'codachi');
const LOG_FILE = path.join(LOG_DIR, 'codachi.log');
const MAX_LOG_BYTES = 256 * 1024;

// Disable logging entirely with CODACHI_QUIET=1; enable verbose info with CODACHI_DEBUG=1.
const QUIET = process.env.CODACHI_QUIET === '1';
const DEBUG = process.env.CODACHI_DEBUG === '1';

function writeLine(level: string, scope: string, msg: string): void {
  if (QUIET) return;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    // Rotate if too big.
    try {
      const st = fs.statSync(LOG_FILE);
      if (st.size > MAX_LOG_BYTES) {
        fs.renameSync(LOG_FILE, LOG_FILE + '.1');
      }
    } catch { /* no existing file */ }
    const line = `${new Date().toISOString()} ${level} ${scope}: ${msg}\n`;
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // Last-resort: we're in the statusline, there is nowhere else to go.
  }
}

export function logError(scope: string, err: unknown): void {
  const msg = err instanceof Error ? `${err.message}${err.stack ? '\n' + err.stack : ''}` : String(err);
  writeLine('ERROR', scope, msg);
}

export function logWarn(scope: string, msg: string): void {
  writeLine('WARN', scope, msg);
}

export function logDebug(scope: string, msg: string): void {
  if (!DEBUG) return;
  writeLine('DEBUG', scope, msg);
}

export const LOG_PATH = LOG_FILE;
