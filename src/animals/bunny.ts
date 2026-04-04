import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Bunny: (\ /) tall ears, ( o.o ) face, c(")(") feet

const tiny = (e: string, t: string) => f([
  `(\\  /)`,
  `( ${e}.${e} )`,
  `c(")(")`,
], t);

const small = (e: string, t: string) => f([
  `(\\   /)`,
  `( ${e} . ${e} )`,
  `c(")(")`,
], t);

const medium = (e: string, t: string) => f([
  `(\\     /)`,
  `(  ${e}  .  ${e}  )`,
  `c(")(")(")`,
], t);

const chubby = (e: string, t: string) => f([
  `(\\         /)`,
  `(  ${e}      .      ${e}  )`,
  `c(")(")(")(")`,
], t);

const thicc = (e: string, t: string) => f([
  `(\\             /)`,
  `(  ${e}          .          ${e}  )`,
  `c(")(")(")(")(")`,
], t);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('o', ' '), build('-', ' '), build('o', '~'), build('^', ' ')],
    busy:   [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
    danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
  };
}

export const bunny: AnimalDef = {
  name: 'Bunny',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
