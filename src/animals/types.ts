import type { BodySize, Animation } from '../types.js';
import type { SpriteGrid } from '../render/sprite.js';

export interface AnimalDef {
  name: string;
  sprites: Record<BodySize, Record<Animation, SpriteGrid[]>>;
}

export function pickSprite(def: AnimalDef, size: BodySize, anim: Animation, tick: number): SpriteGrid {
  const frames = def.sprites[size][anim];
  return frames[tick % frames.length];
}
