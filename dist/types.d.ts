export interface StdinData {
    transcript_path?: string;
    cwd?: string;
    model?: {
        id?: string;
        display_name?: string;
    };
    context_window?: {
        context_window_size?: number;
        current_usage?: {
            input_tokens?: number;
            output_tokens?: number;
            cache_creation_input_tokens?: number;
            cache_read_input_tokens?: number;
        };
        used_percentage?: number;
        remaining_percentage?: number;
    };
    rate_limits?: {
        five_hour?: {
            used_percentage?: number;
            resets_at?: number;
        };
        seven_day?: {
            used_percentage?: number;
            resets_at?: number;
        };
    };
}
export type BodySize = 'tiny' | 'small' | 'medium' | 'chubby' | 'thicc';
export type AnimalType = 'cat' | 'penguin' | 'duck' | 'octopus' | 'bunny';
export type Animation = 'idle' | 'busy' | 'danger' | 'sleep';
export interface AnimalFrame {
    lines: string[];
    width: number;
}
export interface PetColors {
    body: string;
    accent: string;
    face: string;
    blush: string;
}
export interface GitStatus {
    branch: string;
    isDirty: boolean;
    ahead: number;
    behind: number;
    modified: number;
    added: number;
    deleted: number;
    untracked: number;
    insertions: number;
    deletions: number;
    fileCount: number;
    lastCommit: string;
    stashCount: number;
    dominantFileType: string | null;
}
