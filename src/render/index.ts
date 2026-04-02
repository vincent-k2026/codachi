import type { PetColors, AnimalType, BodySize, Animation, GitStatus } from '../types.js';
import type { ProjectInfo } from '../project.js';
import { RESET, DIM, rgb, progressBar, getContextColor, getUsageColor } from './colors.js';
import { getAnimalFrame, getAnimalName, getBodySize, getAnimation } from '../animals/index.js';
import { getMoodMessage } from '../mood.js';

interface RenderInput {
  contextPercent: number;
  modelName: string;
  animalType: AnimalType;
  colors: PetColors;
  git: GitStatus | null;
  project: ProjectInfo;
  fiveHourUsage: { percent: number; resetsIn: string | null } | null;
  sevenDayUsage: { percent: number; resetsIn: string | null } | null;
  animTick: number;
  moodTick: number;
  uptime: string;
}

import { stringWidth } from '../width.js';

function visualLength(str: string): number {
  return stringWidth(str);
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
  // Walk through keeping ANSI but counting visual width
  const raw = str;
  let result = '';
  let width = 0;
  const target = maxWidth - 3;
  let i = 0;
  while (i < raw.length && width < target) {
    // Check for ANSI escape
    const ansi = raw.slice(i).match(/^\x1b\[[0-9;]*m/);
    if (ansi) {
      result += ansi[0];
      i += ansi[0].length;
      continue;
    }
    const ch = raw[i];
    const cw = stringWidth(ch);
    if (width + cw > target) break;
    result += ch;
    width += cw;
    i++;
  }
  return result + '...' + RESET;
}

function padPetLine(colorizedLine: string, targetWidth: number): string {
  const vis = visualLength(colorizedLine);
  const pad = Math.max(0, targetWidth - vis);
  return colorizedLine + ' '.repeat(pad);
}

export function render(input: RenderInput): void {
  const {
    contextPercent, modelName, animalType, colors, git,
    fiveHourUsage, sevenDayUsage, animTick, moodTick,
  } = input;

  const termWidth = getTerminalWidth();
  const size: BodySize = getBodySize(contextPercent);
  const hasRunningTools = false;
  const animation: Animation = getAnimation(contextPercent, hasRunningTools);

  const frame = getAnimalFrame(animalType, size, animation, animTick);
  const mood = getMoodMessage({
    contextPercent, size, animation, animalType, git,
    fiveHourUsage: fiveHourUsage?.percent ?? null, moodTick,
  });

  const petLines = frame.lines.map(line => colorizePetLine(line, colors));
  const petWidth = frame.width + 2;

  // Use pet colors to theme the info lines
  const { body: C, accent: A, face: F, blush: B } = colors;
  const SEP = `${DIM}│${RESET}`;

  // ═══════════════════════════════════════════════════════════════
  // Line 1 — Claude: [Model] Ctx bar % │ 5h bar % ~reset │ 7d %
  // ═══════════════════════════════════════════════════════════════
  const ctxBar = progressBar(contextPercent, 10, getContextColor);
  const ctxColor = contextPercent >= 85 ? rgb(255, 80, 80)
    : contextPercent >= 70 ? rgb(255, 200, 50)
    : rgb(80, 220, 120);

  let line1 = `${A}[${modelName}]${RESET} ${ctxBar} ${ctxColor}${contextPercent}%${RESET}`;

  if (fiveHourUsage) {
    const u = fiveHourUsage;
    const uBar = progressBar(u.percent, 6, getUsageColor);
    const uColor = u.percent >= 90 ? rgb(255, 80, 80)
      : u.percent >= 75 ? rgb(200, 100, 255)
      : rgb(100, 150, 255);
    let resetStr = '';
    if (u.resetsIn) resetStr = ` ${B}~${u.resetsIn}${RESET}`;
    line1 += ` ${SEP} ${A}5h${RESET} ${uBar} ${uColor}${u.percent}%${RESET}${resetStr}`;
  }

  if (sevenDayUsage && sevenDayUsage.percent >= 10) {
    const u7 = sevenDayUsage;
    const u7Bar = progressBar(u7.percent, 5, getUsageColor);
    const u7Color = u7.percent >= 90 ? rgb(255, 80, 80)
      : u7.percent >= 75 ? rgb(200, 100, 255)
      : rgb(100, 150, 255);
    let reset7 = '';
    if (u7.resetsIn) reset7 = ` ${B}~${u7.resetsIn}${RESET}`;
    line1 += ` ${SEP} ${A}7d${RESET} ${u7Bar} ${u7Color}${u7.percent}%${RESET}${reset7}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // Line 2 — Git: branch, files, lines, push, last commit, stash
  // ═══════════════════════════════════════════════════════════════
  let line2 = '';
  if (git) {
    const dirtyMark = git.isDirty ? '*' : '';
    line2 = `${C}git:(${A}${git.branch}${dirtyMark}${C})${RESET}`;

    // File-level changes
    const fileStats: string[] = [];
    if (git.modified > 0) fileStats.push(`${rgb(255, 200, 50)}~${git.modified}${RESET}`);
    if (git.added > 0) fileStats.push(`${rgb(80, 220, 120)}+${git.added}${RESET}`);
    if (git.deleted > 0) fileStats.push(`${rgb(255, 80, 80)}-${git.deleted}${RESET}`);
    if (git.untracked > 0) fileStats.push(`${rgb(180, 180, 200)}?${git.untracked}${RESET}`);
    if (fileStats.length > 0) {
      line2 += ` ${fileStats.join(' ')}`;
    }

    // Line-level changes
    if (git.insertions > 0 || git.deletions > 0) {
      const lineParts: string[] = [];
      if (git.insertions > 0) lineParts.push(`${rgb(80, 220, 120)}+${git.insertions}${RESET}`);
      if (git.deletions > 0) lineParts.push(`${rgb(255, 80, 80)}-${git.deletions}${RESET}`);
      line2 += ` ${SEP} ${lineParts.join(' ')} ${C}lines${RESET}`;
    }

    // Ahead/behind
    if (git.ahead > 0 || git.behind > 0) {
      const remoteParts: string[] = [];
      if (git.ahead > 0) remoteParts.push(`${rgb(255, 200, 50)}↑${git.ahead}${RESET}`);
      if (git.behind > 0) remoteParts.push(`${rgb(200, 100, 255)}↓${git.behind}${RESET}`);
      line2 += ` ${SEP} ${remoteParts.join(' ')}`;
    }

    // Last commit
    if (git.lastCommit) {
      line2 += ` ${SEP} ${B}last:${RESET} ${F}${git.lastCommit}${RESET}`;
    }

    // Stash
    if (git.stashCount > 0) {
      line2 += ` ${SEP} ${rgb(255, 200, 100)}stash:${git.stashCount}${RESET}`;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Line 3 — Pet: name, mood, time
  // ═══════════════════════════════════════════════════════════════
  const animalName = getAnimalName(animalType);
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${y}-${mo}-${d} ${h}:${mi}`;

  const { project, uptime } = input;

  let line3 = `${A}${animalName}${RESET} ${F}${mood}${RESET}`;
  line3 += ` ${SEP} ${C}${project.name}${RESET}`;
  if (project.lang) {
    line3 += ` ${A}[${project.lang}]${RESET}`;
  }
  line3 += ` ${SEP} ${B}${timeStr}${RESET}`;
  line3 += ` ${SEP} ${F}up ${uptime}${RESET}`;

  // ═══════════════════════════════════════════════════════════════
  // Compose: pet on left, info on right
  // ═══════════════════════════════════════════════════════════════
  const infos = [line1, line2, line3];
  const outputLines: string[] = [];

  for (let i = 0; i < 3; i++) {
    const pet = padPetLine(petLines[i] || '', petWidth);
    const info = infos[i] || '';
    outputLines.push(truncate(`${pet}${info}`, termWidth));
  }

  for (const line of outputLines) {
    console.log(`${RESET}${line}`);
  }
}

function colorizePetLine(line: string, colors: PetColors): string {
  let result = '';
  let currentColor = '';

  for (const ch of line) {
    let targetColor: string;

    // Face: eyes, nose, mouth, expressions
    if ('oO^->.<!ᴥω'.includes(ch)) {
      targetColor = colors.face;
    // Body: structure
    } else if ('()=/\\|_'.includes(ch)) {
      targetColor = colors.body;
    // Ears
    } else if ('UuVv@'.includes(ch)) {
      targetColor = colors.accent;
    // Paws, feet, cute bits
    } else if ('wYdb'.includes(ch)) {
      targetColor = colors.blush;
    // Tail
    } else if (ch === '~') {
      targetColor = colors.accent;
    // Effects
    } else if ('!?zZ'.includes(ch)) {
      targetColor = colors.face;
    // Rabbit ears/feet
    } else if (ch === '"') {
      targetColor = colors.blush;
    } else {
      targetColor = '';
    }

    if (targetColor !== currentColor) {
      result += targetColor === '' ? RESET : targetColor;
      currentColor = targetColor;
    }
    result += ch;
  }

  if (currentColor !== '') result += RESET;
  return result;
}
