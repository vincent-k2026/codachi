import os from 'node:os';
import type { AnimalType, PetColors } from './types.js';
import { hsl } from './render/colors.js';

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const ANIMALS: AnimalType[] = ['cat', 'dog', 'rabbit', 'panda', 'penguin', 'fox'];

export function getAnimalType(username?: string): AnimalType {
  const name = username || os.userInfo().username || 'default';
  const hash = hashString(name);
  return ANIMALS[hash % ANIMALS.length];
}

export function getPetColors(username?: string): PetColors {
  const name = username || os.userInfo().username || 'default';
  const hash = hashString(name);

  // Extract different bits of the hash for different color components
  const bodyHue = (hash >>> 0) % 360;
  const accentHue = (hash >>> 8) % 360;
  const faceHue = (hash >>> 16) % 360;
  const blushHue = (hash >>> 24) % 360;

  return {
    body: hsl(bodyHue, 65, 70),
    accent: hsl(accentHue, 70, 65),
    face: hsl(faceHue, 60, 75),
    blush: hsl(blushHue, 80, 70),
  };
}
