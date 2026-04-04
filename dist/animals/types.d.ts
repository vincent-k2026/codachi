import type { BodySize, Animation, AnimalFrame } from '../types.js';
export type { AnimalFrame };
export interface AnimalDef {
    name: string;
    frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}
/**
 * Build a frame from content lines + optional tail.
 * Forces all content to the same width (even), then centers each line.
 * Tail goes to the right of line 0.
 */
export declare function f(contentLines: string[], tail?: string): AnimalFrame;
/** Pick a frame. Normalizes all frames in the same animation to equal width. */
export declare function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, tick: number): AnimalFrame;
