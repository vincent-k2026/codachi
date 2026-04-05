import { describe, it, expect } from 'vitest';
import { rgb, RESET, DIM, getContextColor, getUsageColor, progressBar } from './colors.js';

describe('rgb', () => {
  it('returns ANSI 24-bit color escape', () => {
    expect(rgb(255, 0, 0)).toBe('\x1b[38;2;255;0;0m');
    expect(rgb(0, 128, 255)).toBe('\x1b[38;2;0;128;255m');
  });
});

describe('constants', () => {
  it('exports RESET and DIM', () => {
    expect(RESET).toBe('\x1b[0m');
    expect(DIM).toBe('\x1b[2m');
  });
});

describe('getContextColor', () => {
  it('returns red for >= 85%', () => {
    expect(getContextColor(85)).toBe(rgb(255, 80, 80));
    expect(getContextColor(100)).toBe(rgb(255, 80, 80));
  });

  it('returns orange for 70-84%', () => {
    expect(getContextColor(70)).toBe(rgb(255, 200, 50));
    expect(getContextColor(84)).toBe(rgb(255, 200, 50));
  });

  it('returns green for < 70%', () => {
    expect(getContextColor(0)).toBe(rgb(80, 220, 120));
    expect(getContextColor(69)).toBe(rgb(80, 220, 120));
  });
});

describe('getUsageColor', () => {
  it('returns red for >= 90%', () => {
    expect(getUsageColor(90)).toBe(rgb(255, 80, 80));
  });

  it('returns purple for 75-89%', () => {
    expect(getUsageColor(75)).toBe(rgb(200, 100, 255));
  });

  it('returns blue for < 75%', () => {
    expect(getUsageColor(50)).toBe(rgb(100, 150, 255));
  });
});

describe('progressBar', () => {
  it('returns bar with correct filled/empty ratio', () => {
    const bar = progressBar(50, 10, getContextColor);
    expect(bar).toContain('█'.repeat(5));
    expect(bar).toContain('░'.repeat(5));
  });

  it('handles 0%', () => {
    const bar = progressBar(0, 10, getContextColor);
    expect(bar).toContain('░'.repeat(10));
    expect(bar).not.toContain('█');
  });

  it('handles 100%', () => {
    const bar = progressBar(100, 10, getContextColor);
    expect(bar).toContain('█'.repeat(10));
  });

  it('uses color function for styling', () => {
    const bar = progressBar(90, 5, getContextColor);
    expect(bar).toContain(rgb(255, 80, 80));
    expect(bar).toContain(RESET);
  });
});
