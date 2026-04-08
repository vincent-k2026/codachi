import { RESET, DIM, rgb } from '../render/colors.js';
import type { Widget } from './types.js';

/** Velocity + time remaining widget: ^3%/m ~15m */
export const velocityWidget: Widget = {
  id: 'velocity',
  render(ctx) {
    const { contextVelocity, contextTimeRemaining } = ctx;
    if (contextVelocity <= 0.5 && !contextTimeRemaining) return '';

    const parts: string[] = [];
    if (contextVelocity > 0.5) {
      const color = contextVelocity > 5 ? rgb(255, 80, 80)
        : contextVelocity > 2 ? rgb(255, 200, 50)
        : rgb(80, 220, 120);
      parts.push(`${color}^${contextVelocity}%/m${RESET}`);
    }
    if (contextTimeRemaining) {
      parts.push(`${DIM}${contextTimeRemaining}${RESET}`);
    }
    return parts.join(' ');
  },
};
