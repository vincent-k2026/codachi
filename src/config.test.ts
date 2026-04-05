import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);

// Need fresh module for each test since config is cached
let loadConfig: typeof import('./config.js')['loadConfig'];
let getConfig: typeof import('./config.js')['getConfig'];

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  const mod = await import('./config.js');
  loadConfig = mod.loadConfig;
  getConfig = mod.getConfig;
});

describe('loadConfig', () => {
  it('returns empty config when no file found', () => {
    mockReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
    const cfg = loadConfig();
    expect(cfg).toEqual({});
  });

  it('loads config from file', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({ animal: 'cat', palette: 3 }));
    const cfg = loadConfig();
    expect(cfg.animal).toBe('cat');
    expect(cfg.palette).toBe(3);
  });

  it('handles invalid JSON', () => {
    mockReadFileSync.mockReturnValue('not json');
    const cfg = loadConfig();
    expect(cfg).toEqual({});
  });

  it('loads all config options', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({
      animal: 'owl',
      palette: 5,
      showTokens: false,
      showVelocity: false,
      showCache: true,
      showUptime: true,
      showGit: false,
      animationSpeed: 2.0,
    }));
    const cfg = loadConfig();
    expect(cfg.animal).toBe('owl');
    expect(cfg.showGit).toBe(false);
    expect(cfg.animationSpeed).toBe(2.0);
  });
});

describe('getConfig', () => {
  it('returns cached config', () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({ animal: 'bunny' }));
    loadConfig();
    const cfg = getConfig();
    expect(cfg.animal).toBe('bunny');
  });

  it('returns empty config before loadConfig', () => {
    const cfg = getConfig();
    expect(cfg).toEqual({});
  });
});
