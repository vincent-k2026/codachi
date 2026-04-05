import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./config.js', () => ({
  getConfig: vi.fn(() => ({})),
}));

vi.mock('./state.js', () => ({
  getSessionAnimalIndex: vi.fn(() => 0),
  getSessionPaletteIndex: vi.fn(() => 0),
}));

import { getConfig } from './config.js';
import { getSessionAnimalIndex, getSessionPaletteIndex } from './state.js';

let getAnimalType: typeof import('./identity.js')['getAnimalType'];
let getPetColors: typeof import('./identity.js')['getPetColors'];

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();

  // Re-setup mocks after resetModules
  vi.mocked(getConfig).mockReturnValue({});
  vi.mocked(getSessionAnimalIndex).mockReturnValue(0);
  vi.mocked(getSessionPaletteIndex).mockReturnValue(0);

  const mod = await import('./identity.js');
  getAnimalType = mod.getAnimalType;
  getPetColors = mod.getPetColors;
});

describe('getAnimalType', () => {
  it('returns configured animal', () => {
    vi.mocked(getConfig).mockReturnValue({ animal: 'owl' });
    expect(getAnimalType()).toBe('owl');
  });

  it('uses session index when no config', () => {
    vi.mocked(getConfig).mockReturnValue({});
    vi.mocked(getSessionAnimalIndex).mockReturnValue(2);
    expect(getAnimalType()).toBe('owl'); // index 2 = owl
  });

  it('wraps around with modulo', () => {
    vi.mocked(getConfig).mockReturnValue({});
    vi.mocked(getSessionAnimalIndex).mockReturnValue(7);
    // 7 % 5 = 2 = owl
    expect(getAnimalType()).toBe('owl');
  });

  it('ignores invalid animal in config', () => {
    vi.mocked(getConfig).mockReturnValue({ animal: 'dragon' as never });
    vi.mocked(getSessionAnimalIndex).mockReturnValue(1);
    expect(getAnimalType()).toBe('penguin'); // falls back to index
  });
});

describe('getPetColors', () => {
  it('returns colors object', () => {
    const colors = getPetColors();
    expect(colors).toHaveProperty('body');
    expect(colors).toHaveProperty('accent');
    expect(colors).toHaveProperty('face');
    expect(colors).toHaveProperty('blush');
  });

  it('returns ANSI escape in colors', () => {
    const colors = getPetColors();
    expect(colors.body).toContain('\x1b[38;2;');
  });

  it('uses configured palette', () => {
    vi.mocked(getConfig).mockReturnValue({ palette: 5 });
    const colors = getPetColors();
    // Palette 5 = Golden Sun
    expect(colors.body).toContain('255');
  });

  it('uses session palette when no config', () => {
    vi.mocked(getConfig).mockReturnValue({});
    vi.mocked(getSessionPaletteIndex).mockReturnValue(3);
    const colors = getPetColors();
    expect(colors.body).toBeTruthy();
  });

  it('ignores out-of-range palette in config', () => {
    vi.mocked(getConfig).mockReturnValue({ palette: 99 });
    const colors = getPetColors();
    expect(colors.body).toBeTruthy(); // falls back to session index
  });
});
