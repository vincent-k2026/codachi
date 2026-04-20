/**
 * Tests for runInit / runUninstall — covers the settings.json shape codachi
 * writes, migration of legacy PostToolExecution entries, idempotency, and
 * preservation of user-configured hooks from other tools.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let tmpHome: string;

beforeEach(() => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'codachi-init-'));
  vi.spyOn(os, 'homedir').mockReturnValue(tmpHome);
  // Pretend we're running from an npx cache so detectMode() returns bin mode —
  // that keeps the assertions stable across machines.
  process.argv = ['node', path.join(os.tmpdir(), '_npx', 'x', 'bin', 'codachi'), 'init'];
});

afterEach(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
  vi.restoreAllMocks();
});

async function importFresh() {
  vi.resetModules();
  return (await import('./init.js')) as typeof import('./init.js');
}

function readSettings(): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(tmpHome, '.claude', 'settings.json'), 'utf8'));
}

describe('runInit', () => {
  it('writes the hook under PostToolUse (not PostToolExecution)', async () => {
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.hooks).toBeDefined();
    expect(s.hooks.PostToolUse).toBeDefined();
    expect(s.hooks.PostToolExecution).toBeUndefined();
  });

  it('writes hook entries in the canonical {matcher, hooks: [{type, command}]} shape', async () => {
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    const entry = s.hooks.PostToolUse[0];
    expect(entry).toMatchObject({
      matcher: '',
      hooks: [{ type: 'command', command: 'codachi-hook' }],
    });
  });

  it('sets the statusLine command', async () => {
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.statusLine).toEqual({ type: 'command', command: 'codachi' });
  });

  it('migrates legacy PostToolExecution entries onto PostToolUse', async () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({
        hooks: {
          PostToolExecution: [{ matcher: '', command: 'codachi-hook' }],
        },
      }),
    );
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.hooks.PostToolExecution).toBeUndefined();
    expect(s.hooks.PostToolUse).toHaveLength(1);
    expect(s.hooks.PostToolUse[0].hooks[0].command).toBe('codachi-hook');
  });

  it('is idempotent — running twice leaves exactly one codachi entry', async () => {
    const { runInit } = await importFresh();
    runInit();
    runInit();
    const s = readSettings();
    expect(s.hooks.PostToolUse).toHaveLength(1);
  });

  it('replaces a legacy flat-shape codachi entry with the wrapped form', async () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({
        hooks: {
          PostToolUse: [{ matcher: '', command: 'codachi-hook' }],
        },
      }),
    );
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.hooks.PostToolUse).toHaveLength(1);
    expect(s.hooks.PostToolUse[0].hooks).toEqual([
      { type: 'command', command: 'codachi-hook' },
    ]);
  });

  it('preserves unrelated PostToolUse entries from other tools', async () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    const otherHook = {
      matcher: 'Bash',
      hooks: [{ type: 'command', command: '/some/other-hook.sh' }],
    };
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({ hooks: { PostToolUse: [otherHook] } }),
    );
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.hooks.PostToolUse).toHaveLength(2);
    expect(s.hooks.PostToolUse).toContainEqual(otherHook);
  });

  it('preserves unrelated top-level settings keys', async () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({ mcpServers: { foo: { type: 'sse', url: 'http://x' } } }),
    );
    const { runInit } = await importFresh();
    runInit();
    const s = readSettings();
    expect(s.mcpServers).toEqual({ foo: { type: 'sse', url: 'http://x' } });
  });
});

describe('runUninstall', () => {
  it('removes the codachi hook from PostToolUse', async () => {
    const { runInit, runUninstall } = await importFresh();
    runInit();
    runUninstall();
    const s = readSettings();
    expect(s.hooks).toBeUndefined();
    expect(s.statusLine).toBeUndefined();
  });

  it('also cleans up any lingering PostToolExecution entries', async () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({
        statusLine: { type: 'command', command: 'codachi' },
        hooks: {
          PostToolExecution: [{ matcher: '', command: 'codachi-hook' }],
        },
      }),
    );
    const { runUninstall } = await importFresh();
    runUninstall();
    const s = readSettings();
    expect(s.hooks).toBeUndefined();
    expect(s.statusLine).toBeUndefined();
  });

  it('preserves other hooks during uninstall', async () => {
    const otherHook = {
      matcher: 'Write',
      hooks: [{ type: 'command', command: '/other/pre.sh' }],
    };
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.claude', 'settings.json'),
      JSON.stringify({ hooks: { PreToolUse: [otherHook] } }),
    );
    const { runInit, runUninstall } = await importFresh();
    runInit();
    runUninstall();
    const s = readSettings();
    expect(s.hooks.PreToolUse).toEqual([otherHook]);
    expect(s.hooks.PostToolUse).toBeUndefined();
  });
});
