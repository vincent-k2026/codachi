import { DIM, RESET, rgb } from '../render/colors.js';
import type { Widget } from './types.js';

function formatCost(usd: number): string {
  if (usd < 0.01) return '<$0.01';
  if (usd < 10) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(1)}`;
}

/** Session cost widget — reads cost.total_cost_usd from Claude Code stdin. */
export const costWidget: Widget = {
  id: 'cost',
  render(ctx) {
    if (ctx.sessionCost === null || ctx.sessionCost === 0) return '';
    const color = ctx.sessionCost >= 5 ? rgb(255, 80, 80)
      : ctx.sessionCost >= 1 ? rgb(255, 200, 50)
      : rgb(80, 220, 120);
    return `${DIM}cost${RESET} ${color}${formatCost(ctx.sessionCost)}${RESET}`;
  },
};
