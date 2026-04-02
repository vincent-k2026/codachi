import { f } from './types.js';
// Fox: sharp V ears (taller than cat), narrow face, fluffy tail ~~
const tiny = (e, t) => f([
    `/V V\\${t}`,
    `(${e}w${e}) `,
    ` \\_/  `,
]);
const small = (e, t) => f([
    ` /V   V\\${t} `,
    ` ( ${e}w${e} )  `,
    `  \\_Y_/   `,
]);
const medium = (e, t) => f([
    `  /V     V\\${t}  `,
    ` (  ${e} w ${e}  )  `,
    `  \\__Y__/    `,
]);
const chubby = (e, t) => f([
    `   /V         V\\${t}  `,
    `  (  ${e}   w   ${e}  )  `,
    `   \\____Y____/    `,
]);
const thicc = (e, t) => f([
    `    /V             V\\${t}  `,
    `   (  ${e}     w     ${e}  )  `,
    `    \\______Y______/    `,
]);
function make(build) {
    return {
        idle: [build('o', '~~'), build('-', '  '), build('o', ' ~'), build('^', '~~')],
        busy: [build('o', '~~'), build('^', '~~'), build('-', '~~'), build('^', '~~')],
        danger: [build('O', '!!'), build('-', '!!'), build('O', '!!'), build('O', '  ')],
        sleep: [build('-', ' z'), build('-', 'zZ'), build('-', ' z'), build('-', '  ')],
    };
}
export const fox = {
    name: 'Fox',
    frames: {
        tiny: make(tiny), small: make(small), medium: make(medium),
        chubby: make(chubby), thicc: make(thicc),
    },
};
