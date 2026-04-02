import type { AnimalType, BodySize, Animation } from '../types.js';
import type { AnimalDef } from './types.js';
import type { SpriteGrid } from '../render/sprite.js';
import { pickSprite } from './types.js';
import { cat } from './cat.js';
import { dog } from './dog.js';
import { rabbit } from './rabbit.js';
import { panda } from './panda.js';
import { penguin } from './penguin.js';
import { fox } from './fox.js';

const REGISTRY: Record<AnimalType, AnimalDef> = {
  cat, dog, rabbit, panda, penguin, fox,
};

export function getAnimalName(type: AnimalType): string {
  return REGISTRY[type].name;
}

export function getAnimalSprite(
  type: AnimalType,
  size: BodySize,
  animation: Animation,
  tick: number,
): SpriteGrid {
  return pickSprite(REGISTRY[type], size, animation, tick);
}

export function getBodySize(contextPercent: number): BodySize {
  if (contextPercent < 20) return 'tiny';
  if (contextPercent < 40) return 'small';
  if (contextPercent < 60) return 'medium';
  if (contextPercent < 80) return 'chubby';
  return 'thicc';
}

export function getAnimation(contextPercent: number, hasRunningTools: boolean): Animation {
  if (contextPercent >= 85) return 'danger';
  if (hasRunningTools) return 'busy';
  if (contextPercent < 10) return 'sleep';
  return 'idle';
}
