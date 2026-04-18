/**
 * codachi config — interactive TUI wizard for configuration.
 * Uses readline + ANSI only, no external deps.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { RESET, DIM, rgb } from './render/colors.js';
import { PALETTES } from './identity.js';
import { getAnimalFrame, getAnimalName } from './animals/index.js';
import { CONFIG_PATH } from './config.js';
import type { CodachiConfig } from './config.js';
import type { AnimalType } from './types.js';
import { DEFAULT_WIDGET_ORDER } from './widgets/index.js';

const BOLD = '\x1b[1m';
const CYAN = rgb(100, 200, 255);
const GREEN = rgb(80, 220, 120);
const YELLOW = rgb(255, 200, 50);
const GRAY = rgb(140, 140, 140);

const ANIMALS: AnimalType[] = ['cat', 'penguin', 'owl', 'octopus', 'bunny'];

const PALETTE_NAMES = [
  'Coral Flame', 'Electric Blue', 'Neon Mint', 'Purple Haze', 'Hot Pink',
  'Golden Sun', 'Ice Violet', 'Cherry Blossom', 'Cyan Surge', 'Tangerine',
];

function rl(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(r: readline.Interface, prompt: string): Promise<string> {
  return new Promise(resolve => r.question(prompt, answer => resolve(answer.trim())));
}

function previewAnimal(type: AnimalType): string {
  const frame = getAnimalFrame(type, 'medium', 'idle', 0);
  const palette = PALETTES[0];
  const lines = frame.lines.map(l => {
    let out = '';
    for (const ch of l) {
      if ('oO^->.<!w'.includes(ch)) out += palette.face + ch + RESET;
      else if ('()=/\\|_'.includes(ch)) out += palette.body + ch + RESET;
      else if (ch === '~') out += palette.accent + ch + RESET;
      else if (ch === '"') out += palette.blush + ch + RESET;
      else out += ch;
    }
    return out;
  });
  return lines.map(l => '     ' + l).join('\n');
}

function previewPalette(idx: number): string {
  const p = PALETTES[idx];
  const sample = '████████';
  return `${p.body}${sample}${RESET} ${p.accent}${sample}${RESET} ${p.face}${sample}${RESET} ${p.blush}${sample}${RESET}`;
}

function header(title: string): void {
  console.log('');
  console.log(`${BOLD}${CYAN}${title}${RESET}`);
  console.log(GRAY + '─'.repeat(40) + RESET);
}

function success(msg: string): void {
  console.log(`${GREEN}✓${RESET} ${msg}`);
}

async function promptName(r: readline.Interface, existing?: string): Promise<string | undefined> {
  header('Pet name');
  console.log(`${DIM}Give your pet a name (leave blank for species name)${RESET}`);
  const def = existing ? ` ${DIM}(current: ${existing})${RESET}` : '';
  const answer = await ask(r, `\n  Name${def}: `);
  return answer || existing || undefined;
}

async function promptAnimal(r: readline.Interface, existing?: AnimalType): Promise<AnimalType | undefined> {
  header('Animal species');
  console.log(`${DIM}Pick your companion (or leave blank for random)${RESET}\n`);

  for (let i = 0; i < ANIMALS.length; i++) {
    const type = ANIMALS[i];
    const name = getAnimalName(type);
    const marker = existing === type ? `${GREEN}●${RESET}` : ' ';
    console.log(`  ${marker} ${YELLOW}${i + 1}${RESET}. ${name}`);
  }
  console.log(`    ${YELLOW}6${RESET}. ${DIM}random (each session picks different)${RESET}`);

  const answer = await ask(r, '\n  Choice [1-6]: ');
  const n = parseInt(answer, 10);
  if (n >= 1 && n <= 5) {
    const selected = ANIMALS[n - 1];
    console.log('\n' + previewAnimal(selected));
    return selected;
  }
  return undefined;
}

async function promptPalette(r: readline.Interface, existing?: number): Promise<number | undefined> {
  header('Color palette');
  console.log(`${DIM}Pick a color scheme (or leave blank for random)${RESET}\n`);

  for (let i = 0; i < PALETTES.length; i++) {
    const marker = existing === i ? `${GREEN}●${RESET}` : ' ';
    const idLabel = String(i).padStart(2, ' ');
    const name = PALETTE_NAMES[i].padEnd(15, ' ');
    console.log(`  ${marker} ${YELLOW}${idLabel}${RESET}  ${name}  ${previewPalette(i)}`);
  }
  console.log(`    ${YELLOW}11${RESET}  ${DIM}random${RESET}`);

  const answer = await ask(r, '\n  Choice [0-11]: ');
  const n = parseInt(answer, 10);
  if (n >= 0 && n <= 9) return n;
  return undefined;
}

async function promptBool(r: readline.Interface, label: string, existing: boolean = true): Promise<boolean> {
  const def = existing ? 'Y/n' : 'y/N';
  const answer = (await ask(r, `  ${label} [${def}]: `)).toLowerCase();
  if (answer === '') return existing;
  return answer === 'y' || answer === 'yes';
}

async function promptDisplay(r: readline.Interface, existing: CodachiConfig): Promise<Partial<CodachiConfig>> {
  header('Display options');
  console.log(`${DIM}What to show in the statusline${RESET}\n`);
  return {
    showTokens:   await promptBool(r, 'Show token count (555K/1M)', existing.showTokens ?? true),
    showVelocity: await promptBool(r, 'Show burn speed + time remaining (^3%/m ~15m)', existing.showVelocity ?? true),
    showGit:      await promptBool(r, 'Show git status line', existing.showGit ?? true),
  };
}

function loadExisting(): CodachiConfig {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) as CodachiConfig;
  } catch {
    return {};
  }
}

function saveConfig(cfg: CodachiConfig): void {
  // Strip undefined values
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg)) {
    if (v !== undefined) clean[k] = v;
  }
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(clean, null, 2) + '\n');
}

export async function runConfigure(): Promise<void> {
  const r = rl();
  const existing = loadExisting();

  console.clear();
  console.log(`${BOLD}${CYAN}╭─ codachi configuration ─╮${RESET}`);
  console.log(`${DIM}Press Enter at any prompt to skip / keep default${RESET}`);

  const next: CodachiConfig = { ...existing };

  next.name = await promptName(r, existing.name);
  const animal = await promptAnimal(r, existing.animal);
  if (animal !== undefined) next.animal = animal; else delete next.animal;
  const palette = await promptPalette(r, existing.palette);
  if (palette !== undefined) next.palette = palette; else delete next.palette;

  Object.assign(next, await promptDisplay(r, existing));
  next.widgets = next.widgets ?? DEFAULT_WIDGET_ORDER;

  r.close();

  saveConfig(next);

  console.log('');
  success(`Saved to ${CONFIG_PATH}`);
  console.log(`${DIM}Restart Claude Code to see your changes.${RESET}`);
  console.log('');
}
