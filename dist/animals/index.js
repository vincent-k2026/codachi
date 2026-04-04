import { pickFrame } from './types.js';
import { cat } from './cat.js';
import { penguin } from './penguin.js';
import { frog } from './frog.js';
import { octopus } from './octopus.js';
import { bunny } from './bunny.js';
const REGISTRY = {
    cat, penguin, frog, octopus, bunny,
};
export const ANIMAL_COUNT = Object.keys(REGISTRY).length;
export function getAnimalName(type) {
    return REGISTRY[type].name;
}
export function getAnimalFrame(type, size, animation, tick) {
    return pickFrame(REGISTRY[type], size, animation, tick);
}
export function getBodySize(contextPercent) {
    if (contextPercent < 20)
        return 'tiny';
    if (contextPercent < 40)
        return 'small';
    if (contextPercent < 60)
        return 'medium';
    if (contextPercent < 80)
        return 'chubby';
    return 'thicc';
}
export function getAnimation(contextPercent, hasRunningTools) {
    if (contextPercent >= 85)
        return 'danger';
    if (hasRunningTools)
        return 'busy';
    if (contextPercent < 10)
        return 'sleep';
    return 'idle';
}
