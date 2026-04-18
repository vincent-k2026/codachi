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

describe('validateConfig', () => {
  let validateConfig: typeof import('./config.js')['validateConfig'];

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./config.js');
    validateConfig = mod.validateConfig;
  });

  it('returns empty for non-object input', () => {
    expect(validateConfig(null)).toEqual({});
    expect(validateConfig('string')).toEqual({});
    expect(validateConfig(42)).toEqual({});
    expect(validateConfig([1, 2])).toEqual({});
  });

  it('validates animal whitelist', () => {
    expect(validateConfig({ animal: 'cat' }).animal).toBe('cat');
    expect(validateConfig({ animal: 'owl' }).animal).toBe('owl');
    expect(validateConfig({ animal: 'dragon' }).animal).toBeUndefined();
    expect(validateConfig({ animal: 123 }).animal).toBeUndefined();
  });

  it('validates palette range 0-9', () => {
    expect(validateConfig({ palette: 0 }).palette).toBe(0);
    expect(validateConfig({ palette: 9 }).palette).toBe(9);
    expect(validateConfig({ palette: -1 }).palette).toBeUndefined();
    expect(validateConfig({ palette: 99 }).palette).toBeUndefined();
    expect(validateConfig({ palette: 1.5 }).palette).toBeUndefined();
    expect(validateConfig({ palette: 'red' }).palette).toBeUndefined();
  });

  it('validates widgets whitelist', () => {
    const cfg = validateConfig({ widgets: ['model', 'context', 'invalid'] });
    expect(cfg.widgets).toEqual(['model', 'context']);
  });

  it('rejects non-array widgets', () => {
    expect(validateConfig({ widgets: 'model' }).widgets).toBeUndefined();
  });

  it('validates boolean flags', () => {
    const cfg = validateConfig({ showTokens: false, showVelocity: true, showGit: false });
    expect(cfg.showTokens).toBe(false);
    expect(cfg.showVelocity).toBe(true);
    expect(cfg.showGit).toBe(false);
  });

  it('rejects non-boolean flags', () => {
    const cfg = validateConfig({ showTokens: 1, showGit: 'yes' });
    expect(cfg.showTokens).toBeUndefined();
    expect(cfg.showGit).toBeUndefined();
  });

  it('validates animationSpeed range', () => {
    expect(validateConfig({ animationSpeed: 1.5 }).animationSpeed).toBe(1.5);
    expect(validateConfig({ animationSpeed: 0 }).animationSpeed).toBeUndefined();
    expect(validateConfig({ animationSpeed: -1 }).animationSpeed).toBeUndefined();
    expect(validateConfig({ animationSpeed: 100 }).animationSpeed).toBeUndefined();
    expect(validateConfig({ animationSpeed: 'fast' }).animationSpeed).toBeUndefined();
  });

  it('validates name with truncation', () => {
    expect(validateConfig({ name: 'Mochi' }).name).toBe('Mochi');
    expect(validateConfig({ name: 'A'.repeat(50) }).name).toBe('A'.repeat(32));
    expect(validateConfig({ name: '   ' }).name).toBeUndefined();
    expect(validateConfig({ name: '' }).name).toBeUndefined();
    expect(validateConfig({ name: 42 }).name).toBeUndefined();
  });

  it('passes through valid full config', () => {
    const full = {
      name: 'Mochi',
      animal: 'bunny' as const,
      palette: 3,
      widgets: ['model', 'context'],
      showTokens: true,
      showVelocity: false,
      showGit: true,
      animationSpeed: 2.0,
    };
    expect(validateConfig(full)).toEqual(full);
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
