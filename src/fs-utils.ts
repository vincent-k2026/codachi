import fs from 'node:fs';
import { logError } from './log.js';

/** Atomic write: write to tmp file then rename. Prevents corruption on crash/concurrent access. */
export function atomicWrite(filePath: string, data: string): boolean {
  const tmp = filePath + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    logError('fs.atomicWrite', err);
    try { fs.unlinkSync(tmp); } catch { /* nothing to clean */ }
    return false;
  }
}
