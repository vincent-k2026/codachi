import type { PetColors } from '../types.js';

import type { RateLimitInfo } from '../stdin.js';

/** Context passed to every widget's render function */
export interface WidgetContext {
  contextPercent: number;
  modelName: string;
  tokenSummary: string | null;
  contextVelocity: number;
  contextTimeRemaining: string | null;
  fiveHourUsage: RateLimitInfo | null;
  sevenDayUsage: RateLimitInfo | null;
  sessionCost: number | null;
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
  | 'cost'
  | 'rateLimit5h'
  | 'rateLimit7d';

export const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  'model',
  'context',
  'velocity',
  'cost',
  'rateLimit5h',
  'rateLimit7d',
];
