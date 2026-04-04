import { f } from './types.js';
// Penguin: round head, v beak, < > flippers, " " feet
// All centered, flippers grow symmetrically
const tiny = (e, t) => f([
    `  (${e}v${e}) ${t}`,
    ` <(   )> `,
    `  (" ") `,
]);
const small = (e, t) => f([
    `   (${e} v ${e})  ${t}`,
    ` <<(     )>> `,
    `   ("   ")   `,
]);
const medium = (e, t) => f([
    `    (${e}  v  ${e})   ${t}`,
    ` <<<(        )>>> `,
    `    ("      ")    `,
]);
const chubby = (e, t) => f([
    `     (${e}    v    ${e})    ${t}`,
    ` <<<<(             )>>>> `,
    `     ("           ")     `,
]);
const thicc = (e, t) => f([
    `      (${e}       v       ${e})     ${t}`,
    ` <<<<<(                     )>>>>> `,
    `      ("                   ")      `,
]);
function make(build) {
    return {
        idle: [build('o', ' '), build('-', ' '), build('o', '~'), build('^', ' ')],
        busy: [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
        danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
        sleep: [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    };
}
export const penguin = {
    name: 'Penguin',
    frames: {
        tiny: make(tiny), small: make(small), medium: make(medium),
        chubby: make(chubby), thicc: make(thicc),
    },
};
