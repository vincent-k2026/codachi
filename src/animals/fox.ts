import type { AnimalDef } from './types.js';
import { f } from './types.js';

const tiny = (e: string, m: string, t: string) => f([
  `/V\\_/V\\${t}`,
  `(${e}w${e}) `,
  ` \\_Y_/ `,
]);

const small = (e: string, m: string, t: string) => f([
  ` /V\\___/V\\${t} `,
  ` ( ${e}w${e} )   `,
  `  \\_\\_Y_/   `,
]);

const medium = (e: string, m: string, t: string) => f([
  `  /V\\_____/V\\${t}  `,
  ` (  ${e} w ${e}  )   `,
  `   \\__\\_Y__/    `,
]);

const chubby = (e: string, m: string, t: string) => f([
  `   /V\\_________/V\\${t}  `,
  `  (  ${e}  w  ${e}  )    `,
  `    \\___\\_Y___/     `,
]);

const thicc = (e: string, m: string, t: string) => f([
  `    /V\\_____________/V\\${t}  `,
  `   (  ${e}    w    ${e}  )    `,
  `     \\____\\_Y____/      `,
]);

function make(
  build: (e: string, m: string, t: string) => ReturnType<typeof f>,
) {
  return {
    idle: [
      build('o', '', '~'),
      build('-', '', ' '),
      build('o', '', ' '),
      build('^', '', '~'),
    ],
    busy: [
      build('o', '', '~'),
      build('^', '', '~'),
      build('-', '', '~'),
      build('^', '', '~'),
    ],
    danger: [
      build('O', '', '!'),
      build('-', '', '!'),
      build('O', '', '!'),
      build('O', '', ' '),
    ],
    sleep: [
      build('-', '', 'z'),
      build('-', '', 'Z'),
      build('-', '', 'z'),
      build('-', '', ' '),
    ],
  };
}

export const fox: AnimalDef = {
  name: 'Fox',
  frames: {
    tiny:   make(tiny),
    small:  make(small),
    medium: make(medium),
    chubby: make(chubby),
    thicc:  make(thicc),
  },
};
