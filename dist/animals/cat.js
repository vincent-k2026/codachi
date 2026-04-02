import { f } from './types.js';
// Template: define shape once, swap eyes/mouth/tail per frame.
// This guarantees structural alignment across all frames.
const tiny = (e, m, t) => f([
    ` /\\_/\\${t}`,
    `( ${e}w${e} )`,
    ` (${m})  `,
]);
const small = (e, m, t) => f([
    `  /\\_/\\${t} `,
    ` ( ${e}w${e} ) `,
    `  (${m})   `,
]);
const medium = (e, m, t) => f([
    `   /\\_/\\${t}  `,
    ` =( ${e} w ${e} )=`,
    `   (${m})    `,
]);
const chubby = (e, m, t) => f([
    `    /\\_____/\\${t}  `,
    ` ==( ${e}  w  ${e} )==`,
    `    ( ${m} )    `,
]);
const thicc = (e, m, t) => f([
    `     /\\_________/\\${t}  `,
    ` ===( ${e}    w    ${e} )===`,
    `     (  ${m}  )    `,
]);
// Eyes: o=open, -=closed, ^=happy, O=wide
// Mouth: ^ ^=normal, ~~~=danger
// Tail: ~=right, (space)=none
function make(build, normalMouth, dangerMouth) {
    return {
        idle: [
            build('o', normalMouth, '~'),
            build('-', normalMouth, ' '),
            build('o', normalMouth, ' '),
            build('^', normalMouth, '~'),
        ],
        busy: [
            build('o', normalMouth, '~'),
            build('^', normalMouth, '~'),
            build('-', normalMouth, '~'),
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
export const cat = {
    name: 'Cat',
    frames: {
        tiny: make(tiny, '^ ^', '~~~'),
        small: make(small, '^ ^', '~~~'),
        medium: make(medium, '> ^ <', '> ~ <'),
        chubby: make(chubby, '> ^^ <', '> ~~ <'),
        thicc: make(thicc, '> ^^^ <', '> ~~~ <'),
    },
};
