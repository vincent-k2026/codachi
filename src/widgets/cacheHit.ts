import { DIM, RESET, rgb } from '../render/colors.js';
import type { Widget, WidgetContext } from './types.js';

function getCacheColor(pct: number): string {
  if (pct >= 60) return rgb(80, 220, 120);   // green — healthy
  if (pct >= 30) return rgb(255, 200, 50);    // yellow — degrading
  return rgb(255, 80, 80);                     // red — cold cache
}

export const cacheHitWidget: Widget = {
  id: 'cacheHit',
  render(ctx: WidgetContext): string {
    if (ctx.cacheHitRate === null) return '';
    const color = getCacheColor(ctx.cacheHitRate);
    return `${DIM}cache${RESET} ${color}${ctx.cacheHitRate}%${RESET}`;
  },
};
