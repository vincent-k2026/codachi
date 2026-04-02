import type { AnimalDef } from './types.js';
import type { SpriteGrid } from '../render/sprite.js';

// Palette: 0=transparent 1=body 2=accent 3=face 4=blush
// Grid: 6 rows tall (→ 3 terminal lines), width varies by size

// ── tiny: 7 wide ──────────────────────────────────
const tinyBase: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 1, 0, 3, 1],
  [1, 0, 4, 4, 4, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinyBlink: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 4, 4, 4, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinyHappy: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 1, 0, 3, 1],
  [1, 0, 3, 3, 3, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinyDanger: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 3, 1, 3, 3, 1],
  [1, 0, 4, 3, 4, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 4, 0, 0, 0, 4, 0],
];
const tinySleep: SpriteGrid = [
  [0, 2, 0, 0, 0, 2, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 4, 4, 4, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 0, 4, 0, 0],
];

// ── small: 9 wide ─────────────────────────────────
const smallBase: SpriteGrid = [
  [0, 2, 0, 0, 0, 0, 0, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 3, 0, 1, 0, 3, 1, 1],
  [1, 1, 0, 4, 4, 4, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 0, 0, 0, 4, 0, 0],
];
const smallBlink: SpriteGrid = [
  [0, 2, 0, 0, 0, 0, 0, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 1, 0, 4, 4, 4, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 0, 0, 0, 4, 0, 0],
];
const smallHappy: SpriteGrid = [
  [0, 2, 0, 0, 0, 0, 0, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 3, 0, 1, 0, 3, 1, 1],
  [1, 1, 0, 3, 3, 3, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 0, 0, 0, 4, 0, 0],
];

// ── medium: 11 wide ───────────────────────────────
const medBase: SpriteGrid = [
  [0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 3, 0, 1, 0, 3, 0, 1, 1],
  [1, 1, 0, 0, 4, 4, 4, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 0],
];
const medBlink: SpriteGrid = [
  [0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 4, 4, 4, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 0],
];
const medHappy: SpriteGrid = [
  [0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 3, 0, 1, 0, 3, 0, 1, 1],
  [1, 1, 0, 0, 3, 3, 3, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 0],
];
const medDanger: SpriteGrid = [
  [0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 3, 3, 0, 1, 0, 3, 3, 1, 1],
  [1, 1, 0, 0, 4, 3, 4, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 0],
];

// ── chubby: 15 wide ──────────────────────────────
const chubbyBase: SpriteGrid = [
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
];
const chubbyBlink: SpriteGrid = [
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
];
const chubbyHappy: SpriteGrid = [
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
];
const chubbyDanger: SpriteGrid = [
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 3, 3, 0, 0, 1, 0, 0, 3, 3, 0, 1, 1],
  [1, 1, 0, 0, 0, 4, 4, 3, 4, 4, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
];

// ── thicc: 19 wide ───────────────────────────────
const thiccBase: SpriteGrid = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
];
const thiccBlink: SpriteGrid = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
];
const thiccHappy: SpriteGrid = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
];
const thiccDanger: SpriteGrid = [
  [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 3, 3, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 4, 4, 3, 4, 4, 0, 0, 0, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
];

export const cat: AnimalDef = {
  name: 'Cat',
  sprites: {
    tiny:   { idle: [tinyBase, tinyBlink, tinyBase, tinyHappy], busy: [tinyBase, tinyHappy, tinyBlink, tinyHappy], danger: [tinyDanger, tinyBlink, tinyDanger, tinyBlink], sleep: [tinyBlink, tinySleep, tinyBlink, tinySleep] },
    small:  { idle: [smallBase, smallBlink, smallBase, smallHappy], busy: [smallBase, smallHappy, smallBlink, smallHappy], danger: [smallBase, smallBlink, smallBase, smallBlink], sleep: [smallBlink, smallBlink, smallBlink, smallBlink] },
    medium: { idle: [medBase, medBlink, medBase, medHappy], busy: [medBase, medHappy, medBlink, medHappy], danger: [medDanger, medBlink, medDanger, medBlink], sleep: [medBlink, medBlink, medBlink, medBlink] },
    chubby: { idle: [chubbyBase, chubbyBlink, chubbyBase, chubbyHappy], busy: [chubbyBase, chubbyHappy, chubbyBlink, chubbyHappy], danger: [chubbyDanger, chubbyBlink, chubbyDanger, chubbyBlink], sleep: [chubbyBlink, chubbyBlink, chubbyBlink, chubbyBlink] },
    thicc:  { idle: [thiccBase, thiccBlink, thiccBase, thiccHappy], busy: [thiccBase, thiccHappy, thiccBlink, thiccHappy], danger: [thiccDanger, thiccBlink, thiccDanger, thiccBlink], sleep: [thiccBlink, thiccBlink, thiccBlink, thiccBlink] },
  },
};
