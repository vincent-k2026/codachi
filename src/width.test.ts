import { describe, it, expect } from 'vitest';
import { charWidth, stringWidth } from './width.js';

describe('charWidth', () => {
  it('returns 1 for ASCII printable', () => {
    expect(charWidth('a')).toBe(1);
    expect(charWidth('Z')).toBe(1);
    expect(charWidth('0')).toBe(1);
    expect(charWidth(' ')).toBe(1);
    expect(charWidth('~')).toBe(1);
  });

  it('returns 0 for control characters', () => {
    expect(charWidth('\0')).toBe(0);
    expect(charWidth('\t')).toBe(0);
    expect(charWidth('\n')).toBe(0);
  });

  it('returns 2 for CJK characters', () => {
    expect(charWidth('你')).toBe(2);
    expect(charWidth('好')).toBe(2);
    expect(charWidth('猫')).toBe(2);
  });

  it('returns 2 for fullwidth ASCII', () => {
    expect(charWidth('Ａ')).toBe(2); // U+FF21
  });

  it('returns 2 for emoji', () => {
    expect(charWidth('🐱')).toBe(2);
  });

  it('returns 1 for Latin extended characters', () => {
    expect(charWidth('é')).toBe(1);
    expect(charWidth('ñ')).toBe(1);
  });

  it('returns 0 for empty string', () => {
    expect(charWidth('')).toBe(0);
  });
});

describe('stringWidth', () => {
  it('returns length for ASCII strings', () => {
    expect(stringWidth('hello')).toBe(5);
    expect(stringWidth('')).toBe(0);
    expect(stringWidth('a')).toBe(1);
  });

  it('handles CJK strings', () => {
    expect(stringWidth('你好')).toBe(4);
    expect(stringWidth('ab你好cd')).toBe(8);
  });

  it('ignores ANSI escape codes', () => {
    expect(stringWidth('\x1b[31mred\x1b[0m')).toBe(3);
    expect(stringWidth('\x1b[38;2;255;0;0mcolor\x1b[0m')).toBe(5);
    expect(stringWidth('\x1b[2m\x1b[0m')).toBe(0);
  });

  it('handles mixed content', () => {
    expect(stringWidth('\x1b[31m你好\x1b[0m world')).toBe(10);
  });
});
