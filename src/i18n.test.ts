import { describe, it, expect, vi, beforeEach } from 'vitest';

// Disable plugin loading in tests.
process.env.CODACHI_NO_PLUGINS = '1';

let localize: typeof import('./i18n.js')['localize'];
let getLocale: typeof import('./i18n.js')['getLocale'];

const savedEnv = { ...process.env };

beforeEach(async () => {
  vi.resetModules();
  // Default: English locale, no plugins.
  delete process.env.CODACHI_LOCALE;
  delete process.env.LC_ALL;
  delete process.env.LANG;
  process.env.CODACHI_NO_PLUGINS = '1';
  const mod = await import('./i18n.js');
  localize = mod.localize;
  getLocale = mod.getLocale;
});

describe('getLocale', () => {
  it('defaults to en', () => {
    expect(getLocale()).toBe('en');
  });

  it('reads CODACHI_LOCALE', async () => {
    vi.resetModules();
    process.env.CODACHI_LOCALE = 'zh';
    process.env.CODACHI_NO_PLUGINS = '1';
    const mod = await import('./i18n.js');
    expect(mod.getLocale()).toBe('zh');
    delete process.env.CODACHI_LOCALE;
  });

  it('falls back to LANG', async () => {
    vi.resetModules();
    delete process.env.CODACHI_LOCALE;
    process.env.LANG = 'fr_FR.UTF-8';
    process.env.CODACHI_NO_PLUGINS = '1';
    const mod = await import('./i18n.js');
    expect(mod.getLocale()).toBe('fr');
    delete process.env.LANG;
  });
});

describe('localize', () => {
  it('returns fallback for en locale', () => {
    const fallback = ['hello', 'world'];
    expect(localize('TEST_KEY', fallback)).toBe(fallback);
  });

  it('returns fallback for unknown key', () => {
    const obj = { a: [1, 2], b: [3] };
    expect(localize('NONEXISTENT', obj)).toBe(obj);
  });

  it('preserves array type', () => {
    const arr = ['one', 'two', 'three'];
    const result = localize('KEY', arr);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(arr);
  });

  it('preserves object type', () => {
    const obj = { cat: ['meow'], dog: ['woof'] };
    const result = localize('KEY', obj);
    expect(typeof result).toBe('object');
    expect(result).toEqual(obj);
  });

  it('preserves string type', () => {
    expect(localize('KEY', 'hello')).toBe('hello');
  });

  it('preserves number type', () => {
    expect(localize('KEY', 42)).toBe(42);
  });
});

describe('merge behavior (via plugin store)', () => {
  it('plugin overrides are merged into defaults', async () => {
    vi.resetModules();
    process.env.CODACHI_NO_PLUGINS = '1';
    // Manually populate plugin store before importing i18n
    const store = await import('./plugin-store.js');
    store.PLUGIN_MESSAGES['TEST_POOL'] = ['plugin msg 1', 'plugin msg 2'];
    const mod = await import('./i18n.js');
    const result = mod.localize('TEST_POOL', ['default 1', 'default 2']);
    expect(result).toEqual(['plugin msg 1', 'plugin msg 2']);
    // Clean up
    delete store.PLUGIN_MESSAGES['TEST_POOL'];
  });

  it('plugin object overrides merge key-by-key', async () => {
    vi.resetModules();
    process.env.CODACHI_NO_PLUGINS = '1';
    const store = await import('./plugin-store.js');
    store.PLUGIN_MESSAGES['NESTED'] = { cat: ['custom cat'] };
    const mod = await import('./i18n.js');
    const result = mod.localize('NESTED', { cat: ['default cat'], dog: ['default dog'] });
    expect(result).toEqual({ cat: ['custom cat'], dog: ['default dog'] });
    delete store.PLUGIN_MESSAGES['NESTED'];
  });
});
