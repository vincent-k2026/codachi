import { f } from './types.js';
import { stringWidth } from '../width.js';
// Cat: /\__/\ dynamic ears, = whiskers grow, w nose, (" ") paw pads grow
function makeCat(w, face, paws, t) {
    const faceLine = `${w}( ${face} )${w}`;
    const pawsLine = `${w}( ${paws} )${w}`;
    const bodyW = Math.max(stringWidth(faceLine), stringWidth(pawsLine));
    const uCount = Math.max(1, bodyW - 4);
    const ears = '/\\' + '_'.repeat(uCount) + '/\\';
    return f([ears, faceLine, pawsLine], t);
}
const tiny = (e, t) => makeCat('', `${e} w ${e}`, '" "', t);
const small = (e, t) => makeCat('=', `${e}  w  ${e}`, '"   "', t);
const medium = (e, t) => makeCat('==', `${e}   w   ${e}`, '"     "', t);
const chubby = (e, t) => makeCat('===', `${e}     w     ${e}`, '"       "', t);
const thicc = (e, t) => makeCat('====', `${e}       w       ${e}`, '"           "', t);
function make(build) {
    return {
        idle: [build('o', '~'), build('-', ' '), build('o', ' '), build('^', '~')],
        busy: [build('o', '~'), build('^', '~'), build('-', '~'), build('^', '~')],
        danger: [build('O', '!'), build('-', '!'), build('O', '!'), build('O', ' ')],
        sleep: [build('-', 'z'), build('-', 'Z'), build('-', 'z'), build('-', ' ')],
    };
}
export const cat = {
    name: 'Cat',
    frames: {
        tiny: make(tiny), small: make(small), medium: make(medium),
        chubby: make(chubby), thicc: make(thicc),
    },
};
