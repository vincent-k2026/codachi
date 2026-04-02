import type { StdinData, PetColors, AnimalType, BodySize, Animation, GitStatus } from '../types.js';
import { RESET, DIM, colorize, dim, bold, rgb, progressBar, getContextColor, getUsageColor } from './colors.js';
import { getAnimalFrame, getAnimalName, getBodySize, getAnimation } from '../animals/index.js';
import { getMoodMessage } from '../mood.js';

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

// Strip ANSI for visual length calculation
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visualLength(str: string): number {
  return stripAnsi(str).length;
}

function getTerminalWidth(): number {
  const w = process.stderr?.columns || process.stdout?.columns;
  if (typeof w === 'number' && w > 0) return w;
  const env = parseInt(process.env.COLUMNS ?? '', 10);
  if (env > 0) return env;
  return 120;
}

function truncate(str: string, maxWidth: number): string {
  if (visualLength(str) <= maxWidth) return str;
  // Simple truncation - strip ANSI, cut, add ...
  const plain = stripAnsi(str);
  return plain.slice(0, maxWidth - 3) + '...' + RESET;
}

export function render(input: RenderInput): void {
  const {
    contextPercent, modelName, animalType, colors, git,
    fiveHourUsage, sevenDayUsage, frameIndex,
  } = input;

  const termWidth = getTerminalWidth();
  const size: BodySize = getBodySize(contextPercent);
  const hasRunningTools = false; // Could be enhanced with transcript parsing
  const animation: Animation = getAnimation(contextPercent, hasRunningTools);

  // Get the animal frame
  const frame = getAnimalFrame(animalType, size, animation, frameIndex);

  // Get mood message
  const mood = getMoodMessage({
    contextPercent, size, animation, animalType, git, fiveHourUsage, frameIndex,
  });

  // --- Line 1-3: Pet ASCII art (colorized) + mood on the right ---
  const animalName = getAnimalName(animalType);

  // Colorize the pet lines
  const colorizedPetLines = frame.lines.map(line => {
    return colorizePetLine(line, colors);
  });

  // Build mood bubble
  const moodBubble = `${DIM}${colors.face} ${mood}${RESET}`;

  // Compose pet area: pet art on left, mood to the right of middle line
  const petAreaWidth = frame.width + 2;
  const outputLines: string[] = [];

  for (let i = 0; i < 3; i++) {
    const petLine = colorizedPetLines[i] || '';
    if (i === 0) {
      // First line: pet name + model
      const header = `${colors.accent}${animalName}${RESET} ${DIM}[${modelName}]${RESET}`;
      const pad = ' '.repeat(Math.max(1, petAreaWidth - visualLength(petLine)));
      outputLines.push(truncate(`${petLine}${pad}${header}`, termWidth));
    } else if (i === 1) {
      // Middle line: mood message
      const pad = ' '.repeat(Math.max(1, petAreaWidth - visualLength(petLine)));
      outputLines.push(truncate(`${petLine}${pad}${moodBubble}`, termWidth));
    } else {
      // Bottom line: just the pet
      outputLines.push(truncate(petLine, termWidth));
    }
  }

  // --- Line 4: Context bar + Usage bar ---
  const contextBar = progressBar(contextPercent, 12, getContextColor);
  const contextLabel = contextPercent >= 85
    ? `${rgb(255, 80, 80)}${contextPercent}%${RESET}`
    : contextPercent >= 70
      ? `${rgb(255, 200, 50)}${contextPercent}%${RESET}`
      : `${rgb(80, 220, 120)}${contextPercent}%${RESET}`;

  let infoLine = `${DIM}Ctx${RESET} ${contextBar} ${contextLabel}`;

  if (fiveHourUsage !== null) {
    const usageBar = progressBar(fiveHourUsage, 8, getUsageColor);
    const usageLabel = fiveHourUsage >= 90
      ? `${rgb(255, 80, 80)}${fiveHourUsage}%${RESET}`
      : fiveHourUsage >= 75
        ? `${rgb(200, 100, 255)}${fiveHourUsage}%${RESET}`
        : `${rgb(100, 150, 255)}${fiveHourUsage}%${RESET}`;
    infoLine += ` ${DIM}|${RESET} ${DIM}5h${RESET} ${usageBar} ${usageLabel}`;
  }

  if (sevenDayUsage !== null && sevenDayUsage >= 30) {
    const usage7dBar = progressBar(sevenDayUsage, 6, getUsageColor);
    infoLine += ` ${DIM}|${RESET} ${DIM}7d${RESET} ${usage7dBar} ${sevenDayUsage}%`;
  }

  outputLines.push(truncate(infoLine, termWidth));

  // --- Line 5: Git status ---
  if (git) {
    let gitLine = `${DIM}git:(${RESET}${colors.accent}${git.branch}${git.isDirty ? '*' : ''}${RESET}${DIM})${RESET}`;

    const stats: string[] = [];
    if (git.modified > 0) stats.push(`${rgb(255, 200, 50)}~${git.modified}${RESET}`);
    if (git.added > 0) stats.push(`${rgb(80, 220, 120)}+${git.added}${RESET}`);
    if (git.deleted > 0) stats.push(`${rgb(255, 80, 80)}-${git.deleted}${RESET}`);
    if (git.untracked > 0) stats.push(`${DIM}?${git.untracked}${RESET}`);

    if (stats.length > 0) {
      gitLine += ' ' + stats.join(' ');
    }

    if (git.ahead > 0) gitLine += ` ${DIM}ahead ${git.ahead}${RESET}`;
    if (git.behind > 0) gitLine += ` ${DIM}behind ${git.behind}${RESET}`;

    outputLines.push(truncate(gitLine, termWidth));
  }

  // Output all lines
  for (const line of outputLines) {
    console.log(`${RESET}${line}`);
  }
}

/**
 * Colorize a pet ASCII art line by applying different colors to different character types.
 * Structural chars get body color, face chars get face color, etc.
 */
function colorizePetLine(line: string, colors: PetColors): string {
  let result = '';
  let currentColor = '';

  for (const ch of line) {
    let targetColor: string;

    if ('oO@.-^~><' .includes(ch)) {
      // Face features: eyes, mouth
      targetColor = colors.face;
    } else if ('()[]{}' .includes(ch)) {
      // Body outline
      targetColor = colors.body;
    } else if ('/\\|_=─┌┐└┘│┬' .includes(ch)) {
      // Structure
      targetColor = colors.body;
    } else if ('Uu' .includes(ch)) {
      // Ears (dog)
      targetColor = colors.accent;
    } else if ('Vv' .includes(ch)) {
      // Ears (fox)
      targetColor = colors.accent;
    } else if ('wYdb' .includes(ch)) {
      // Paws/feet
      targetColor = colors.blush;
    } else if (ch === '!' || ch === '?' || ch === 'z' || ch === 'Z') {
      // Effects
      targetColor = colors.face;
    } else if (ch === '◕' || ch === '◡' || ch === '‿' || ch === '⊙' || ch === '▽' || ch === '□' || ch === '○') {
      // Unicode face features (panda)
      targetColor = colors.face;
    } else if (ch === '"') {
      // Rabbit tail
      targetColor = colors.accent;
    } else {
      targetColor = '';
    }

    if (targetColor !== currentColor) {
      if (targetColor === '') {
        result += RESET;
      } else {
        result += targetColor;
      }
      currentColor = targetColor;
    }
    result += ch;
  }

  if (currentColor !== '') {
    result += RESET;
  }

  return result;
}
