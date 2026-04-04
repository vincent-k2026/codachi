import type { BodySize, Animation, AnimalFrame } from '../types.js';
import { stringWidth } from '../width.js';

export type { AnimalFrame };

export interface AnimalDef {
  name: string;
  frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}

/**
 * Build a frame from content lines + optional tail character.
 * Each line is auto-centered to the widest line's width.
 * The tail is placed to the right of the first line, outside the centered area.
 */
export function f(contentLines: string[], tail: string = ''): AnimalFrame {
  // First, find the max content width (ignoring tail)
  const contentWidths = contentLines.map(l => stringWidth(l));
  const maxContent = Math.max(...contentWidths);

  // Center each line within maxContent width
  const centered = contentLines.map(l => {
    const w = stringWidth(l);
    const totalPad = maxContent - w;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return ' '.repeat(leftPad) + l + ' '.repeat(rightPad);
  });

  // Add tail to first line, pad others to match
  const tailStr = tail || ' ';
  const lines = centered.map((l, i) => i === 0 ? l + tailStr : l + ' '.repeat(stringWidth(tailStr)));
  const width = Math.max(...lines.map(l => stringWidth(l)));

  return { lines, width };
}

/** Pick a frame. Normalizes all frames in the same animation to equal width. */
export function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, tick: number): AnimalFrame {
  const frames = def.frames[size][anim];
  const maxWidth = Math.max(...frames.map(fr => fr.width));
  const frame = frames[tick % frames.length];
  if (frame.width === maxWidth) return frame;
  const lines = frame.lines.map(l => {
    const pad = maxWidth - stringWidth(l);
    return pad > 0 ? l + ' '.repeat(pad) : l;
  });
  return { lines, width: maxWidth };
}
