import type { AnimalType, BodySize, Animation, AnimalFrame } from '../types.js';
export declare function getAnimalName(type: AnimalType): string;
export declare function getAnimalFrame(type: AnimalType, size: BodySize, animation: Animation, frameIndex: number): AnimalFrame;
export declare function getBodySize(contextPercent: number): BodySize;
export declare function getAnimation(contextPercent: number, hasRunningTools: boolean): Animation;
