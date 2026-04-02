import type { StdinData, PetColors, AnimalType, GitStatus } from '../types.js';
interface RenderInput {
    stdin: StdinData;
    contextPercent: number;
    modelName: string;
    animalType: AnimalType;
    colors: PetColors;
    git: GitStatus | null;
    fiveHourUsage: number | null;
    sevenDayUsage: number | null;
    frameIndex: number;
}
export declare function render(input: RenderInput): void;
export {};
