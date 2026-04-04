export declare function initSession(transcriptPath?: string): void;
export declare function getSessionAnimalIndex(): number;
export declare function getSessionPaletteIndex(): number;
export declare function animTick(): number;
export declare function moodTick(): number;
export declare function sessionUptime(): string;
export declare function recordContextPercent(pct: number): void;
/** Returns context velocity in %/min. Positive = growing. */
export declare function getContextVelocity(): number;
export interface PetMemory {
    totalSessions: number;
    totalUptimeMin: number;
    totalCommits: number;
    firstMet: number;
    lastSeen: number;
}
export declare function getMemory(): PetMemory;
export type RelationshipTier = 'stranger' | 'acquaintance' | 'friend' | 'bestie';
export declare function getRelationshipTier(): RelationshipTier;
