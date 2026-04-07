import type { BodySize, Animation, AnimalType, GitStatus } from './types.js';
import type { RelationshipTier } from './state.js';
import type { EventContext } from './events.js';

// Message pools — split into separate modules for maintainability
import { EVENT_MESSAGES } from './messages/events.js';
import type { Msg } from './messages/events.js';
import { IDLE_MESSAGES, SIZE_MESSAGES } from './messages/idle.js';
import { BUSY_MESSAGES, DANGER_MESSAGES, USAGE_HIGH_MESSAGES, VELOCITY_FAST, VELOCITY_SLOW, COMPACT_SUGGEST } from './messages/context.js';
import { WELCOME_MESSAGES, TIER_UPGRADE, RARE_EVENTS } from './messages/social.js';
import { getGitMood, FILE_TYPE_MESSAGES } from './messages/git.js';

export interface MoodContext {
  contextPercent: number;
  size: BodySize;
  animation: Animation;
  animalType: AnimalType;
  git: GitStatus | null;
  fiveHourUsage: number | null;
  contextVelocity: number;
  relationshipTier: RelationshipTier;
  sessionNumber: number;
  moodTick: number;
  eventContext: EventContext;
  tierUpgraded: boolean;
}

// ── Helper: resolve message (string or template function) ──

function pick(pool: Msg[], tick: number, detail: string = ''): string {
  const safeDetail = detail.length > 25 ? detail.slice(0, 22) + '...' : detail;

  const idx = tick % pool.length;
  const m = pool[idx];
  if (typeof m === 'function') {
    if (safeDetail) return m(safeDetail);
    // No detail — skip template functions, find next string message
    for (let i = 1; i < pool.length; i++) {
      const next = pool[(idx + i) % pool.length];
      if (typeof next === 'string') return next;
    }
    return m('file'); // ultimate fallback
  }
  return m;
}

// ── Time-of-day vibes ──

function getTimeGreeting(): string | null {
  const h = new Date().getHours();
  const d = new Date().getDay();
  const t = Math.floor(Date.now() / 10000);

  if ((d === 0 || d === 6) && h >= 8 && h < 20) {
    const m = ['Weekend coding? Impressive!', 'No rest for the creative~', 'Weekend vibes + code = bliss', 'Saturday/Sunday special session!'];
    return m[t % m.length];
  }
  if (h >= 0 && h < 5) {
    const m = ['The whole world is asleep... except us', 'Night owls write the best code~', 'Stars outside, code inside...', '3 AM energy hits different~', 'Sleepy... but I\'ll keep you company', 'The quietest hours produce the loudest commits'];
    return m[t % m.length];
  }
  if (h >= 5 && h < 7) {
    const m = ['The world is so quiet right now~', 'Early bird gets the clean build!', 'Dawn patrol coding session~', 'Up before the sun... respect!'];
    return m[t % m.length];
  }
  if (h >= 7 && h < 9) {
    const m = ['Good morning! Fresh start~', 'Morning code is the best code!', 'Coffee + code = today\'s recipe', 'Rise and compile!'];
    return m[t % m.length];
  }
  if (h >= 12 && h < 13) {
    const m = ['Lunch time vibes~', 'Coding through lunch? Dedicated!', 'Brain food + code food~', 'Midday momentum!'];
    return m[t % m.length];
  }
  if (h >= 14 && h < 16) {
    const m = ['Afternoon deep work zone~', 'Post-lunch productivity!', 'The afternoon flow~'];
    return m[t % m.length];
  }
  if (h >= 17 && h < 19) {
    const m = ['Golden hour coding session~', 'End of day push!', 'Wrapping up nicely~', 'Evening commits hit different'];
    return m[t % m.length];
  }
  if (h >= 21 && h < 23) {
    const m = ['Late night code session~', 'The keyboard glows in the dark...', 'Night mode: engaged!', 'Moonlit coding~'];
    return m[t % m.length];
  }
  return null;
}

// ── Compact suggestion tracking (session-scoped, not persisted) ──
let compactSuggested = false;

// ── Main mood function ──

export function getMoodMessage(ctx: MoodContext): string {
  const {
    contextPercent, size, animation, animalType, git,
    fiveHourUsage, contextVelocity,
    relationshipTier, sessionNumber, moodTick: tick,
    eventContext, tierUpgraded,
  } = ctx;

  const eventTick = Math.floor(Date.now() / 3000);

  // Priority 0: tier upgrade celebration (one-time)
  if (tierUpgraded) {
    const msgs = TIER_UPGRADE[relationshipTier];
    if (msgs) return msgs[tick % msgs.length];
  }

  // Priority 1: danger state
  if (animation === 'danger') {
    return DANGER_MESSAGES[tick % DANGER_MESSAGES.length];
  }

  // Priority 1.5: smart /compact suggestion (one-time per trigger)
  // Trigger when context is filling fast and getting full
  if (!compactSuggested && contextPercent > 70 && contextVelocity > 3) {
    compactSuggested = true;
    return COMPACT_SUGGEST[tick % COMPACT_SUGGEST.length];
  }
  // Reset after context drops (e.g., user ran /compact)
  if (compactSuggested && contextPercent < 40) {
    compactSuggested = false;
  }

  // Priority 2: HOT event (< 15s old) — always show
  if (eventContext.freshness === 'hot' && eventContext.category) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 3: high usage
  if (fiveHourUsage !== null && fiveHourUsage >= 80) {
    return USAGE_HIGH_MESSAGES[tick % USAGE_HIGH_MESSAGES.length];
  }

  // Priority 4: WARM event (15-60s) — show most ticks
  if (eventContext.freshness === 'warm' && eventContext.category && tick % 3 !== 2) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 5: busy
  if (animation === 'busy') {
    return BUSY_MESSAGES[tick % BUSY_MESSAGES.length];
  }

  // Priority 6: welcome back (first few ticks)
  if (tick % 60 < 2) {
    const msgs = WELCOME_MESSAGES[relationshipTier];
    const base = msgs[tick % msgs.length];
    return sessionNumber > 1 ? `${base} #${sessionNumber}` : base;
  }

  // Priority 6.5: session stats (occasionally reference activity)
  if (eventContext.sessionActionCount > 10 && tick % 20 === 5) {
    if (eventContext.sessionEditCount > 10) return `${eventContext.sessionEditCount} edits so far! Productive~`;
    if (eventContext.sessionActionCount > 30) return `${eventContext.sessionActionCount} actions this session! Wow~`;
  }

  // Priority 7: COLD event (1-5 min) — show occasionally
  if (eventContext.freshness === 'cold' && eventContext.category && tick % 5 === 0) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 8: rare easter eggs
  if (tick % 30 === 7) {
    return RARE_EVENTS[tick % RARE_EVENTS.length];
  }

  // Priority 9: context velocity
  if (contextVelocity > 5 && tick % 6 === 1) {
    return VELOCITY_FAST[tick % VELOCITY_FAST.length];
  }
  if (contextVelocity > 0 && contextVelocity <= 1 && tick % 8 === 2) {
    return VELOCITY_SLOW[tick % VELOCITY_SLOW.length];
  }

  // Priority 11: time-of-day
  if (tick % 12 === 3) {
    const timeMsg = getTimeGreeting();
    if (timeMsg) return timeMsg;
  }

  // Priority 12: file type awareness (from git)
  if (git?.dominantFileType && tick % 5 === 0) {
    const ftMsgs = FILE_TYPE_MESSAGES[git.dominantFileType];
    if (ftMsgs) return ftMsgs[tick % ftMsgs.length];
  }

  // Priority 13: git mood
  if (tick % 3 === 0) {
    const gitMsg = getGitMood(git, tick);
    if (gitMsg) return gitMsg;
  }

  // Priority 14: size messages
  if ((size === 'tiny' || size === 'thicc') && tick % 4 < 2) {
    return SIZE_MESSAGES[size][tick % SIZE_MESSAGES[size].length];
  }

  // Default: animal idle
  const msgs = IDLE_MESSAGES[animalType];
  return msgs[tick % msgs.length];
}
