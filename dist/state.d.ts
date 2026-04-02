/**
 * Initialize session. A new transcript_path from Claude Code = new session.
 * Same transcript_path = same pet.
 */
export declare function initSession(transcriptPath?: string): void;
export declare function getSessionAnimalIndex(): number;
export declare function getSessionPaletteIndex(): number;
export declare function animTick(): number;
export declare function moodTick(): number;
export declare function sessionUptime(): string;
