import type { AnimalType, BodySize, Animation } from '../types.js';
import type { AnimalDef, AnimalFrame } from './types.js';
import { pickFrame } from './types.js';
import { cat } from './cat.js';
import { penguin } from './penguin.js';
import { owl } from './owl.js';
import { octopus } from './octopus.js';
import { bunny } from './bunny.js';

const REGISTRY: Record<AnimalType, AnimalDef> = {
  cat, penguin, owl, octopus, bunny,
};

export const ANIMAL_COUNT = Object.keys(REGISTRY).length;

export function getAnimalName(type: AnimalType): string {
  return REGISTRY[type].name;
}

export function getAnimalFrame(
  type: AnimalType,
  size: BodySize,
  animation: Animation,
  tick: number,
): AnimalFrame {
  return pickFrame(REGISTRY[type], size, animation, tick);
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
