import { f } from './types.js';
// Cat: body line is widest (whiskers), ears+paws pad to match
// Body: ====( ... )==== is the reference width
// Ears: /\_/\ centered above body center
// Paws: ( ... ) centered below body center
const tiny = (e, m, t) => f([
    ` /\\_/\\  ${t}`,
    `( ${e}w${e} )  `,
    ` ( ${m} ) `,
]);
const small = (e, m, t) => f([
    `  /\\_/\\   ${t}`,
    `=( ${e} w ${e} )=`,
    `  ( ${m} )  `,
]);
const medium = (e, m, t) => f([
    `   /\\_/\\    ${t}`,
    `==( ${e}  w  ${e} )==`,
    `  (  ${m}  ) `,
]);
const chubby = (e, m, t) => f([
    `     /\\_____/\\      ${t}`,
    `===( ${e}    w    ${e} )===`,
    `    (  ${m}  )   `,
]);
const thicc = (e, m, t) => f([
    `       /\\_________/\\        ${t}`,
    `====( ${e}      w      ${e} )====`,
    `      (   ${m}   )     `,
]);
function make(build, nm, dm) {
    return {
        idle: [build('o', nm, '~'), build('-', nm, ' '), build('o', nm, ' '), build('^', nm, '~')],
        busy: [build('o', nm, '~'), build('^', nm, '~'), build('-', nm, '~'), build('^', nm, '~')],
        danger: [build('O', dm, '!'), build('-', dm, '!'), build('O', dm, '!'), build('O', dm, ' ')],
        sleep: [build('-', nm, 'z'), build('-', nm, 'Z'), build('-', nm, 'z'), build('-', nm, ' ')],
    };
}
export const cat = {
    name: 'Cat',
    frames: {
        tiny: make(tiny, '^.^', '~.~'),
        small: make(small, '> ^ <', '> ~ <'),
        medium: make(medium, '> ^.^ <', '> ~.~ <'),
        chubby: make(chubby, '>  ^..^  <', '>  ~..~  <'),
        thicc: make(thicc, '>  ^....^  <', '>  ~....~  <'),
    },
};
