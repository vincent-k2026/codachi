#!/usr/bin/env node
/**
 * Post-build asset copier. tsc only emits .ts → .js, so anything else that
 * needs to ship (JSON locales, etc.) is copied here.
 *
 * Keeps build behavior declarative and avoids pulling in a bundler just to
 * copy three files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

copyDir(path.join(root, 'src', 'locales'), path.join(root, 'dist', 'locales'));
