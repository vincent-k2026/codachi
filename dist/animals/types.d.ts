import type { BodySize, Animation, AnimalFrame } from '../types.js';
export type { AnimalFrame };
export interface AnimalDef {
    name: string;
    frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}
/**
 * Build a frame from content lines + optional tail character.
 * Each line is auto-centered to the widest line's width.
 * The tail is placed to the right of the first line, outside the centered area.
 */
export declare function f(contentLines: string[], tail?: string): AnimalFrame;
/** Pick a frame. Normalizes all frames in the same animation to equal width. */
export declare function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, tick: number): AnimalFrame;
