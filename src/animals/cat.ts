import type { AnimalDef } from './types.js';
import { f } from './types.js';
import { stringWidth } from '../width.js';

// Cat: dynamic ears that match body width, eyes and mouth same width

function makeCat(w: string, e: string, m: string, t: string) {
  // w = whisker string like '' '=' '==' etc
  const face = `${w}( ${e} )${w}`;
  const paws = `${w}( ${m} )${w}`;
  const bodyW = Math.max(stringWidth(face), stringWidth(paws));
  // Ears: /\____/\ matching body width
  const uCount = Math.max(1, bodyW - 4);
  const ears = '/\\' + '_'.repeat(uCount) + '/\\';
  return f([ears, face, paws], t);
}

const tiny = (e: string, m: string, t: string) => makeCat('', e, m, t);
const small = (e: string, m: string, t: string) => makeCat('=', e, m, t);
const medium = (e: string, m: string, t: string) => makeCat('==', e, m, t);
const chubby = (e: string, m: string, t: string) => makeCat('===', e, m, t);
const thicc = (e: string, m: string, t: string) => makeCat('====', e, m, t);

function make(
  build: (e: string, m: string, t: string) => ReturnType<typeof f>,
  ne: string, nm: string, de: string, dm: string,
) {
  return {
    idle:   [build('o'+ne, nm, '~'), build('-'+ne, nm, ' '), build('o'+ne, nm, ' '), build('^'+ne, nm, '~')],
    busy:   [build('o'+ne, nm, '~'), build('^'+ne, nm, '~'), build('-'+ne, nm, '~'), build('^'+ne, nm, '~')],
    danger: [build('O'+de, dm, '!'), build('-'+de, dm, '!'), build('O'+de, dm, '!'), build('O'+de, dm, ' ')],
    sleep:  [build('-'+ne, nm, 'z'), build('-'+ne, nm, 'Z'), build('-'+ne, nm, 'z'), build('-'+ne, nm, ' ')],
  };
}

export const cat: AnimalDef = {
  name: 'Cat',
  frames: {
    // ne/nm must be same string length as de/dm for alignment
    // eyes: "o w o", mouth: "^ . ^" — same length each size
    tiny:   make(tiny,   ' w o', '^ . ^', ' w O', '~ . ~'),
    small:  make(small,  '  w  o', ' ^ . ^ ', '  w  O', ' ~ . ~ '),
    medium: make(medium, '   w   o', '  ^ . ^  ', '   w   O', '  ~ . ~  '),
    chubby: make(chubby, '     w     o', '   ^  .  ^   ', '     w     O', '   ~  .  ~   '),
    thicc:  make(thicc,  '       w       o', '    ^   .   ^    ', '       w       O', '    ~   .   ~    '),
  },
};
