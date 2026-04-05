import fs from 'node:fs';

/** Atomic write: write to tmp file then rename. Prevents corruption on crash/concurrent access. */
export function atomicWrite(filePath: string, data: string): void {
  const tmp = filePath + '.tmp';
  try {
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, filePath);
  } catch {
    // Cleanup tmp on failure
    try { fs.unlinkSync(tmp); } catch { /* best-effort */ }
  }
}
