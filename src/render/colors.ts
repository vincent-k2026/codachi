/**
 * Color output with automatic terminal capability detection.
 *
 * Four tiers, picked once at import time (cached):
 *   - truecolor  (24-bit RGB)  ← COLORTERM=truecolor|24bit, iTerm2, modern terminals
 *   - ansi256    (256-color)   ← TERM contains "256"
 *   - ansi16     (16-color)    ← any "TERM" ending in "color" or common Unix TERMs
 *   - none       (monochrome)  ← NO_COLOR=1, TERM=dumb, or piped output without FORCE_COLOR
 *
 * Override with FORCE_COLOR=0|1|2|3 (std convention) or CODACHI_COLOR=truecolor|256|16|none.
 */

export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';

export type ColorLevel = 'truecolor' | 'ansi256' | 'ansi16' | 'none';

function detectColorLevel(): ColorLevel {
  const env = process.env;

  // NO_COLOR spec: https://no-color.org — any non-empty value disables color.
  if (env.NO_COLOR && env.NO_COLOR !== '') return 'none';

  // Explicit opt-in for codachi.
  const override = env.CODACHI_COLOR;
  if (override === 'truecolor' || override === '24bit') return 'truecolor';
  if (override === '256' || override === 'ansi256') return 'ansi256';
  if (override === '16' || override === 'ansi16') return 'ansi16';
  if (override === 'none' || override === 'mono') return 'none';

  // Std FORCE_COLOR: 0=off, 1=16, 2=256, 3=truecolor.
  const forceRaw = env.FORCE_COLOR;
  if (forceRaw !== undefined) {
    const force = parseInt(forceRaw);
    if (force === 0) return 'none';
    if (force === 1) return 'ansi16';
    if (force === 2) return 'ansi256';
    if (force >= 3) return 'truecolor';
  }

  const term = (env.TERM || '').toLowerCase();
  if (term === 'dumb') return 'none';

  const colorterm = (env.COLORTERM || '').toLowerCase();
  if (colorterm === 'truecolor' || colorterm === '24bit') return 'truecolor';

  // Well-known truecolor terminals.
  if (env.TERM_PROGRAM === 'iTerm.app' || env.TERM_PROGRAM === 'WezTerm' || env.TERM_PROGRAM === 'vscode') {
    return 'truecolor';
  }
  if (env.WT_SESSION || env.KITTY_WINDOW_ID || env.ALACRITTY_SOCKET) return 'truecolor';

  if (term.includes('256')) return 'ansi256';
  if (term.includes('color') || term === 'xterm' || term === 'screen' || term === 'linux' || term === 'ansi') {
    return 'ansi16';
  }

  // Last resort: if stdout is a TTY, assume basic 16-color; otherwise no color.
  return process.stdout.isTTY ? 'ansi16' : 'none';
}

export const COLOR_LEVEL: ColorLevel = detectColorLevel();

// ── RGB → level-appropriate SGR ─────────────────────

function rgbToAnsi256(r: number, g: number, b: number): number {
  // Grayscale shortcut.
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  return 16
    + 36 * Math.round((r / 255) * 5)
    + 6 * Math.round((g / 255) * 5)
    + Math.round((b / 255) * 5);
}

function rgbToAnsi16(r: number, g: number, b: number): number {
  // Map to basic 8 foreground colors (30-37) by nearest quadrant.
  const value = Math.max(r, g, b) / 255;
  if (value < 0.35) return 30; // black / too dark
  const code = (Math.round(b / 255) << 2) | (Math.round(g / 255) << 1) | Math.round(r / 255);
  // Bright variant if value high.
  return (value > 0.75 ? 90 : 30) + code;
}

export function rgb(r: number, g: number, b: number): string {
  switch (COLOR_LEVEL) {
    case 'truecolor':
      return `\x1b[38;2;${r};${g};${b}m`;
    case 'ansi256':
      return `\x1b[38;5;${rgbToAnsi256(r, g, b)}m`;
    case 'ansi16':
      return `\x1b[${rgbToAnsi16(r, g, b)}m`;
    case 'none':
      return '';
  }
}

export function getContextColor(percent: number): string {
  if (percent >= 85) return rgb(255, 80, 80);
  if (percent >= 70) return rgb(255, 200, 50);
  return rgb(80, 220, 120);
}

export function getUsageColor(percent: number): string {
  if (percent >= 90) return rgb(255, 80, 80);
  if (percent >= 75) return rgb(200, 100, 255);
  return rgb(100, 150, 255);
}

export function progressBar(percent: number, width: number, colorFn: (p: number) => string): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const color = colorFn(percent);
  if (COLOR_LEVEL === 'none') {
    return `${'#'.repeat(filled)}${'-'.repeat(empty)}`;
  }
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
