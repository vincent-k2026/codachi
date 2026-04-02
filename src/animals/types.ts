import type { BodySize, Animation, AnimalFrame } from '../types.js';
import { stringWidth } from '../width.js';

export interface AnimalDef {
  name: string;
  frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}

/** Build a frame from raw lines, calculating true terminal width. */
export function f(lines: string[]): AnimalFrame {
  const width = Math.max(...lines.map(l => stringWidth(l)));
  return { lines, width };
}

export function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, frameIndex: number): AnimalFrame {
  const frames = def.frames[size][anim];
  return frames[frameIndex % frames.length];
}
