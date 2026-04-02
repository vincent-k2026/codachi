import { RESET } from './colors.js';
import type { PetColors } from '../types.js';

/**
 * Half-block pixel renderer.
 *
 * Each sprite is a 2D grid of palette indices:
 *   0 = transparent
 *   1 = body color
 *   2 = accent color (ears, tail)
 *   3 = face color (eyes, mouth)
 *   4 = blush color (paws, nose)
 *
 * The grid must have an even number of rows.
 * Each pair of rows becomes one terminal line using ▀/▄ characters.
 * Result: grid.height/2 terminal lines.
 */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/(\d+);(\d+);(\d+)/);
  if (!m) return null;
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function extractRgb(ansiColor: string): string | null {
  // Extract "R;G;B" from "\x1b[38;2;R;G;Bm"
  const m = ansiColor.match(/38;2;(\d+;\d+;\d+)/);
  return m ? m[1] : null;
}

function fg(rgb: string): string {
  return `\x1b[38;2;${rgb}m`;
}

function bg(rgb: string): string {
  return `\x1b[48;2;${rgb}m`;
}

export type SpriteGrid = number[][];

export function renderSprite(grid: SpriteGrid, colors: PetColors): string[] {
  // Map palette index to RGB string
  const palette: (string | null)[] = [
    null, // 0 = transparent
    extractRgb(colors.body),
    extractRgb(colors.accent),
    extractRgb(colors.face),
    extractRgb(colors.blush),
  ];

  const termLines: string[] = [];

  for (let row = 0; row < grid.length; row += 2) {
    const topRow = grid[row];
    const botRow = grid[row + 1] ?? new Array(topRow.length).fill(0);
    let line = '';

    for (let col = 0; col < topRow.length; col++) {
      const topColor = palette[topRow[col]] ?? null;
      const botColor = palette[botRow[col]] ?? null;

      if (topColor === null && botColor === null) {
        // Both transparent
        line += ' ';
      } else if (topColor !== null && botColor !== null) {
        if (topColor === botColor) {
          // Same color: full block
          line += `${fg(topColor)}\u2588${RESET}`;
        } else {
          // Different: ▀ with fg=top, bg=bottom
          line += `${fg(topColor)}${bg(botColor)}\u2580${RESET}`;
        }
      } else if (topColor !== null) {
        // Only top: ▀ with fg
        line += `${fg(topColor)}\u2580${RESET}`;
      } else {
        // Only bottom: ▄ with fg
        line += `${fg(botColor!)}\u2584${RESET}`;
      }
    }

    termLines.push(line);
  }

  return termLines;
}

/** Calculate the visual width of a rendered sprite (= grid column count) */
export function spriteWidth(grid: SpriteGrid): number {
  return grid[0]?.length ?? 0;
}
