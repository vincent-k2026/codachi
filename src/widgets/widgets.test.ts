import { describe, it, expect } from 'vitest';
import { WIDGET_REGISTRY, renderWidgetLine, resolveWidgetOrder, DEFAULT_WIDGET_ORDER } from './index.js';
import type { WidgetContext } from './index.js';
import { rgb } from '../render/colors.js';

function makeCtx(overrides: Partial<WidgetContext> = {}): WidgetContext {
  return {
    contextPercent: 50,
    modelName: 'Opus 4.6',
    tokenSummary: null,
    contextVelocity: 0,
    contextTimeRemaining: null,
    fiveHourUsage: null,
    sevenDayUsage: null,
    colors: {
      body: rgb(255, 127, 80),
      accent: rgb(255, 99, 71),
      face: rgb(255, 200, 150),
      blush: rgb(255, 160, 122),
    },
    ...overrides,
  };
}

describe('modelWidget', () => {
  it('renders model name in brackets', () => {
    const out = WIDGET_REGISTRY.model.render(makeCtx());
    expect(out).toContain('[Opus 4.6]');
  });

  it('returns empty string when modelName is empty', () => {
    expect(WIDGET_REGISTRY.model.render(makeCtx({ modelName: '' }))).toBe('');
  });
});

describe('contextWidget', () => {
  it('renders percentage', () => {
    const out = WIDGET_REGISTRY.context.render(makeCtx({ contextPercent: 55 }));
    expect(out).toContain('55%');
  });

  it('includes token summary when provided', () => {
    const out = WIDGET_REGISTRY.context.render(makeCtx({ tokenSummary: '550K/1M' }));
    expect(out).toContain('550K/1M');
  });

  it('omits token summary when null', () => {
    const out = WIDGET_REGISTRY.context.render(makeCtx({ tokenSummary: null }));
    expect(out).not.toContain('/');
  });
});

describe('velocityWidget', () => {
  it('shows velocity when > 0.5', () => {
    const out = WIDGET_REGISTRY.velocity.render(makeCtx({ contextVelocity: 3 }));
    expect(out).toContain('^3%/m');
  });

  it('shows time remaining when provided', () => {
    const out = WIDGET_REGISTRY.velocity.render(makeCtx({ contextVelocity: 3, contextTimeRemaining: '~15m' }));
    expect(out).toContain('~15m');
  });

  it('returns empty when no data', () => {
    expect(WIDGET_REGISTRY.velocity.render(makeCtx({ contextVelocity: 0 }))).toBe('');
  });

  it('hides velocity when <= 0.5', () => {
    const out = WIDGET_REGISTRY.velocity.render(makeCtx({ contextVelocity: 0.3 }));
    expect(out).not.toContain('%/m');
  });
});

describe('rateLimit widgets', () => {
  it('renders 5h rate limit', () => {
    const out = WIDGET_REGISTRY.rateLimit5h.render(makeCtx({
      fiveHourUsage: { percent: 32, resetsIn: '2h' },
    }));
    expect(out).toContain('5h');
    expect(out).toContain('32%');
    expect(out).toContain('~2h');
  });

  it('renders 7d rate limit', () => {
    const out = WIDGET_REGISTRY.rateLimit7d.render(makeCtx({
      sevenDayUsage: { percent: 8, resetsIn: '5d' },
    }));
    expect(out).toContain('7d');
    expect(out).toContain('8%');
  });

  it('returns empty when no data', () => {
    expect(WIDGET_REGISTRY.rateLimit5h.render(makeCtx())).toBe('');
    expect(WIDGET_REGISTRY.rateLimit7d.render(makeCtx())).toBe('');
  });
});

describe('renderWidgetLine', () => {
  it('joins widgets with separator', () => {
    const out = renderWidgetLine(['model', 'context'], makeCtx());
    expect(out).toContain('[Opus 4.6]');
    expect(out).toContain('50%');
    expect(out).toContain('|');
  });

  it('skips empty widgets', () => {
    const out = renderWidgetLine(['model', 'velocity'], makeCtx());
    // velocity is empty (no data), so no separator should appear
    expect(out).toContain('[Opus 4.6]');
    expect(out).not.toMatch(/\|.*\|/); // no double separator
  });

  it('ignores unknown widget ids', () => {
    // @ts-expect-error — testing runtime behavior with bad input
    const out = renderWidgetLine(['model', 'nonexistent'], makeCtx());
    expect(out).toContain('[Opus 4.6]');
  });
});

describe('resolveWidgetOrder', () => {
  it('returns default order when config is empty', () => {
    expect(resolveWidgetOrder()).toEqual(DEFAULT_WIDGET_ORDER);
    expect(resolveWidgetOrder([])).toEqual(DEFAULT_WIDGET_ORDER);
  });

  it('returns config order when valid', () => {
    expect(resolveWidgetOrder(['context', 'model'])).toEqual(['context', 'model']);
  });

  it('filters out unknown widget ids', () => {
    expect(resolveWidgetOrder(['model', 'bogus', 'context'])).toEqual(['model', 'context']);
  });
});
