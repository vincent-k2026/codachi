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

export type AnimalType = 'cat' | 'dog' | 'rabbit' | 'panda' | 'penguin' | 'fox';

export type Animation = 'idle' | 'busy' | 'danger' | 'sleep';

export interface AnimalFrame {
  lines: string[];   // 3 lines of raw ASCII (no color)
  width: number;     // visual width of the widest line
}

export interface Animal {
  name: string;
  type: AnimalType;
  getFrame(size: BodySize, animation: Animation, frameIndex: number): AnimalFrame;
}

export interface PetColors {
  body: string;       // ANSI escape for body
  accent: string;     // ANSI escape for ears/tail/features
  face: string;       // ANSI escape for eyes/mouth
  blush: string;      // ANSI escape for cheeks/nose
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
}

export interface PetState {
  frameIndex: number;
  lastUpdate: number;
  sessionStart?: number;
}
