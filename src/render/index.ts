import type { PetColors, AnimalType, BodySize, Animation, GitStatus } from '../types.js';
import type { ProjectInfo } from '../project.js';
import { RESET, DIM, rgb, progressBar, getContextColor, getUsageColor } from './colors.js';
import { getAnimalFrame, getAnimalName, getBodySize, getAnimation } from '../animals/index.js';
import { getMoodMessage } from '../mood.js';
import { stringWidth } from '../width.js';

import type { RelationshipTier } from '../state.js';

interface RenderInput {
  contextPercent: number;
  modelName: string;
  animalType: AnimalType;
  colors: PetColors;
  git: GitStatus | null;
  project: ProjectInfo;
  fiveHourUsage: { percent: number; resetsIn: string | null } | null;
  sevenDayUsage: { percent: number; resetsIn: string | null } | null;
  contextVelocity: number;
  cacheHitRate: number | null;
  relationshipTier: RelationshipTier;
  sessionNumber: number;
  animTick: number;
  moodTick: number;
  uptime: string;
}

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
  let result = '';
  let width = 0;
  const target = maxWidth - 3;
  let i = 0;
  while (i < str.length && width < target) {
    const ansi = str.slice(i).match(/^\x1b\[[^m]*m/);
    if (ansi) {
      result += ansi[0];
      i += ansi[0].length;
      continue;
    }
    const ch = str[i];
    const cw = stringWidth(ch);
    if (width + cw > target) break;
    result += ch;
    width += cw;
    i++;
  }
  return result + '...' + RESET;
}

function colorizePetLine(line: string, colors: PetColors): string {
  let result = '';
  let currentColor = '';
  for (const ch of line) {
    let targetColor: string;
    if ('oO^->.<!w'.includes(ch)) {
      targetColor = colors.face;
    } else if ('()=/\\|_'.includes(ch)) {
      targetColor = colors.body;
    } else if ('UuVv@'.includes(ch)) {
      targetColor = colors.accent;
    } else if ('Ydb'.includes(ch)) {
      targetColor = colors.blush;
    } else if (ch === '~') {
      targetColor = colors.accent;
    } else if ('!?zZ'.includes(ch)) {
      targetColor = colors.face;
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

export function render(input: RenderInput): void {
  const {
    contextPercent, modelName, animalType, colors, git,
    fiveHourUsage, sevenDayUsage, animTick, moodTick,
  } = input;

  const termWidth = getTerminalWidth();
  const size: BodySize = getBodySize(contextPercent);
  const animation: Animation = getAnimation(contextPercent, false);

  const frame = getAnimalFrame(animalType, size, animation, animTick);
  const petLines = frame.lines.map(l => colorizePetLine(l, colors));
  const petW = frame.width + 2;

  const { contextVelocity, cacheHitRate, relationshipTier, sessionNumber } = input;

  const mood = getMoodMessage({
    contextPercent, size, animation, animalType, git,
    fiveHourUsage: fiveHourUsage?.percent ?? null,
    contextVelocity, cacheHitRate, relationshipTier, sessionNumber, moodTick,
  });

  const { body: C, accent: A, face: F, blush: B } = colors;
  const SEP = `${DIM}|${RESET}`;

  // Line 1: Claude
  const ctxBar = progressBar(contextPercent, 10, getContextColor);
  const ctxColor = contextPercent >= 85 ? rgb(255, 80, 80)
    : contextPercent >= 70 ? rgb(255, 200, 50) : rgb(80, 220, 120);
  // Context velocity indicator
  let velStr = '';
  if (contextVelocity > 0.5) {
    const vColor = contextVelocity > 5 ? rgb(255, 80, 80) : contextVelocity > 2 ? rgb(255, 200, 50) : rgb(80, 220, 120);
    velStr = ` ${vColor}^${contextVelocity}%/m${RESET}`;
  }

  // Cache hit rate
  let cacheStr = '';
  if (cacheHitRate !== null) {
    const cColor = cacheHitRate >= 60 ? rgb(80, 220, 120) : cacheHitRate >= 30 ? rgb(255, 200, 50) : rgb(255, 80, 80);
    cacheStr = ` ${cColor}cache:${cacheHitRate}%${RESET}`;
  }

  let line1 = `${A}[${modelName}]${RESET} ${ctxBar} ${ctxColor}${contextPercent}%${RESET}${velStr}${cacheStr}`;
  if (fiveHourUsage) {
    const u = fiveHourUsage;
    const uBar = progressBar(u.percent, 6, getUsageColor);
    const uColor = u.percent >= 90 ? rgb(255, 80, 80) : u.percent >= 75 ? rgb(200, 100, 255) : rgb(100, 150, 255);
    let rs = u.resetsIn ? ` ${B}~${u.resetsIn}${RESET}` : '';
    line1 += ` ${SEP} ${A}5h${RESET} ${uBar} ${uColor}${u.percent}%${RESET}${rs}`;
  }
  if (sevenDayUsage && sevenDayUsage.percent >= 10) {
    const u7 = sevenDayUsage;
    const u7Bar = progressBar(u7.percent, 5, getUsageColor);
    const u7Color = u7.percent >= 90 ? rgb(255, 80, 80) : u7.percent >= 75 ? rgb(200, 100, 255) : rgb(100, 150, 255);
    let rs = u7.resetsIn ? ` ${B}~${u7.resetsIn}${RESET}` : '';
    line1 += ` ${SEP} ${A}7d${RESET} ${u7Bar} ${u7Color}${u7.percent}%${RESET}${rs}`;
  }

  // Line 2: Git
  let line2 = '';
  if (!git) {
    line2 = `${DIM}(no git repo)${RESET}`;
  } else if (git) {
    const dm = git.isDirty ? '*' : '';
    line2 = `${C}git:(${A}${git.branch}${dm}${C})${RESET}`;
    const fs: string[] = [];
    if (git.modified > 0) fs.push(`${rgb(255, 200, 50)}~${git.modified}${RESET}`);
    if (git.added > 0) fs.push(`${rgb(80, 220, 120)}+${git.added}${RESET}`);
    if (git.deleted > 0) fs.push(`${rgb(255, 80, 80)}-${git.deleted}${RESET}`);
    if (git.untracked > 0) fs.push(`${rgb(180, 180, 200)}?${git.untracked}${RESET}`);
    if (fs.length > 0) line2 += ` ${fs.join(' ')}`;
    if (git.insertions > 0 || git.deletions > 0) {
      const lp: string[] = [];
      if (git.insertions > 0) lp.push(`${rgb(80, 220, 120)}+${git.insertions}${RESET}`);
      if (git.deletions > 0) lp.push(`${rgb(255, 80, 80)}-${git.deletions}${RESET}`);
      line2 += ` ${SEP} ${lp.join(' ')} ${C}lines${RESET}`;
    }
    if (git.ahead > 0 || git.behind > 0) {
      const rp: string[] = [];
      if (git.ahead > 0) rp.push(`${rgb(255, 200, 50)}up${git.ahead}${RESET}`);
      if (git.behind > 0) rp.push(`${rgb(200, 100, 255)}dn${git.behind}${RESET}`);
      line2 += ` ${SEP} ${rp.join(' ')}`;
    }
    if (git.lastCommit) line2 += ` ${SEP} ${B}last:${RESET} ${F}${git.lastCommit}${RESET}`;
    if (git.stashCount > 0) line2 += ` ${SEP} ${rgb(255, 200, 100)}stash:${git.stashCount}${RESET}`;
  }

  // Line 3: Pet
  const animalName = getAnimalName(animalType);
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const { project, uptime } = input;
  let line3 = `${A}${animalName}${RESET} ${F}${mood}${RESET}`;
  line3 += ` ${SEP} ${C}${project.name}${RESET}`;
  if (project.lang) line3 += ` ${A}[${project.lang}]${RESET}`;
  line3 += ` ${SEP} ${B}${timeStr}${RESET}`;
  line3 += ` ${SEP} ${F}up ${uptime}${RESET}`;

  // Compose
  const infos = [line1, line2, line3];
  for (let i = 0; i < 3; i++) {
    const pet = petLines[i] ?? '';
    const pad = ' '.repeat(Math.max(0, petW - visualLength(pet)));
    console.log(`${RESET}${pet}${pad}${truncate(infos[i] || '', termWidth - petW)}`);
  }
}
