import type { StdinData } from './types.js';
export declare function readStdin(): Promise<StdinData | null>;
export declare function getContextPercent(stdin: StdinData): number;
export declare function getModelName(stdin: StdinData): string;
export declare function getFiveHourUsage(stdin: StdinData): {
    percent: number;
    resetsIn: string | null;
} | null;
export declare function getSevenDayUsage(stdin: StdinData): {
    percent: number;
    resetsIn: string | null;
} | null;
