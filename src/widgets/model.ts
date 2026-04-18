import { RESET } from '../render/colors.js';
import type { Widget } from './types.js';

/** Model name widget: [Opus 4.6] */
export const modelWidget: Widget = {
  id: 'model',
  render(ctx) {
    if (!ctx.modelName) return '';
    return `${ctx.colors.accent}${ctx.modelName}${RESET}`;
  },
};
