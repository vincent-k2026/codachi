import type { PetColors, AnimalType, GitStatus } from '../types.js';
import type { ProjectInfo } from '../project.js';
interface RenderInput {
    contextPercent: number;
    modelName: string;
    animalType: AnimalType;
    colors: PetColors;
    git: GitStatus | null;
    project: ProjectInfo;
    fiveHourUsage: {
        percent: number;
        resetsIn: string | null;
    } | null;
    sevenDayUsage: {
        percent: number;
        resetsIn: string | null;
    } | null;
    animTick: number;
    moodTick: number;
    uptime: string;
}
export declare function render(input: RenderInput): void;
export {};
