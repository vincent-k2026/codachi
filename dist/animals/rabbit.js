import { f } from './types.js';
// Rabbit: two tall ears sticking UP, round face, bunny teeth
const tiny = (e, t) => f([
    `() ()${t}`,
    `(${e}.${e}) `,
    `(")(") `,
]);
const small = (e, t) => f([
    ` ()  ()${t} `,
    ` ( ${e}.${e} ) `,
    ` (")(") `,
]);
const medium = (e, t) => f([
    `  ()    ()${t}  `,
    ` (  ${e} . ${e}  ) `,
    `  (")(")")  `,
]);
const chubby = (e, t) => f([
    `   ()        ()${t}  `,
    `  (  ${e}   .   ${e}  ) `,
    `   (")(")(")")  `,
]);
const thicc = (e, t) => f([
    `    ()            ()${t}  `,
    `   (  ${e}     .     ${e}  ) `,
    `    (")(")(")(")("  `,
]);
function make(build) {
    return {
        idle: [build('o', ' '), build('-', ' '), build('o', '~'), build('^', ' ')],
        busy: [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
        danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
        sleep: [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    };
}
export const rabbit = {
    name: 'Rabbit',
    frames: {
        tiny: make(tiny), small: make(small), medium: make(medium),
        chubby: make(chubby), thicc: make(thicc),
    },
};
