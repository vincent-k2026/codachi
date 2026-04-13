import type { PetColors } from '../types.js';

/** Context passed to every widget's render function */
export interface WidgetContext {
  contextPercent: number;
  modelName: string;
  tokenSummary: string | null;
  contextVelocity: number;
  contextTimeRemaining: string | null;
  fiveHourUsage: { percent: number; resetsIn: string | null } | null;
  sevenDayUsage: { percent: number; resetsIn: string | null } | null;
  cacheHitRate: number | null;
  colors: PetColors;
}

/** A widget is a self-contained statusline segment. Returns empty string to skip. */
export interface Widget {
  id: WidgetId;
  /** Render the widget as an ANSI-colored string. Return '' to skip. */
  render(ctx: WidgetContext): string;
}

export type WidgetId =
  | 'model'
  | 'context'
  | 'velocity'
  | 'rateLimit5h'
  | 'rateLimit7d'
  | 'cacheHit';

export const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  'model',
  'context',
  'velocity',
  'cacheHit',
  'rateLimit5h',
  'rateLimit7d',
];
