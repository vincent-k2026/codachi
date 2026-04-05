import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
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
