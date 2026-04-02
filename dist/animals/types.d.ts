import type { BodySize, Animation, AnimalFrame } from '../types.js';
export interface AnimalDef {
    name: string;
    frames: Record<BodySize, Record<Animation, AnimalFrame[]>>;
}
export declare function pickFrame(def: AnimalDef, size: BodySize, anim: Animation, frameIndex: number): AnimalFrame;
