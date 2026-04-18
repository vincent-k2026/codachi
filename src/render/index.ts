import type { PetColors, AnimalType, BodySize, Animation, GitStatus } from '../types.js';
import type { ProjectInfo } from '../project.js';
import { RESET, DIM, rgb } from './colors.js';
import { getAnimalFrame, getBodySize, getAnimation } from '../animals/index.js';
import { getMoodMessage } from '../mood.js';
import { stringWidth } from '../width.js';
import { renderWidgetLine, resolveWidgetOrder } from '../widgets/index.js';
import { getConfig } from '../config.js';

import type { RelationshipTier } from '../state.js';
import type { EventContext } from '../events.js';

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
  tokenSummary: string | null;
  relationshipTier: RelationshipTier;
  sessionNumber: number;
  animTick: number;
  moodTick: number;
  uptime: string;
  eventContext: EventContext;
  petName: string;
  contextTimeRemaining: string | null;
  tierUpgraded: boolean;
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
    } else if (ch === '*') {
      targetColor = colors.face;
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

// Events that make the pet happy (squinting eyes, wagging tail)
const HAPPY_EVENTS = new Set([
  'test_passed', 'build_passed', 'recovered', 'git_commit', 'git_push',
  'many_edits', 'many_actions', 'first_action',
]);

export function render(input: RenderInput): void {
  const {
    contextPercent, modelName, animalType, colors, git,
    fiveHourUsage, sevenDayUsage, animTick, moodTick,
  } = input;

  const rawTermWidth = getTerminalWidth();
  const isNarrow = rawTermWidth < 80;
  const termWidth = Math.max(40, rawTermWidth); // allow narrower terminals
  const size: BodySize = getBodySize(contextPercent);
  let animation: Animation = getAnimation(contextPercent, false);

  // Event-driven expression: happy eyes when positive event is hot
  const { eventContext, tierUpgraded } = input;
  if (animation === 'idle' && eventContext.freshness === 'hot' && eventContext.category) {
    if (HAPPY_EVENTS.has(eventContext.category) || tierUpgraded) {
      animation = 'happy';
    }
  }

  const frame = getAnimalFrame(animalType, size, animation, animTick);
  const petLines = frame.lines.map(l => colorizePetLine(l, colors));
  const petW = frame.width + 2;

  const { contextVelocity, relationshipTier, sessionNumber, petName, contextTimeRemaining } = input;

  const mood = getMoodMessage({
    contextPercent, size, animation, animalType, git,
    fiveHourUsage: fiveHourUsage?.percent ?? null,
    contextVelocity,
    relationshipTier, sessionNumber, moodTick,
    eventContext, tierUpgraded,
  });

  const { body: C, accent: A, face: F, blush: B } = colors;
  const SEP = `${DIM}|${RESET}`;
  const { tokenSummary } = input;

  // Line 1: Widget-based rendering. On narrow terminals drop optional widgets.
  let widgetOrder = resolveWidgetOrder(getConfig().widgets);
  if (isNarrow && widgetOrder.length > 3) {
    widgetOrder = widgetOrder.slice(0, 3);
  }
  const line1 = renderWidgetLine(widgetOrder, {
    contextPercent,
    modelName,
    tokenSummary: tokenSummary ?? null,
    contextVelocity,
    contextTimeRemaining: contextTimeRemaining ?? null,
    fiveHourUsage,
    sevenDayUsage,
    colors,
  });

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
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const { project, uptime } = input;
  let line3 = `${A}${petName}${RESET} ${F}${mood}${RESET}`;
  line3 += ` ${SEP} ${C}${project.name}${RESET}`;
  if (project.lang) line3 += ` ${A}[${project.lang}]${RESET}`;
  line3 += ` ${SEP} ${B}${timeStr}${RESET}`;
  line3 += ` ${SEP} ${F}up ${uptime}${RESET}`;

  // Compose — output pet on left, info on right
  const infoWidth = Math.max(1, termWidth - petW);
  const infos = [line1, line2, line3];
  for (let i = 0; i < 3; i++) {
    const pet = petLines[i] ?? '';
    const pad = ' '.repeat(Math.max(0, petW - visualLength(pet)));
    console.log(`${RESET}${pet}${pad}${truncate(infos[i] || '', infoWidth)}`);
  }
}
