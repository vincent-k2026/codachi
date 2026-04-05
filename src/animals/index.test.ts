import { describe, it, expect } from 'vitest';
import { getAnimalName, getAnimalFrame, getBodySize, getAnimation, ANIMAL_COUNT } from './index.js';

describe('ANIMAL_COUNT', () => {
  it('has 5 animals', () => {
    expect(ANIMAL_COUNT).toBe(5);
  });
});

describe('getAnimalName', () => {
  it('returns correct names', () => {
    expect(getAnimalName('cat')).toBe('Cat');
    expect(getAnimalName('penguin')).toBe('Penguin');
    expect(getAnimalName('owl')).toBe('Owl');
    expect(getAnimalName('octopus')).toBe('Octopus');
    expect(getAnimalName('bunny')).toBe('Bunny');
  });
});

describe('getBodySize', () => {
  it('returns tiny for < 20%', () => {
    expect(getBodySize(0)).toBe('tiny');
    expect(getBodySize(19)).toBe('tiny');
  });

  it('returns small for 20-39%', () => {
    expect(getBodySize(20)).toBe('small');
    expect(getBodySize(39)).toBe('small');
  });

  it('returns medium for 40-59%', () => {
    expect(getBodySize(40)).toBe('medium');
    expect(getBodySize(59)).toBe('medium');
  });

  it('returns chubby for 60-79%', () => {
    expect(getBodySize(60)).toBe('chubby');
    expect(getBodySize(79)).toBe('chubby');
  });

  it('returns thicc for >= 80%', () => {
    expect(getBodySize(80)).toBe('thicc');
    expect(getBodySize(100)).toBe('thicc');
  });
});

describe('getAnimation', () => {
  it('returns danger at >= 85%', () => {
    expect(getAnimation(85, false)).toBe('danger');
    expect(getAnimation(100, true)).toBe('danger');
  });

  it('returns busy when tools running', () => {
    expect(getAnimation(50, true)).toBe('busy');
  });

  it('returns sleep at < 10%', () => {
    expect(getAnimation(5, false)).toBe('sleep');
    expect(getAnimation(0, false)).toBe('sleep');
  });

  it('returns idle for normal state', () => {
    expect(getAnimation(50, false)).toBe('idle');
  });

  it('danger overrides busy', () => {
    expect(getAnimation(90, true)).toBe('danger');
  });
});

describe('getAnimalFrame', () => {
  const animals = ['cat', 'penguin', 'owl', 'octopus', 'bunny'] as const;
  const sizes = ['tiny', 'small', 'medium', 'chubby', 'thicc'] as const;
  const anims = ['idle', 'busy', 'danger', 'sleep'] as const;

  for (const animal of animals) {
    it(`returns valid frame for ${animal}`, () => {
      const frame = getAnimalFrame(animal, 'medium', 'idle', 0);
      expect(frame.lines).toHaveLength(3);
      expect(frame.width).toBeGreaterThan(0);
    });
  }

  for (const size of sizes) {
    it(`returns frame for size ${size}`, () => {
      const frame = getAnimalFrame('cat', size, 'idle', 0);
      expect(frame.lines).toHaveLength(3);
    });
  }

  for (const anim of anims) {
    it(`returns frame for animation ${anim}`, () => {
      const frame = getAnimalFrame('cat', 'medium', anim, 0);
      expect(frame.lines).toHaveLength(3);
    });
  }

  it('different ticks produce different frames for idle', () => {
    const f0 = getAnimalFrame('cat', 'medium', 'idle', 0);
    const f1 = getAnimalFrame('cat', 'medium', 'idle', 1);
    // At least the tail or eyes should differ
    const allSame = f0.lines.every((l, i) => l === f1.lines[i]);
    expect(allSame).toBe(false);
  });
});
