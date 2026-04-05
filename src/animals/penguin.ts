import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Penguin: round head, v beak, < > flippers, ("") feet

const tiny = (e: string, t: string) => f([
  `(${e}v${e})`,
  `<(   )>`,
  `(" ")`,
], t);

const small = (e: string, t: string) => f([
  `(${e} v ${e})`,
  `<<(     )>>`,
  `("   ")`,
], t);

const medium = (e: string, t: string) => f([
  `(${e}  v  ${e})`,
  `<<<(        )>>>`,
  `("      ")`,
], t);

const chubby = (e: string, t: string) => f([
  `(${e}    v    ${e})`,
  `<<<<(             )>>>>`,
  `("           ")`,
], t);

const thicc = (e: string, t: string) => f([
  `(${e}       v       ${e})`,
  `<<<<<(                     )>>>>>`,
  `("                   ")`,
], t);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('o', ' '), build('-', ' '), build('o', '~'), build('^', ' ')],
    busy:   [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
    danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    happy:  [build('^', '~'), build('^', ' '), build('^', '~'), build('-', '~')],
  };
}

export const penguin: AnimalDef = {
  name: 'Penguin',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
