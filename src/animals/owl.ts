import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Owl: {O,O} big round eyes with comma beak, /)__)(\ wings, " " talons
// Key features: { } around eyes, comma beak, /)( wing brackets

const tiny = (e: string, t: string) => f([
  `{${e},${e}}`,
  `/)--(\\`,
  `" "`,
], t);

const small = (e: string, t: string) => f([
  `{ ${e},${e} }`,
  `/)----(\\`,
  `"   "`,
], t);

const medium = (e: string, t: string) => f([
  `{ ${e} , ${e} }`,
  `/)-------(\\`,
  `"       "`,
], t);

const chubby = (e: string, t: string) => f([
  `{  ${e}  ,  ${e}  }`,
  `/)-----------(\\`,
  `"           "`,
], t);

const thicc = (e: string, t: string) => f([
  `{  ${e}     ,     ${e}  }`,
  `/)-------------------(\\`,
  `"                 "`,
], t);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('O', ' '), build('-', ' '), build('O', '~'), build('o', ' ')],
    busy:   [build('O', '~'), build('o', '~'), build('-', '~'), build('O', '~')],
    danger: [build('0', '!'), build('-', '!'), build('0', '!'), build('0', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    happy:  [build('^', '~'), build('^', ' '), build('^', '~'), build('-', '~')],
  };
}

export const owl: AnimalDef = {
  name: 'Owl',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
