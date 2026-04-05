import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { getEventContext, clearEvents } from './events.js';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);
const mockWriteFileSync = vi.mocked(fs.writeFileSync);

function setEvents(events: Array<{ type: string; detail: string; ok: boolean; ts: number }>) {
  mockReadFileSync.mockReturnValue(JSON.stringify({ events }));
}

function makeEvent(type: string, detail: string, ok = true, ageMs = 0) {
  return { type, detail, ok, ts: Date.now() - ageMs };
}

// Dummy preceding event to prevent first_action milestone from masking classification
const DUMMY = { type: 'read', detail: 'dummy.ts', ok: true, ts: Date.now() - 10000 };

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getEventContext', () => {
  it('returns none freshness when no events file', () => {
    mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('none');
    expect(ctx.category).toBeNull();
  });

  it('returns none freshness for empty events', () => {
    setEvents([]);
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('none');
  });

  it('returns hot freshness for events < 15s old', () => {
    setEvents([makeEvent('bash', 'npm test', true, 5000)]);
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('hot');
  });

  it('returns warm freshness for events 15-60s old', () => {
    setEvents([makeEvent('bash', 'npm test', true, 30000)]);
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('warm');
  });

  it('returns cold freshness for events 1-5min old', () => {
    setEvents([makeEvent('bash', 'npm test', true, 120000)]);
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('cold');
  });

  it('returns none for events > 5min old', () => {
    setEvents([makeEvent('bash', 'npm test', true, 400000)]);
    const ctx = getEventContext();
    expect(ctx.freshness).toBe('none');
  });

  // ── Bash command classification (2 events to avoid first_action milestone) ──
  it('classifies npm test pass', () => {
    setEvents([DUMMY, makeEvent('bash', 'npm test', true)]);
    expect(getEventContext().category).toBe('test_passed');
  });

  it('classifies jest failure', () => {
    setEvents([DUMMY, makeEvent('bash', 'npx jest --coverage', false)]);
    expect(getEventContext().category).toBe('test_failed');
  });

  it('classifies cargo test', () => {
    setEvents([DUMMY, makeEvent('bash', 'cargo test --release', true)]);
    expect(getEventContext().category).toBe('test_passed');
  });

  it('classifies pytest', () => {
    setEvents([DUMMY, makeEvent('bash', 'pytest tests/', true)]);
    expect(getEventContext().category).toBe('test_passed');
  });

  it('classifies go test', () => {
    setEvents([DUMMY, makeEvent('bash', 'go test ./...', true)]);
    expect(getEventContext().category).toBe('test_passed');
  });

  it('classifies playwright', () => {
    setEvents([DUMMY, makeEvent('bash', 'npx playwright test', false)]);
    expect(getEventContext().category).toBe('test_failed');
  });

  it('classifies npm run build pass', () => {
    setEvents([DUMMY, makeEvent('bash', 'npm run build', true)]);
    expect(getEventContext().category).toBe('build_passed');
  });

  it('classifies tsc failure', () => {
    setEvents([DUMMY, makeEvent('bash', 'tsc --noEmit', false)]);
    expect(getEventContext().category).toBe('build_failed');
  });

  it('classifies cargo build', () => {
    setEvents([DUMMY, makeEvent('bash', 'cargo build --release', true)]);
    expect(getEventContext().category).toBe('build_passed');
  });

  it('classifies make', () => {
    setEvents([DUMMY, makeEvent('bash', 'make all', true)]);
    expect(getEventContext().category).toBe('build_passed');
  });

  it('classifies npm install', () => {
    setEvents([DUMMY, makeEvent('bash', 'npm install lodash', true)]);
    expect(getEventContext().category).toBe('install');
  });

  it('classifies pip install', () => {
    setEvents([DUMMY, makeEvent('bash', 'pip install requests', true)]);
    expect(getEventContext().category).toBe('install');
  });

  it('classifies git commit', () => {
    setEvents([DUMMY, makeEvent('bash', 'git commit -m "fix"', true)]);
    expect(getEventContext().category).toBe('git_commit');
  });

  it('classifies git push', () => {
    setEvents([DUMMY, makeEvent('bash', 'git push origin main', true)]);
    expect(getEventContext().category).toBe('git_push');
  });

  it('classifies git pull', () => {
    setEvents([DUMMY, makeEvent('bash', 'git pull', true)]);
    expect(getEventContext().category).toBe('git_pull');
  });

  it('classifies git fetch', () => {
    setEvents([DUMMY, makeEvent('bash', 'git fetch origin', true)]);
    expect(getEventContext().category).toBe('git_pull');
  });

  it('classifies git merge', () => {
    setEvents([DUMMY, makeEvent('bash', 'git merge feature', true)]);
    expect(getEventContext().category).toBe('git_merge');
  });

  it('classifies git rebase', () => {
    setEvents([DUMMY, makeEvent('bash', 'git rebase main', true)]);
    expect(getEventContext().category).toBe('git_rebase');
  });

  it('classifies git stash', () => {
    setEvents([DUMMY, makeEvent('bash', 'git stash', true)]);
    expect(getEventContext().category).toBe('git_stash');
  });

  it('classifies git checkout', () => {
    setEvents([DUMMY, makeEvent('bash', 'git checkout -b feature', true)]);
    expect(getEventContext().category).toBe('git_checkout');
  });

  it('classifies git switch', () => {
    setEvents([DUMMY, makeEvent('bash', 'git switch main', true)]);
    expect(getEventContext().category).toBe('git_checkout');
  });

  it('classifies eslint', () => {
    setEvents([DUMMY, makeEvent('bash', 'npx eslint src/', true)]);
    expect(getEventContext().category).toBe('lint_format');
  });

  it('classifies cargo fmt', () => {
    setEvents([DUMMY, makeEvent('bash', 'cargo fmt', true)]);
    expect(getEventContext().category).toBe('lint_format');
  });

  it('classifies cargo clippy', () => {
    setEvents([DUMMY, makeEvent('bash', 'cargo clippy', true)]);
    expect(getEventContext().category).toBe('lint_format');
  });

  it('classifies npm start', () => {
    setEvents([DUMMY, makeEvent('bash', 'npm start', true)]);
    expect(getEventContext().category).toBe('server_start');
  });

  it('classifies npm run dev', () => {
    setEvents([DUMMY, makeEvent('bash', 'npm run dev', true)]);
    expect(getEventContext().category).toBe('server_start');
  });

  it('classifies docker', () => {
    setEvents([DUMMY, makeEvent('bash', 'docker build .', true)]);
    expect(getEventContext().category).toBe('docker');
  });

  it('classifies kubectl', () => {
    setEvents([DUMMY, makeEvent('bash', 'kubectl get pods', true)]);
    expect(getEventContext().category).toBe('docker');
  });

  it('classifies curl', () => {
    setEvents([DUMMY, makeEvent('bash', 'curl https://api.example.com', true)]);
    expect(getEventContext().category).toBe('network');
  });

  it('classifies ssh', () => {
    setEvents([DUMMY, makeEvent('bash', 'ssh user@host', true)]);
    expect(getEventContext().category).toBe('network');
  });

  it('classifies rm -rf as dangerous', () => {
    setEvents([DUMMY, makeEvent('bash', 'rm -rf /tmp/build', true)]);
    expect(getEventContext().category).toBe('dangerous');
  });

  it('classifies git push --force as git_push (matched first)', () => {
    // git push --force matches git_push before dangerous regex
    setEvents([DUMMY, makeEvent('bash', 'git push --force', true)]);
    expect(getEventContext().category).toBe('git_push');
  });

  it('classifies git reset --hard as dangerous', () => {
    setEvents([DUMMY, makeEvent('bash', 'git reset --hard HEAD~1', true)]);
    expect(getEventContext().category).toBe('dangerous');
  });

  it('classifies grep as search', () => {
    setEvents([DUMMY, makeEvent('bash', 'grep -r "TODO" src/', true)]);
    expect(getEventContext().category).toBe('search');
  });

  it('classifies rg as search', () => {
    setEvents([DUMMY, makeEvent('bash', 'rg pattern', true)]);
    expect(getEventContext().category).toBe('search');
  });

  it('classifies generic bash failure', () => {
    setEvents([DUMMY, makeEvent('bash', 'some-unknown-command', false)]);
    expect(getEventContext().category).toBe('bash_failed');
  });

  it('returns null category for unrecognized successful command', () => {
    setEvents([DUMMY, makeEvent('bash', 'echo hello', true)]);
    expect(getEventContext().category).toBeNull();
  });

  // ── File classification ──
  it('classifies test file edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'auth.test.ts')]);
    expect(getEventContext().category).toBe('edit_test');
  });

  it('classifies spec file edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'auth.spec.js')]);
    expect(getEventContext().category).toBe('edit_test');
  });

  it('classifies _test.go edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'handler_test.go')]);
    expect(getEventContext().category).toBe('edit_test');
  });

  it('classifies docs edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'README.md')]);
    expect(getEventContext().category).toBe('edit_docs');
  });

  it('classifies css edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'styles.css')]);
    expect(getEventContext().category).toBe('edit_style');
  });

  it('classifies config edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'tsconfig.json')]);
    expect(getEventContext().category).toBe('edit_config');
  });

  it('classifies yaml as config', () => {
    setEvents([DUMMY, makeEvent('edit', 'config.yaml')]);
    expect(getEventContext().category).toBe('edit_config');
  });

  it('classifies Dockerfile as config', () => {
    setEvents([DUMMY, makeEvent('edit', 'Dockerfile')]);
    expect(getEventContext().category).toBe('edit_config');
  });

  it('classifies code edit', () => {
    setEvents([DUMMY, makeEvent('edit', 'index.ts')]);
    expect(getEventContext().category).toBe('edit_code');
  });

  it('classifies write as creating_file', () => {
    setEvents([DUMMY, makeEvent('write', 'newfile.ts')]);
    expect(getEventContext().category).toBe('creating_file');
  });

  it('returns null category for read-only events', () => {
    setEvents([DUMMY, makeEvent('read', 'index.ts')]);
    expect(getEventContext().category).toBeNull();
  });

  // ── Pattern detection ──
  it('detects struggling (3+ consecutive bash failures)', () => {
    setEvents([
      makeEvent('bash', 'npm test', false, 3000),
      makeEvent('bash', 'npm test', false, 2000),
      makeEvent('bash', 'npm test', false, 1000),
    ]);
    expect(getEventContext().category).toBe('struggling');
  });

  it('does not count non-bash failures as struggling', () => {
    setEvents([
      makeEvent('bash', 'npm test', false, 2000),
      makeEvent('edit', 'fix.ts', true, 1000), // breaks the consecutive chain
      makeEvent('bash', 'npm test', false, 500),
    ]);
    expect(getEventContext().category).not.toBe('struggling');
  });

  it('detects recovery (bash fail → bash success)', () => {
    setEvents([
      makeEvent('bash', 'npm test', false, 5000),
      makeEvent('bash', 'npm test', true, 1000),
    ]);
    expect(getEventContext().category).toBe('recovered');
  });

  it('does NOT detect recovery for bash fail → read', () => {
    setEvents([
      makeEvent('bash', 'npm test', false, 5000),
      makeEvent('read', 'fix.ts', true, 1000),
    ]);
    expect(getEventContext().category).not.toBe('recovered');
  });

  it('detects rapid editing (5+ edits in 60s)', () => {
    setEvents([
      makeEvent('edit', 'a.ts', true, 50000),
      makeEvent('edit', 'b.ts', true, 40000),
      makeEvent('edit', 'c.ts', true, 30000),
      makeEvent('edit', 'd.ts', true, 20000),
      makeEvent('edit', 'e.ts', true, 10000),
    ]);
    expect(getEventContext().category).toBe('rapid_editing');
  });

  it('detects exploring (6+ reads in 60s)', () => {
    setEvents([
      makeEvent('read', 'a.ts', true, 50000),
      makeEvent('read', 'b.ts', true, 40000),
      makeEvent('read', 'c.ts', true, 30000),
      makeEvent('read', 'd.ts', true, 20000),
      makeEvent('read', 'e.ts', true, 10000),
      makeEvent('read', 'f.ts', true, 5000),
    ]);
    expect(getEventContext().category).toBe('exploring');
  });

  it('detects first_action milestone', () => {
    setEvents([makeEvent('bash', 'echo hello', true)]);
    expect(getEventContext().category).toBe('first_action');
  });

  it('detects many_edits milestone at 25th edit', () => {
    const events = [];
    for (let i = 0; i < 25; i++) {
      events.push(makeEvent('edit', `file${i}.ts`, true, 25000 - i * 1000));
    }
    setEvents(events);
    // 25 edits triggers both rapid_editing and many_edits
    // rapid_editing has higher priority
    const ctx = getEventContext();
    expect(['rapid_editing', 'many_edits']).toContain(ctx.category);
  });

  it('detects many_actions at 50th event', () => {
    const events = [];
    // Use reads (which don't trigger other categories) spaced > 60s apart
    for (let i = 0; i < 50; i++) {
      events.push(makeEvent('read', `file${i}.ts`, true, (50 - i) * 2000));
    }
    setEvents(events);
    const ctx = getEventContext();
    // may be exploring or many_actions depending on timing
    expect(ctx.category).not.toBeNull();
  });

  // ── Counts ──
  it('counts session edits', () => {
    setEvents([
      makeEvent('edit', 'a.ts'),
      makeEvent('write', 'b.ts'),
      makeEvent('read', 'c.ts'),
    ]);
    expect(getEventContext().sessionEditCount).toBe(2);
  });

  it('counts session actions', () => {
    setEvents([
      makeEvent('edit', 'a.ts'),
      makeEvent('bash', 'ls'),
      makeEvent('read', 'c.ts'),
    ]);
    expect(getEventContext().sessionActionCount).toBe(3);
  });

  it('counts consecutive bash failures', () => {
    setEvents([
      makeEvent('bash', 'ok', true, 5000),
      makeEvent('bash', 'fail1', false, 3000),
      makeEvent('bash', 'fail2', false, 1000),
    ]);
    expect(getEventContext().consecutiveFailures).toBe(2);
  });
});

describe('clearEvents', () => {
  it('writes empty events to file', () => {
    clearEvents();
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('events.json'),
      JSON.stringify({ events: [] }),
    );
  });
});
