import type { BodySize, Animation, AnimalFrame } from '../types.js';
import { stringWidth } from '../width.js';

export interface AnimalDef {
  name: string;
  frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}

/** Build a frame from raw lines. Auto-pads all lines to the same width. */
export function f(rawLines: string[]): AnimalFrame {
  const width = Math.max(...rawLines.map(l => stringWidth(l)));
  const lines = rawLines.map(l => {
    const pad = width - stringWidth(l);
    return pad > 0 ? l + ' '.repeat(pad) : l;
  });
  return { lines, width };
}

/** Pick a frame, ensuring all frames in this animation share the same width. */
export function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, frameIndex: number): AnimalFrame {
  const frames = def.frames[size][anim];
  const maxWidth = Math.max(...frames.map(fr => fr.width));
  const frame = frames[frameIndex % frames.length];
  if (frame.width === maxWidth) return frame;
  // Pad lines to maxWidth
  const lines = frame.lines.map(l => {
    const pad = maxWidth - stringWidth(l);
    return pad > 0 ? l + ' '.repeat(pad) : l;
  });
  return { lines, width: maxWidth };
}
