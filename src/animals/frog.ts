import type { AnimalDef } from './types.js';
import { f } from './types.js';

// Frog: @..@ eyes on top, (----) wide mouth, ( >__< ) legs
// All 3 lines centered on same axis

const tiny = (e: string, t: string) => f([
  `  @${e}${e}@   ${t}`,
  ` (-----) `,
  ` ( >__< ) `,
]);

const small = (e: string, t: string) => f([
  `   @${e} ${e}@    ${t}`,
  `  (--------)  `,
  `  ( >____< )  `,
]);

const medium = (e: string, t: string) => f([
  `    @${e}   ${e}@     ${t}`,
  `   (----------)   `,
  `   ( >______< )   `,
]);

const chubby = (e: string, t: string) => f([
  `      @${e}     ${e}@       ${t}`,
  `    (----------------)    `,
  `    (  >__________<  )    `,
]);

const thicc = (e: string, t: string) => f([
  `        @${e}        ${e}@         ${t}`,
  `     (------------------------)    `,
  `     (   >________________<   )    `,
]);

function make(build: (e: string, t: string) => ReturnType<typeof f>) {
  return {
    idle:   [build('.', ' '), build('.', '~'), build('o', ' '), build('o', '~')],
    busy:   [build('o', '~'), build('.', '~'), build('o', '~'), build('.', '~')],
    danger: [build('O', '!'), build('.', '!'), build('O', '!'), build('O', ' ')],
    sleep:  [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
  };
}

export const frog: AnimalDef = {
  name: 'Frog',
  frames: {
    tiny: make(tiny), small: make(small), medium: make(medium),
    chubby: make(chubby), thicc: make(thicc),
  },
};
