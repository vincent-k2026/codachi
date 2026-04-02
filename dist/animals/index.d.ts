import type { AnimalType, BodySize, Animation } from '../types.js';
import type { AnimalFrame } from './types.js';
export declare function getAnimalName(type: AnimalType): string;
export declare function getAnimalFrame(type: AnimalType, size: BodySize, animation: Animation, tick: number): AnimalFrame;
export declare function getBodySize(contextPercent: number): BodySize;
export declare function getAnimation(contextPercent: number, hasRunningTools: boolean): Animation;
