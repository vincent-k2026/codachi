import type { BodySize, Animation, AnimalType, GitStatus } from './types.js';
import type { RelationshipTier } from './state.js';
interface MoodContext {
    contextPercent: number;
    size: BodySize;
    animation: Animation;
    animalType: AnimalType;
    git: GitStatus | null;
    fiveHourUsage: number | null;
    contextVelocity: number;
    cacheHitRate: number | null;
    relationshipTier: RelationshipTier;
    sessionNumber: number;
    moodTick: number;
}
export declare function getMoodMessage(ctx: MoodContext): string;
export {};
