import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

process.env.FORCE_COLOR = '3';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    renameSync: vi.fn(),
    statSync: vi.fn(() => { throw new Error('ENOENT'); }),
    appendFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);
let consoleSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetAllMocks();
  consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('runStats', () => {
  it('prints no-data message when no memory file exists', async () => {
    mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
    vi.resetModules();
    const { runStats } = await import('./stats.js');
    runStats();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No codachi memory'));
  });

  it('prints stats when memory exists', async () => {
    const callNum: Record<string, number> = {};
    mockReadFileSync.mockImplementation((p: any) => {
      const file = String(p);
      callNum[file] = (callNum[file] || 0) + 1;
      if (file.includes('memory.json')) {
        return JSON.stringify({
          totalSessions: 25,
          totalUptimeMin: 600,
          firstMet: Date.now() - 30 * 86400_000,
          lastSeen: Date.now() - 3600_000,
        });
      }
      if (file.includes('state.json')) {
        return JSON.stringify({
          animalIndex: 0,
          paletteIndex: 0,
          sessionStart: Date.now() - 3600_000,
        });
      }
      if (file.includes('events.json')) {
        return JSON.stringify({ events: [
          { type: 'bash', detail: 'vitest run', ok: true, ts: Date.now() - 1000 },
          { type: 'bash', detail: 'vitest run', ok: false, ts: Date.now() - 2000 },
          { type: 'bash', detail: 'git commit -m "fix auth"', ok: true, ts: Date.now() - 3000 },
          { type: 'edit', detail: 'foo.ts', ok: true, ts: Date.now() - 4000 },
        ] });
      }
      if (file.includes('config.json')) {
        throw new Error('ENOENT');
      }
      throw new Error('ENOENT');
    });
    vi.resetModules();
    const { runStats } = await import('./stats.js');
    runStats();
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('25');          // sessions
    expect(output).toContain('friend');      // tier for 25 sessions
    expect(output).toContain('10h');         // 600min uptime
    expect(output).toContain('1 pass');      // test pass count
    expect(output).toContain('1 fail');      // test fail count
  });

  it('correctly computes relationship tier progress', async () => {
    mockReadFileSync.mockImplementation((p: any) => {
      if (String(p).includes('memory.json')) {
        return JSON.stringify({
          totalSessions: 3,
          totalUptimeMin: 30,
          firstMet: Date.now() - 86400_000,
          lastSeen: Date.now(),
        });
      }
      throw new Error('ENOENT');
    });
    vi.resetModules();
    const { runStats } = await import('./stats.js');
    runStats();
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('acquaintance');
    expect(output).toContain('friend');       // next tier
    expect(output).toContain('12 more');      // 15 - 3 = 12
  });

  it('shows max tier for bestie', async () => {
    mockReadFileSync.mockImplementation((p: any) => {
      if (String(p).includes('memory.json')) {
        return JSON.stringify({
          totalSessions: 100,
          totalUptimeMin: 5000,
          firstMet: Date.now() - 365 * 86400_000,
          lastSeen: Date.now(),
        });
      }
      throw new Error('ENOENT');
    });
    vi.resetModules();
    const { runStats } = await import('./stats.js');
    runStats();
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('bestie');
    expect(output).toContain('max tier');
  });
});
