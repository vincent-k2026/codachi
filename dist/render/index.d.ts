import type { PetColors, AnimalType, GitStatus } from '../types.js';
import type { TokenBreakdown } from '../stdin.js';
interface RenderInput {
    contextPercent: number;
    modelName: string;
    animalType: AnimalType;
    colors: PetColors;
    git: GitStatus | null;
    fiveHourUsage: {
        percent: number;
        resetsIn: string | null;
    } | null;
    sevenDayUsage: {
        percent: number;
        resetsIn: string | null;
    } | null;
    tokens: TokenBreakdown | null;
    frameIndex: number;
}
export declare function render(input: RenderInput): void;
export {};
