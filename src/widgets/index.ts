import { DIM, RESET } from '../render/colors.js';
import { modelWidget } from './model.js';
import { contextWidget } from './context.js';
import { velocityWidget } from './velocity.js';
import { rateLimit5hWidget, rateLimit7dWidget } from './rateLimit.js';
import { costWidget } from './cost.js';

import { DEFAULT_WIDGET_ORDER } from './types.js';
import type { Widget, WidgetContext, WidgetId } from './types.js';

export type { Widget, WidgetContext, WidgetId };
export { DEFAULT_WIDGET_ORDER };

/** Registry of all available widgets by id */
export const WIDGET_REGISTRY: Record<WidgetId, Widget> = {
  model:       modelWidget,
  context:     contextWidget,
  velocity:    velocityWidget,
  cost:        costWidget,
  rateLimit5h: rateLimit5hWidget,
  rateLimit7d: rateLimit7dWidget,
};

/** Render an ordered list of widgets into a single line, joined by separator. */
export function renderWidgetLine(
  widgetIds: WidgetId[],
  ctx: WidgetContext,
): string {
  const SEP = `${DIM}|${RESET}`;
  const parts: string[] = [];

  for (const id of widgetIds) {
    const widget = WIDGET_REGISTRY[id];
    if (!widget) continue;
    const output = widget.render(ctx);
    if (output) parts.push(output);
  }

  return parts.join(` ${SEP} `);
}

/** Resolve widget order from config, falling back to defaults. Unknown IDs are dropped. */
export function resolveWidgetOrder(configWidgets?: string[]): WidgetId[] {
  if (!configWidgets || configWidgets.length === 0) return DEFAULT_WIDGET_ORDER;
  const valid = new Set(Object.keys(WIDGET_REGISTRY));
  return configWidgets.filter((id): id is WidgetId => valid.has(id));
}
