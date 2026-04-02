import type { BodySize, Animation, AnimalFrame } from '../types.js';
export type { AnimalFrame };
export interface AnimalDef {
    name: string;
    frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}
/** Build a frame. Auto-pads all lines to the widest line's width. */
export declare function f(rawLines: string[]): AnimalFrame;
/** Pick a frame. Normalizes all frames in the same animation to equal width. */
export declare function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, tick: number): AnimalFrame;
