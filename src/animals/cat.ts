import type { AnimalDef } from './types.js';
import { f } from './types.js';
import { stringWidth } from '../width.js';

// Cat: /\__/\ ears, = whiskers, o w o face, " " paw pads
// Face and paws use SAME inner width to guarantee alignment

function makeCat(w: string, e: string, inner: string, t: string) {
  // inner controls spacing: e.g. " w " or "  w  " etc.
  // face: ( o w o ) — eye + inner + eye
  // paws: ( " " )   — pad + inner-as-spaces + pad
  const faceContent = `${e}${inner}${e}`;
  const pawSpacing = ' '.repeat(stringWidth(inner));
  const pawContent = `"${pawSpacing}"`;
  const faceLine = `${w}( ${faceContent} )${w}`;
  const pawsLine = `${w}( ${pawContent} )${w}`;
  const bodyW = Math.max(stringWidth(faceLine), stringWidth(pawsLine));
  const uCount = Math.max(1, bodyW - 4);
  const ears = '/\\' + '_'.repeat(uCount) + '/\\';
  return f([ears, faceLine, pawsLine], t);
}

const tiny = (e: string, t: string) => makeCat('', e, ' w ', t);
const small = (e: string, t: string) => makeCat('=', e, '  w  ', t);
const medium = (e: string, t: string) => makeCat('==', e, '   w   ', t);
const chubby = (e: string, t: string) => makeCat('===', e, '     w     ', t);
const thicc = (e: string, t: string) => makeCat('====', e, '       w       ', t);

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
