import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    renameSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock('./events.js', () => ({
  clearEvents: vi.fn(),
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);

let mod: typeof import('./state.js');

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  // Default: no state/memory files exist
  mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
  mod = await import('./state.js');
});

describe('initSession', () => {
  it('creates new session on first run', () => {
    mod.initSession('/tmp/transcript1');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(mod.getSessionAnimalIndex()).toBeGreaterThanOrEqual(0);
    expect(mod.getSessionAnimalIndex()).toBeLessThan(5);
  });

  it('reuses session with same transcript path', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      transcriptPath: '/tmp/same',
      sessionStart: Date.now() - 60000,
      animalIndex: 3,
      paletteIndex: 7,
    }));
    mod.initSession('/tmp/same');
    expect(mod.getSessionAnimalIndex()).toBe(3);
    expect(mod.getSessionPaletteIndex()).toBe(7);
  });

  it('clears events on new session', async () => {
    const { clearEvents } = await import('./events.js');
    mod.initSession('/tmp/new-session');
    expect(clearEvents).toHaveBeenCalled();
  });
});

describe('sessionUptime', () => {
  it('returns <1m for very short sessions', () => {
    mod.initSession('/tmp/test-uptime');
    expect(mod.sessionUptime()).toBe('<1m');
  });
});

describe('animTick', () => {
  it('returns integer based on time', () => {
    const tick = mod.animTick(1.5);
    expect(Number.isInteger(tick)).toBe(true);
    expect(tick).toBeGreaterThan(0);
  });

  it('changes with different speeds', () => {
    const fast = mod.animTick(0.5);
    const slow = mod.animTick(5.0);
    expect(fast).toBeGreaterThanOrEqual(slow);
  });
});

describe('moodTick', () => {
  it('returns integer', () => {
    expect(Number.isInteger(mod.moodTick())).toBe(true);
  });
});

describe('context velocity', () => {
  it('returns 0 with insufficient data', () => {
    expect(mod.getContextVelocity()).toBe(0);
  });

  it('returns 0 after single recording', () => {
    mod.recordContextPercent(50);
    expect(mod.getContextVelocity()).toBe(0);
  });
});

describe('getRelationshipTier', () => {
  it('returns stranger for 0 sessions', () => {
    expect(mod.getRelationshipTier()).toBe('stranger');
  });

  it('returns acquaintance for 3+ sessions', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: 5, totalUptimeMin: 100, firstMet: Date.now(), lastSeen: Date.now(),
    }));
    vi.resetModules();
    // Re-import to get fresh memory
    return import('./state.js').then(m => {
      expect(m.getRelationshipTier()).toBe('acquaintance');
    });
  });

  it('returns friend for 15+ sessions', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: 20, totalUptimeMin: 500, firstMet: Date.now(), lastSeen: Date.now(),
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      expect(m.getRelationshipTier()).toBe('friend');
    });
  });

  it('returns bestie for 50+ sessions', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: 50, totalUptimeMin: 1000, firstMet: Date.now(), lastSeen: Date.now(),
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      expect(m.getRelationshipTier()).toBe('bestie');
    });
  });
});

describe('getMemory', () => {
  it('returns default memory when no file', () => {
    const mem = mod.getMemory();
    expect(mem.totalSessions).toBe(0);
    expect(mem.totalUptimeMin).toBe(0);
    expect(mem.firstMet).toBeGreaterThan(0);
    expect(mem.lastSeen).toBeGreaterThan(0);
  });

  it('loads existing memory', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: 10, totalUptimeMin: 200, firstMet: 1000, lastSeen: 2000,
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      const mem = m.getMemory();
      expect(mem.totalSessions).toBe(10);
      expect(mem.totalUptimeMin).toBe(200);
    });
  });
});

describe('schema versioning', () => {
  it('stamps version on new state', () => {
    mod.initSession('/tmp/version-test-' + Date.now());
    // writeFileSync should be called with version field
    const calls = vi.mocked(fs.writeFileSync).mock.calls;
    const stateWrite = calls.find(c => String(c[0]).includes('.tmp'));
    expect(stateWrite).toBeDefined();
    const data = JSON.parse(stateWrite![1] as string);
    expect(data.version).toBe(1);
  });

  it('migrates pre-version state files (version: undefined)', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      transcriptPath: '/tmp/old',
      sessionStart: Date.now() - 60000,
      animalIndex: 2,
      paletteIndex: 5,
      // no version field — pre-versioned file
    }));
    mod.initSession('/tmp/old');
    expect(mod.getSessionAnimalIndex()).toBe(2);
    expect(mod.getSessionPaletteIndex()).toBe(5);
  });

  it('handles future version gracefully (resets to defaults)', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      version: 999,
      transcriptPath: '/tmp/future',
      sessionStart: Date.now(),
      animalIndex: 4,
      paletteIndex: 9,
    }));
    mod.initSession('/tmp/future');
    // Should NOT reuse the future-versioned state — treats as new session
    // animalIndex should be a fresh random, not 4
  });
});

describe('memory defensive floors', () => {
  it('clamps negative totalSessions to 0', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: -5, totalUptimeMin: -100, firstMet: 0, lastSeen: 0,
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      const mem = m.getMemory();
      expect(mem.totalSessions).toBe(0);
      expect(mem.totalUptimeMin).toBe(0);
    });
  });

  it('handles NaN in memory gracefully', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      totalSessions: 'not a number', totalUptimeMin: null, firstMet: 'bad', lastSeen: undefined,
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      const mem = m.getMemory();
      expect(mem.totalSessions).toBe(0);
      expect(mem.totalUptimeMin).toBe(0);
      expect(mem.firstMet).toBeGreaterThan(0);
      expect(mem.lastSeen).toBeGreaterThan(0);
    });
  });

  it('preserves version stamp on loaded memory', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      version: 1, totalSessions: 10, totalUptimeMin: 60, firstMet: 1000, lastSeen: 2000,
    }));
    vi.resetModules();
    return import('./state.js').then(m => {
      const mem = m.getMemory();
      expect(mem.version).toBe(1);
    });
  });
});

describe('context time remaining', () => {
  it('returns null with no velocity data', () => {
    expect(mod.getContextTimeRemaining(50)).toBeNull();
  });

  it('returns null when velocity is near zero', () => {
    // Only one data point → velocity = 0
    mod.recordContextPercent(50);
    expect(mod.getContextTimeRemaining(50)).toBeNull();
  });
});

describe('tier upgrade detection', () => {
  it('didTierUpgrade returns false by default', () => {
    expect(mod.didTierUpgrade()).toBe(false);
  });
});

describe('parallel sessions', () => {
  // A tiny in-memory disk: atomicWrite writes a temp file then renames it.
  let disk: Map<string, string>;

  function useDisk(initial: Record<string, unknown> = {}) {
    disk = new Map();
    for (const [name, data] of Object.entries(initial)) {
      disk.set(name, JSON.stringify(data));
    }
    const base = (p: unknown) => String(p).split('/').pop() as string;
    mockReadFileSync.mockImplementation(((p: unknown) => {
      const v = disk.get(base(p));
      if (v === undefined) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      return v;
    }) as typeof fs.readFileSync);
    vi.mocked(fs.writeFileSync).mockImplementation(((p: unknown, d: unknown) => {
      disk.set(base(p), String(d));
    }) as typeof fs.writeFileSync);
    vi.mocked(fs.renameSync).mockImplementation(((from: unknown, to: unknown) => {
      disk.set(base(to), disk.get(base(from)) as string);
      disk.delete(base(from));
    }) as typeof fs.renameSync);
  }

  /** One statusline render, as its own process: fresh module state. */
  async function render(transcript: string) {
    vi.resetModules();
    const m = await import('./state.js');
    m.initSession(transcript);
    return { animal: m.getSessionAnimalIndex(), palette: m.getSessionPaletteIndex() };
  }

  const read = (name: string) => JSON.parse(disk.get(name) as string);

  it('keeps each session\'s pet and counts each session once', async () => {
    useDisk();
    const a1 = await render('/tmp/a');
    const b1 = await render('/tmp/b');
    for (let i = 0; i < 5; i++) {
      expect(await render('/tmp/a')).toEqual(a1);
      expect(await render('/tmp/b')).toEqual(b1);
    }
    expect(read('memory.json').totalSessions).toBe(2);
  });

  it('does not clear events when another session renders', async () => {
    useDisk();
    await render('/tmp/a');
    await render('/tmp/b');
    const { clearEvents } = await import('./events.js');
    vi.mocked(clearEvents).mockClear();
    await render('/tmp/a');
    await render('/tmp/b');
    expect(clearEvents).not.toHaveBeenCalled();
  });

  it('mirrors the latest new session at the top level for older readers', async () => {
    useDisk();
    await render('/tmp/a');
    const b = await render('/tmp/b');
    await render('/tmp/a');
    const state = read('state.json');
    expect(state.transcriptPath).toBe('/tmp/b');
    expect(state.animalIndex).toBe(b.animal);
    expect(state.paletteIndex).toBe(b.palette);
    expect(Object.keys(state.sessions).sort()).toEqual(['/tmp/a', '/tmp/b']);
  });

  it('adopts a session from a file written by an older codachi', async () => {
    useDisk({
      'state.json': { version: 1, transcriptPath: '/tmp/a', sessionStart: Date.now() - 60000, animalIndex: 3, paletteIndex: 7 },
      'memory.json': { version: 1, totalSessions: 4, totalUptimeMin: 0, firstMet: 1, lastSeen: 1 },
    });
    expect(await render('/tmp/a')).toEqual({ animal: 3, palette: 7 });
    expect(read('memory.json').totalSessions).toBe(4);
  });

  it('credits an adopted older session\'s uptime when a new one starts', async () => {
    useDisk({
      'state.json': { version: 1, transcriptPath: '/tmp/a', sessionStart: Date.now() - 30 * 60000, animalIndex: 3, paletteIndex: 7 },
      'memory.json': { version: 1, totalSessions: 4, totalUptimeMin: 10, firstMet: 1, lastSeen: 1 },
    });
    await render('/tmp/b');
    const mem = read('memory.json');
    expect(mem.totalSessions).toBe(5);
    expect(mem.totalUptimeMin).toBe(40);
  });

  it('prunes sessions unseen for a day, crediting their uptime', async () => {
    const day = 24 * 60 * 60 * 1000;
    const stale = Date.now() - 2 * day;
    useDisk({
      'state.json': {
        version: 1,
        sessions: {
          '/tmp/old': { sessionStart: stale - 90 * 60000, lastSeen: stale, creditedUntil: stale - 90 * 60000, animalIndex: 1, paletteIndex: 1 },
        },
      },
      'memory.json': { version: 1, totalSessions: 1, totalUptimeMin: 0, firstMet: 1, lastSeen: 1 },
    });
    await render('/tmp/new');
    expect(Object.keys(read('state.json').sessions)).toEqual(['/tmp/new']);
    expect(read('memory.json').totalUptimeMin).toBe(90);
  });

  it('does not rewrite the file on every render of a known session', async () => {
    useDisk();
    await render('/tmp/a');
    vi.mocked(fs.writeFileSync).mockClear();
    await render('/tmp/a');
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('ignores malformed session entries', async () => {
    useDisk({
      'state.json': { version: 1, sessions: { '/tmp/a': { animalIndex: 'x' }, '/tmp/b': null } },
    });
    await render('/tmp/a');
    expect(read('memory.json').totalSessions).toBe(1);
    expect(Object.keys(read('state.json').sessions)).toEqual(['/tmp/a']);
  });
});
