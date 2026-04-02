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
export interface TokenBreakdown {
    input: number;
    output: number;
    cacheWrite: number;
    cacheRead: number;
    total: number;
    windowSize: number;
    inputStr: string;
    outputStr: string;
    cacheWriteStr: string;
    cacheReadStr: string;
    totalStr: string;
    windowStr: string;
}
export declare function getTokenBreakdown(stdin: StdinData): TokenBreakdown | null;
