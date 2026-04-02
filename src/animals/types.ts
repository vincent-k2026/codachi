import type { BodySize, Animation, AnimalFrame } from '../types.js';
import { stringWidth } from '../width.js';

export type { AnimalFrame };

export interface AnimalDef {
  name: string;
  frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}

/** Build a frame. Auto-pads all lines to the widest line's width. */
export function f(rawLines: string[]): AnimalFrame {
  const width = Math.max(...rawLines.map(l => stringWidth(l)));
  const lines = rawLines.map(l => {
    const pad = width - stringWidth(l);
    return pad > 0 ? l + ' '.repeat(pad) : l;
  });
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
