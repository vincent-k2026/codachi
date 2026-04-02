import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Fox: sharp V ears (taller than cat), narrow face, fluffy tail ~~

const tiny = (e: string, t: string) => f([
  `/V V\\${t}`,
  `(${e}w${e}) `,
  ` \\_/  `,
]);

const small = (e: string, t: string) => f([
  ` /V   V\\${t} `,
  ` ( ${e}w${e} )  `,
  `  \\_Y_/   `,
]);

const medium = (e: string, t: string) => f([
  `  /V     V\\${t}  `,
  ` (  ${e} w ${e}  )  `,
  `  \\__Y__/    `,
]);

const chubby = (e: string, t: string) => f([
  `   /V         V\\${t}  `,
  `  (  ${e}   w   ${e}  )  `,
  `   \\____Y____/    `,
]);

const thicc = (e: string, t: string) => f([
  `    /V             V\\${t}  `,
  `   (  ${e}     w     ${e}  )  `,
  `    \\______Y______/    `,
]);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('o', '~~'), build('-', '  '), build('o', ' ~'), build('^', '~~')],
    busy:   [build('o', '~~'), build('^', '~~'), build('-', '~~'), build('^', '~~')],
    danger: [build('O', '!!'), build('-', '!!'), build('O', '!!'), build('O', '  ')],
    sleep:  [build('-', ' z'), build('-', 'zZ'), build('-', ' z'), build('-', '  ')],
  };
}

export const fox: AnimalDef = {
  name: 'Fox',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
