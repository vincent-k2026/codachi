import type { AnimalDef } from './types.js';
import { f } from './types.js';

const tiny = (e: string, m: string, t: string) => f([
  `U\\_/U${t}`,
  `(${e}w${e})`,
  ` (${m}) `,
]);

const small = (e: string, m: string, t: string) => f([
  ` U\\___/U${t} `,
  ` ( ${e}w${e} ) `,
  `  (${m})   `,
]);

const medium = (e: string, m: string, t: string) => f([
  `  U\\_____/U${t}  `,
  ` (  ${e} w ${e}  ) `,
  `   (${m})     `,
]);

const chubby = (e: string, m: string, t: string) => f([
  `   U\\_________/U${t}  `,
  `  (  ${e}  w  ${e}  )  `,
  `    ( ${m} )     `,
]);

const thicc = (e: string, m: string, t: string) => f([
  `    U\\_____________/U${t}  `,
  `   (  ${e}    w    ${e}  )  `,
  `     (  ${m}  )     `,
]);

function make(
  build: (e: string, m: string, t: string) => ReturnType<typeof f>,
  normalMouth: string,
  dangerMouth: string,
) {
  return {
    idle: [
      build('o', normalMouth, '~'),
      build('-', normalMouth, ' '),
      build('^', normalMouth, '~'),
      build('-', normalMouth, ' '),
    ],
    busy: [
      build('o', normalMouth, '~'),
      build('^', normalMouth, '~'),
      build('o', normalMouth, '~'),
      build('^', normalMouth, '~'),
    ],
    danger: [
      build('O', dangerMouth, '!'),
      build('-', dangerMouth, '!'),
      build('O', dangerMouth, '!'),
      build('O', dangerMouth, ' '),
    ],
    sleep: [
      build('-', normalMouth, 'z'),
      build('-', normalMouth, 'Z'),
      build('-', normalMouth, 'z'),
      build('-', normalMouth, ' '),
    ],
  };
}

export const dog: AnimalDef = {
  name: 'Dog',
  frames: {
    tiny:   make(tiny,   '^ ^', '~~~'),
    small:  make(small,  '^ ^', '~~~'),
    medium: make(medium, '> ^ <', '> ~ <'),
    chubby: make(chubby, '> ^^ <', '> ~~ <'),
    thicc:  make(thicc,  '> ^^^ <', '> ~~~ <'),
  },
};
