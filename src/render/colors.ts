export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';

export function rgb(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
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
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
