import { RESET, rgb, progressBar, getUsageColor } from '../render/colors.js';
import type { Widget, WidgetContext } from './types.js';

function renderRateLimit(
  label: string,
  barWidth: number,
  data: { percent: number; resetsIn: string | null } | null,
  colors: WidgetContext['colors'],
): string {
  if (!data) return '';
  const bar = progressBar(data.percent, barWidth, getUsageColor);
  const color = data.percent >= 90 ? rgb(255, 80, 80)
    : data.percent >= 75 ? rgb(200, 100, 255)
    : rgb(100, 150, 255);
  const reset = data.resetsIn ? ` ${colors.blush}~${data.resetsIn}${RESET}` : '';
  return `${colors.accent}${label}${RESET} ${bar} ${color}${data.percent}%${RESET}${reset}`;
}

/** 5-hour rate limit widget */
export const rateLimit5hWidget: Widget = {
  id: 'rateLimit5h',
  render(ctx) {
    return renderRateLimit('5h', 6, ctx.fiveHourUsage, ctx.colors);
  },
};

/** 7-day rate limit widget */
export const rateLimit7dWidget: Widget = {
  id: 'rateLimit7d',
  render(ctx) {
    return renderRateLimit('7d', 5, ctx.sevenDayUsage, ctx.colors);
  },
};
