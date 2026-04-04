import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Cat: body line is widest (whiskers), ears+paws pad to match
// Body: ====( ... )==== is the reference width
// Ears: /\_/\ centered above body center
// Paws: ( ... ) centered below body center

const tiny = (e: string, m: string, t: string) => f([
  ` /\\_/\\  ${t}`,
  `( ${e}w${e} )  `,
  ` ( ${m} ) `,
]);

const small = (e: string, m: string, t: string) => f([
  `  /\\_/\\   ${t}`,
  `=( ${e} w ${e} )=`,
  `  ( ${m} )  `,
]);

const medium = (e: string, m: string, t: string) => f([
  `   /\\_/\\    ${t}`,
  `==( ${e}  w  ${e} )==`,
  `  (  ${m}  ) `,
]);

const chubby = (e: string, m: string, t: string) => f([
  `     /\\_____/\\      ${t}`,
  `===( ${e}    w    ${e} )===`,
  `    (  ${m}  )   `,
]);

const thicc = (e: string, m: string, t: string) => f([
  `       /\\_________/\\        ${t}`,
  `====( ${e}      w      ${e} )====`,
  `      (   ${m}   )     `,
]);

function make(
  build: (e: string, m: string, t: string) => ReturnType<typeof f>,
  nm: string, dm: string,
) {
  return {
    idle:   [build('o', nm, '~'), build('-', nm, ' '), build('o', nm, ' '), build('^', nm, '~')],
    busy:   [build('o', nm, '~'), build('^', nm, '~'), build('-', nm, '~'), build('^', nm, '~')],
    danger: [build('O', dm, '!'), build('-', dm, '!'), build('O', dm, '!'), build('O', dm, ' ')],
    sleep:  [build('-', nm, 'z'), build('-', nm, 'Z'), build('-', nm, 'z'), build('-', nm, ' ')],
  };
}

export const cat: AnimalDef = {
  name: 'Cat',
  frames: {
    tiny:   make(tiny,   '^.^', '~.~'),
    small:  make(small,  '> ^ <', '> ~ <'),
    medium: make(medium, '> ^.^ <', '> ~.~ <'),
    chubby: make(chubby, '>  ^..^  <', '>  ~..~  <'),
    thicc:  make(thicc,  '>  ^....^  <', '>  ~....~  <'),
  },
};
