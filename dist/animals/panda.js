import { f } from './types.js';
// Panda: round ears, dark eye patches (@), round body
const tiny = (e, t) => f([
    `(●)(●)${t}`,
    `(${e}.${e}) `,
    ` (  )  `,
]);
const small = (e, t) => f([
    ` (●) (●)${t} `,
    ` ( ${e} . ${e} ) `,
    `  (    )  `,
]);
const medium = (e, t) => f([
    `  (●)   (●)${t}  `,
    ` (  ${e}  .  ${e}  ) `,
    `  (        )  `,
]);
const chubby = (e, t) => f([
    `   (●)       (●)${t}  `,
    `  (  ${e}    .    ${e}  ) `,
    `   (            )  `,
]);
const thicc = (e, t) => f([
    `    (●)           (●)${t}  `,
    `   (  ${e}      .      ${e}  ) `,
    `    (                )  `,
]);
function make(build) {
    return {
        idle: [build('o', ' '), build('-', ' '), build('o', '~'), build('^', ' ')],
        busy: [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
        danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
        sleep: [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    };
}
export const panda = {
    name: 'Panda',
    frames: {
        tiny: make(tiny), small: make(small), medium: make(medium),
        chubby: make(chubby), thicc: make(thicc),
    },
};
