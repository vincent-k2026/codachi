import type { BodySize, Animation, AnimalType, GitStatus } from './types.js';
interface MoodContext {
    contextPercent: number;
    size: BodySize;
    animation: Animation;
    animalType: AnimalType;
    git: GitStatus | null;
    fiveHourUsage: number | null;
    moodTick: number;
}
export declare function getMoodMessage(ctx: MoodContext): string;
export {};
