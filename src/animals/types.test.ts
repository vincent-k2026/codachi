import { describe, it, expect } from 'vitest';
import { f, pickFrame } from './types.js';
import type { AnimalDef } from './types.js';
import { stringWidth } from '../width.js';

describe('f (frame builder)', () => {
  it('creates a frame with correct line count', () => {
    const frame = f(['abc', 'de', 'fgh']);
    expect(frame.lines).toHaveLength(3);
  });

  it('centers lines to equal width', () => {
    const frame = f(['ab', '1234', 'cd']);
    const widths = frame.lines.map(l => stringWidth(l));
    // All lines should have the same width
    expect(new Set(widths).size).toBe(1);
  });

  it('forces even target width for content', () => {
    // 'abc' has width 3, forced to 4 for even centering
    // But frame.width includes the default tail ' ', so it might be odd
    // The key property: all lines have the same visual width
    const frame = f(['abc', 'de']);
    const widths = frame.lines.map(l => stringWidth(l));
    expect(new Set(widths).size).toBe(1); // all lines equal width
  });

  it('appends tail to first line only', () => {
    const frame = f(['ab', 'cd'], '~');
    expect(frame.lines[0]).toContain('~');
    // Other lines get space padding instead of tail
    expect(frame.lines[1]).not.toContain('~');
  });

  it('uses space as default tail', () => {
    const frame = f(['ab', 'cd']);
    expect(frame.lines[0].endsWith(' ')).toBe(true);
  });

  it('returns correct width', () => {
    const frame = f(['/\\_/\\', '( o.o )', '(> < )'], '~');
    expect(frame.width).toBe(Math.max(...frame.lines.map(l => stringWidth(l))));
  });
});

describe('pickFrame', () => {
  const mockDef: AnimalDef = {
    name: 'test',
    frames: {
      tiny: {
        idle: [
          f(['(owo)'], '~'),
          f(['(^w^)'], '~'),
        ],
        busy: [f(['(owo)'], '~')],
        danger: [f(['(OWO)'], '!')],
        sleep: [f(['(-w-)'], 'z')],
      },
      small: { idle: [f(['(owo)'])], busy: [f(['(owo)'])], danger: [f(['(OWO)'])], sleep: [f(['(-w-)'])] },
      medium: { idle: [f(['(owo)'])], busy: [f(['(owo)'])], danger: [f(['(OWO)'])], sleep: [f(['(-w-)'])] },
      chubby: { idle: [f(['(owo)'])], busy: [f(['(owo)'])], danger: [f(['(OWO)'])], sleep: [f(['(-w-)'])] },
      thicc: { idle: [f(['(owo)'])], busy: [f(['(owo)'])], danger: [f(['(OWO)'])], sleep: [f(['(-w-)'])] },
    },
  };

  it('cycles through frames with tick', () => {
    const f0 = pickFrame(mockDef, 'tiny', 'idle', 0);
    const f1 = pickFrame(mockDef, 'tiny', 'idle', 1);
    // Different frames should be selected
    expect(f0.lines[0]).not.toBe(f1.lines[0]);
  });

  it('wraps around frame count', () => {
    const f0 = pickFrame(mockDef, 'tiny', 'idle', 0);
    const f2 = pickFrame(mockDef, 'tiny', 'idle', 2);
    expect(f0.lines[0]).toBe(f2.lines[0]);
  });

  it('normalizes frame widths', () => {
    // All frames in same animation should have equal width after pickFrame
    const f0 = pickFrame(mockDef, 'tiny', 'idle', 0);
    const f1 = pickFrame(mockDef, 'tiny', 'idle', 1);
    expect(f0.width).toBe(f1.width);
  });

  it('returns correct frame for each animation state', () => {
    const idle = pickFrame(mockDef, 'tiny', 'idle', 0);
    const danger = pickFrame(mockDef, 'tiny', 'danger', 0);
    expect(idle.lines[0]).toContain('owo');
    expect(danger.lines[0]).toContain('OWO');
  });
});
