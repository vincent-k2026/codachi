import type { AnimalDef } from './types.js';
import { f } from './types.js';

const tiny = (e: string, m: string, t: string) => f([
  `(\\(\\${t}`,
  `(${e}.${e})`,
  `o(")("`,
]);

const small = (e: string, m: string, t: string) => f([
  ` (\\  (\\${t} `,
  ` ( ${e}.${e} ) `,
  ` o(")(") `,
]);

const medium = (e: string, m: string, t: string) => f([
  `  (\\   (\\${t}  `,
  ` (  ${e} . ${e}  ) `,
  `  o(")(")   `,
]);

const chubby = (e: string, m: string, t: string) => f([
  `   (\\     (\\${t}   `,
  `  (  ${e}  .  ${e}  )  `,
  `   o(")(")      `,
]);

const thicc = (e: string, m: string, t: string) => f([
  `    (\\        (\\${t}   `,
  `   (  ${e}    .    ${e}  ) `,
  `    o(")(")         `,
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

export const rabbit: AnimalDef = {
  name: 'Rabbit',
  frames: {
    tiny:   make(tiny),
    small:  make(small),
    medium: make(medium),
    chubby: make(chubby),
    thicc:  make(thicc),
  },
};
