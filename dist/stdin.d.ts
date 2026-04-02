import type { StdinData } from './types.js';
export declare function readStdin(): Promise<StdinData | null>;
export declare function getContextPercent(stdin: StdinData): number;
export declare function getModelName(stdin: StdinData): string;
export declare function getFiveHourUsage(stdin: StdinData): number | null;
export declare function getSevenDayUsage(stdin: StdinData): number | null;
