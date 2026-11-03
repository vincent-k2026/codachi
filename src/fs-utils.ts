import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { logError } from './log.js';

/**
 * The file a write to `filePath` should replace. When `filePath` is a
 * symlink (e.g. memory.json linked into a synced folder), the rename must
 * land on the file it points to: renaming onto the link itself would
 * replace the link with a regular file and silently stop the syncing.
 */
function writeTarget(filePath: string): string {
  try {
    return fs.realpathSync(filePath);
  } catch {
    // Missing file (the usual first-run case), or a link whose target does
    // not exist yet: write where the link points rather than replacing it.
    try {
      if (fs.lstatSync(filePath).isSymbolicLink()) {
        return path.resolve(path.dirname(filePath), fs.readlinkSync(filePath));
      }
    } catch { /* not there at all */ }
    return filePath;
  }
}

/**
 * Atomic write: write to tmp file then rename. Prevents corruption on
 * crash/concurrent access. Symlinks are followed, so a linked file stays
 * linked.
 */
export function atomicWrite(filePath: string, data: string): boolean {
  const target = writeTarget(filePath);
  const tmp = target + '.tmp.' + crypto.randomUUID();
  try {
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, target);
    return true;
  } catch (err) {
    logError('fs.atomicWrite', err);
    try { fs.unlinkSync(tmp); } catch { /* nothing to clean */ }
    return false;
  }
}
