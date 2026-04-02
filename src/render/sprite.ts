import { RESET } from './colors.js';
import type { PetColors } from '../types.js';

/**
 * Braille-based pixel renderer.
 *
 * Each sprite is a 2D grid of palette indices:
 *   0 = transparent (dot off)
 *   1 = body, 2 = accent, 3 = face, 4 = blush (dot on, colored)
 *
 * Grid height must be a multiple of 4 (rows per braille cell).
 * Grid width must be a multiple of 2 (columns per braille cell).
 *
 * Each 2×4 block of pixels maps to one braille character (U+2800-U+28FF).
 * Color per cell is determined by the dominant non-zero palette index in the block.
 *
 * 3 terminal lines × 4 rows/char = 12 pixel rows
 * 10 chars wide × 2 cols/char = 20 pixel columns
 */

// Braille dot bit positions for a 2×4 cell:
// col 0: rows 0-3 map to bits 0,1,2,6
// col 1: rows 0-3 map to bits 3,4,5,7
const DOT_BITS = [
  [0x01, 0x08], // row 0: [col0, col1]
  [0x02, 0x10], // row 1
  [0x04, 0x20], // row 2
  [0x40, 0x80], // row 3
];

function extractRgb(ansiColor: string): string | null {
  const m = ansiColor.match(/38;2;(\d+;\d+;\d+)/);
  return m ? m[1] : null;
}

function fg(rgb: string): string {
  return `\x1b[38;2;${rgb}m`;
}

export type SpriteGrid = number[][];

export function renderSprite(grid: SpriteGrid, colors: PetColors): string[] {
  const palette: (string | null)[] = [
    null,
    extractRgb(colors.body),
    extractRgb(colors.accent),
    extractRgb(colors.face),
    extractRgb(colors.blush),
  ];

  const gridH = grid.length;
  const gridW = grid[0]?.length ?? 0;
  const termLines: string[] = [];

  // Process 4 rows at a time (one terminal line)
  for (let rowBlock = 0; rowBlock < gridH; rowBlock += 4) {
    let line = '';

    // Process 2 columns at a time (one braille character)
    for (let colBlock = 0; colBlock < gridW; colBlock += 2) {
      let brailleCode = 0;
      const colorCounts: Record<number, number> = {};

      for (let dr = 0; dr < 4; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const r = rowBlock + dr;
          const c = colBlock + dc;
          const px = (r < gridH && c < gridW) ? grid[r][c] : 0;

          if (px > 0) {
            brailleCode |= DOT_BITS[dr][dc];
            colorCounts[px] = (colorCounts[px] ?? 0) + 1;
          }
        }
      }

      if (brailleCode === 0) {
        // All transparent → space
        line += ' ';
      } else {
        // Pick dominant color
        let bestIdx = 1;
        let bestCount = 0;
        for (const [idx, cnt] of Object.entries(colorCounts)) {
          if (cnt > bestCount) {
            bestCount = cnt;
            bestIdx = parseInt(idx);
          }
        }
        const rgb = palette[bestIdx] ?? palette[1] ?? '255;255;255';
        const brailleChar = String.fromCharCode(0x2800 + brailleCode);
        line += `${fg(rgb)}${brailleChar}${RESET}`;
      }
    }

    termLines.push(line);
  }

  return termLines;
}

/** Terminal width of a rendered sprite = ceil(grid columns / 2) */
export function spriteWidth(grid: SpriteGrid): number {
  return Math.ceil((grid[0]?.length ?? 0) / 2);
}
