import type { PetState } from './types.js';
export declare function loadState(): PetState;
export declare function saveState(state: PetState): void;
export declare function nextFrame(state: PetState): PetState;
