import type { BodySize, Animation, AnimalFrame } from '../types.js';

export interface AnimalDef {
  name: string;
  frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}

export function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, frameIndex: number): AnimalFrame {
  const frames = def.frames[size][anim];
  return frames[frameIndex % frames.length];
}
