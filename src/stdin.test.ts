import { describe, it, expect, vi } from 'vitest';
import { getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage, getTokenSummary, getCacheHitRate } from './stdin.js';
import type { StdinData } from './types.js';

function makeStdin(overrides: Partial<StdinData> = {}): StdinData {
  return {
    model: { display_name: 'Claude Opus 4.6' },
    context_window: {
      used_percentage: 55,
      context_window_size: 1_000_000,
      current_usage: {
        input_tokens: 50000,
        cache_read_input_tokens: 80000,
        cache_creation_input_tokens: 20000,
      },
    },
    ...overrides,
  };
}

describe('getContextPercent', () => {
  it('returns used_percentage when available', () => {
    expect(getContextPercent(makeStdin())).toBe(55);
  });

  it('clamps to 0-100', () => {
    expect(getContextPercent(makeStdin({ context_window: { used_percentage: 150 } }))).toBe(100);
    expect(getContextPercent(makeStdin({ context_window: { used_percentage: -5 } }))).toBe(0);
  });

  it('calculates from token counts when used_percentage missing', () => {
    const stdin = makeStdin({
      context_window: {
        context_window_size: 100_000,
        current_usage: {
          input_tokens: 10000,
          cache_read_input_tokens: 20000,
          cache_creation_input_tokens: 5000,
        },
      },
    });
    expect(getContextPercent(stdin)).toBe(35); // (10k+20k+5k)/100k = 35%
  });

  it('returns 0 when no data', () => {
    expect(getContextPercent({})).toBe(0);
    expect(getContextPercent({ context_window: {} })).toBe(0);
    expect(getContextPercent({ context_window: { context_window_size: 0 } })).toBe(0);
  });
});

describe('getModelName', () => {
  it('strips "Claude " prefix', () => {
    expect(getModelName(makeStdin())).toBe('Opus 4.6');
  });

  it('strips parenthetical metadata', () => {
    expect(getModelName({ model: { display_name: 'Claude Opus 4.6 (1M context)' } })).toBe('Opus 4.6');
  });

  it('uses id as fallback', () => {
    expect(getModelName({ model: { id: 'claude-opus-4-6' } })).toBe('claude-opus-4-6');
  });

  it('returns Unknown when no model data', () => {
    expect(getModelName({})).toBe('Unknown');
  });
});

describe('getFiveHourUsage', () => {
  it('returns usage with reset time', () => {
    const futureTs = Math.floor(Date.now() / 1000) + 3600; // 1h from now
    const result = getFiveHourUsage({
      rate_limits: { five_hour: { used_percentage: 50, resets_at: futureTs } },
    });
    expect(result).not.toBeNull();
    expect(result!.percent).toBe(50);
    expect(result!.resetsIn).toMatch(/^\d+m$|^\d+h/);
  });

  it('returns null when no data', () => {
    expect(getFiveHourUsage({})).toBeNull();
    expect(getFiveHourUsage({ rate_limits: {} })).toBeNull();
  });

  it('clamps percent to 0-100', () => {
    const result = getFiveHourUsage({
      rate_limits: { five_hour: { used_percentage: 120 } },
    });
    expect(result!.percent).toBe(100);
  });
});

describe('getSevenDayUsage', () => {
  it('returns usage data', () => {
    const result = getSevenDayUsage({
      rate_limits: { seven_day: { used_percentage: 30 } },
    });
    expect(result!.percent).toBe(30);
  });

  it('returns null when no data', () => {
    expect(getSevenDayUsage({})).toBeNull();
  });

  it('includes reset time for future timestamps', () => {
    const futureTs = Math.floor(Date.now() / 1000) + 90000; // ~25h from now
    const result = getSevenDayUsage({
      rate_limits: { seven_day: { used_percentage: 60, resets_at: futureTs } },
    });
    expect(result!.resetsIn).toMatch(/^\d+d|^\d+h/);
  });

  it('returns null resetsIn for past timestamps', () => {
    const result = getSevenDayUsage({
      rate_limits: { seven_day: { used_percentage: 60, resets_at: 1000 } },
    });
    expect(result!.resetsIn).toBeNull();
  });
});

describe('getTokenSummary', () => {
  it('returns formatted summary', () => {
    expect(getTokenSummary(makeStdin())).toBe('150K/1.0M');
  });

  it('returns null when no usage data', () => {
    expect(getTokenSummary({})).toBeNull();
    expect(getTokenSummary({ context_window: {} })).toBeNull();
  });

  it('returns null when zero used tokens', () => {
    expect(getTokenSummary({
      context_window: {
        context_window_size: 1000000,
        current_usage: { input_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
      },
    })).toBeNull();
  });

  it('formats K for thousands', () => {
    expect(getTokenSummary({
      context_window: {
        context_window_size: 200000,
        current_usage: { input_tokens: 5500 },
      },
    })).toBe('6K/200K');
  });

  it('formats small numbers directly', () => {
    expect(getTokenSummary({
      context_window: {
        context_window_size: 500,
        current_usage: { input_tokens: 100 },
      },
    })).toBe('100/500');
  });
});

describe('getCacheHitRate', () => {
  it('calculates hit rate', () => {
    expect(getCacheHitRate(makeStdin())).toBe(80); // 80k/(80k+20k)
  });

  it('returns null with no usage data', () => {
    expect(getCacheHitRate({})).toBeNull();
  });

  it('returns null when zero total cache', () => {
    expect(getCacheHitRate({
      context_window: {
        current_usage: { cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
      },
    })).toBeNull();
  });

  it('returns 100 when all cache reads', () => {
    expect(getCacheHitRate({
      context_window: {
        current_usage: { cache_read_input_tokens: 1000, cache_creation_input_tokens: 0 },
      },
    })).toBe(100);
  });
});
