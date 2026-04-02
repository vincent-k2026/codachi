import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Dog: floppy U ears hang DOWN beside face, big nose, tongue when happy

const tiny = (e: string, t: string) => f([
  `U    U${t}`,
  `(${e}ω${e}) `,
  ` \\__/  `,
]);

const small = (e: string, t: string) => f([
  ` U      U${t}`,
  ` ( ${e} ω ${e} )`,
  `  \\____/ `,
]);

const medium = (e: string, t: string) => f([
  `  U        U${t}`,
  ` (  ${e}  ω  ${e}  )`,
  `  \\______/  `,
]);

const chubby = (e: string, t: string) => f([
  `   U            U${t}`,
  `  (  ${e}    ω    ${e}  )`,
  `   \\__________/  `,
]);

const thicc = (e: string, t: string) => f([
  `    U                U${t}`,
  `   (  ${e}      ω      ${e}  )`,
  `    \\______________/  `,
]);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('o', '~'), build('-', ' '), build('o', ' '), build('^', '~')],
    busy:   [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
    danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
  };
}

export const dog: AnimalDef = {
  name: 'Dog',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
