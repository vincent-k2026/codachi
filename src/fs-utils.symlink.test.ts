// Real-filesystem tests for atomicWrite and symlinks. fs-utils.test.ts mocks
// node:fs for the whole module, so link behaviour needs a file of its own.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { atomicWrite } from './fs-utils.js';

let dir: string;

beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codachi-fs-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

describe('atomicWrite with symlinks', () => {
  it('keeps a symlinked file linked and updates its target', () => {
    const target = path.join(dir, 'synced', 'memory.json');
    fs.mkdirSync(path.dirname(target));
    fs.writeFileSync(target, '{"totalSessions":1}');
    const link = path.join(dir, 'memory.json');
    fs.symlinkSync(target, link);

    expect(atomicWrite(link, '{"totalSessions":2}')).toBe(true);

    expect(fs.lstatSync(link).isSymbolicLink()).toBe(true);
    expect(fs.readFileSync(target, 'utf8')).toBe('{"totalSessions":2}');
  });

  it('follows a relative link', () => {
    fs.mkdirSync(path.join(dir, 'synced'));
    fs.writeFileSync(path.join(dir, 'synced', 'state.json'), '{}');
    const link = path.join(dir, 'state.json');
    fs.symlinkSync(path.join('synced', 'state.json'), link);

    expect(atomicWrite(link, '{"v":1}')).toBe(true);

    expect(fs.lstatSync(link).isSymbolicLink()).toBe(true);
    expect(fs.readFileSync(path.join(dir, 'synced', 'state.json'), 'utf8')).toBe('{"v":1}');
  });

  it('creates the target of a dangling link instead of replacing the link', () => {
    fs.mkdirSync(path.join(dir, 'synced'));
    const target = path.join(dir, 'synced', 'memory.json');
    const link = path.join(dir, 'memory.json');
    fs.symlinkSync(target, link);

    expect(atomicWrite(link, '{"new":true}')).toBe(true);

    expect(fs.lstatSync(link).isSymbolicLink()).toBe(true);
    expect(fs.readFileSync(target, 'utf8')).toBe('{"new":true}');
  });

  it('still writes plain files, and leaves no temp files behind', () => {
    const file = path.join(dir, 'events.json');
    expect(atomicWrite(file, '{"events":[]}')).toBe(true);
    expect(fs.lstatSync(file).isFile()).toBe(true);
    expect(fs.readFileSync(file, 'utf8')).toBe('{"events":[]}');
    expect(fs.readdirSync(dir)).toEqual(['events.json']);
  });
});
