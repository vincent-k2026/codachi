import type { AnimalDef } from './types.js';
import type { SpriteGrid } from '../render/sprite.js';

// Rabbit: tall ears (2), round eyes (3), small nose (4)
const tinyBase: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 4, 0, 3, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinyBlink: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 4, 0, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinyHappy: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 3, 0, 3, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];

const medBase: SpriteGrid = [
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 3, 0, 4, 0, 3, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0],
];
const medBlink: SpriteGrid = [
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0],
];
const medHappy: SpriteGrid = [
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 3, 0, 3, 0, 3, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0],
];

const chubbyBase: SpriteGrid = [
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 3, 0, 0, 4, 0, 0, 3, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0],
];
const chubbyBlink: SpriteGrid = [
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0],
];
const chubbyHappy: SpriteGrid = [
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0],
];

export const rabbit: AnimalDef = {
  name: 'Rabbit',
  sprites: {
    tiny:   { idle: [tinyBase, tinyBlink, tinyBase, tinyHappy], busy: [tinyBase, tinyHappy, tinyBlink, tinyHappy], danger: [tinyBase, tinyBlink, tinyBase, tinyBlink], sleep: [tinyBlink, tinyBlink, tinyBlink, tinyBlink] },
    small:  { idle: [tinyBase, tinyBlink, tinyBase, tinyHappy], busy: [tinyBase, tinyHappy, tinyBlink, tinyHappy], danger: [tinyBase, tinyBlink, tinyBase, tinyBlink], sleep: [tinyBlink, tinyBlink, tinyBlink, tinyBlink] },
    medium: { idle: [medBase, medBlink, medBase, medHappy], busy: [medBase, medHappy, medBlink, medHappy], danger: [medBase, medBlink, medBase, medBlink], sleep: [medBlink, medBlink, medBlink, medBlink] },
    chubby: { idle: [chubbyBase, chubbyBlink, chubbyBase, chubbyHappy], busy: [chubbyBase, chubbyHappy, chubbyBlink, chubbyHappy], danger: [chubbyBase, chubbyBlink, chubbyBase, chubbyBlink], sleep: [chubbyBlink, chubbyBlink, chubbyBlink, chubbyBlink] },
    thicc:  { idle: [chubbyBase, chubbyBlink, chubbyBase, chubbyHappy], busy: [chubbyBase, chubbyHappy, chubbyBlink, chubbyHappy], danger: [chubbyBase, chubbyBlink, chubbyBase, chubbyBlink], sleep: [chubbyBlink, chubbyBlink, chubbyBlink, chubbyBlink] },
  },
};
