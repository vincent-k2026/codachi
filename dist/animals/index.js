import { pickFrame } from './types.js';
import { cat } from './cat.js';
import { dog } from './dog.js';
import { rabbit } from './rabbit.js';
import { panda } from './panda.js';
import { penguin } from './penguin.js';
import { fox } from './fox.js';
const REGISTRY = {
    cat, dog, rabbit, panda, penguin, fox,
};
export function getAnimalName(type) {
    return REGISTRY[type].name;
}
export function getAnimalFrame(type, size, animation, frameIndex) {
    return pickFrame(REGISTRY[type], size, animation, frameIndex);
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
