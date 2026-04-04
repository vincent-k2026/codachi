import type { AnimalDef } from './types.js';
import { f } from './types.js';
import { stringWidth } from '../width.js';

// Cat: /\__/\ dynamic ears, = whiskers grow, w nose, (" ") paw pads grow

function makeCat(w: string, face: string, paws: string, t: string) {
  const faceLine = `${w}( ${face} )${w}`;
  const pawsLine = `${w}( ${paws} )${w}`;
  const bodyW = Math.max(stringWidth(faceLine), stringWidth(pawsLine));
  const uCount = Math.max(1, bodyW - 4);
  const ears = '/\\' + '_'.repeat(uCount) + '/\\';
  return f([ears, faceLine, pawsLine], t);
}

const tiny = (e: string, t: string) =>
  makeCat('', `${e} w ${e}`, '" "', t);

const small = (e: string, t: string) =>
  makeCat('=', `${e}  w  ${e}`, '"   "', t);

const medium = (e: string, t: string) =>
  makeCat('==', `${e}   w   ${e}`, '"     "', t);

const chubby = (e: string, t: string) =>
  makeCat('===', `${e}     w     ${e}`, '"       "', t);

const thicc = (e: string, t: string) =>
  makeCat('====', `${e}       w       ${e}`, '"           "', t);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('o', '~'), build('-', ' '), build('o', ' '), build('^', '~')],
    busy:   [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
    danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
  };
}

export const cat: AnimalDef = {
  name: 'Cat',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
