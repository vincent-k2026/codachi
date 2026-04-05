import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Octopus: ,---. dome head, ( O.O ) big round eyes, /|~|~|\ wavy tentacles

const tiny = (e: string, t: string) => f([
  `,---.`,
  `( ${e}.${e} )`,
  `/|~|~|\\`,
], t);

const small = (e: string, t: string) => f([
  `,-------.`,
  `( ${e}  .  ${e} )`,
  `/|~|~|~|~|\\`,
], t);

const medium = (e: string, t: string) => f([
  `,-----------.`,
  `( ${e}    .    ${e} )`,
  `/|~|~|~|~|~|~|\\`,
], t);

const chubby = (e: string, t: string) => f([
  `,-----------------.`,
  `( ${e}       .       ${e} )`,
  `/|~|~|~|~|~|~|~|~|~|\\`,
], t);

const thicc = (e: string, t: string) => f([
  `,-------------------------.`,
  `( ${e}          .          ${e} )`,
  `/|~|~|~|~|~|~|~|~|~|~|~|~|\\`,
], t);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('O', ' '), build('-', ' '), build('O', '~'), build('^', ' ')],
    busy:   [build('O', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
    danger: [build('0', '!'), build('-', '!'), build('0', '!'), build('0', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    happy:  [build('^', '~'), build('^', ' '), build('^', '~'), build('-', '~')],
  };
}

export const octopus: AnimalDef = {
  name: 'Octopus',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
