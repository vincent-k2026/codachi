import type { BodySize, Animation, AnimalType } from './types.js';
import type { GitStatus } from './types.js';
interface MoodContext {
    contextPercent: number;
    size: BodySize;
    animation: Animation;
    animalType: AnimalType;
    git: GitStatus | null;
    fiveHourUsage: number | null;
    frameIndex: number;
}
export declare function getMoodMessage(ctx: MoodContext): string;
export {};
