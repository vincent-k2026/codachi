import { describe, it, expect, vi, afterEach } from 'vitest';
import { getMoodMessage } from './mood.js';
import type { EventContext } from './events.js';

const noEvent: EventContext = {
  category: null, freshness: 'none', detail: '',
  consecutiveFailures: 0, sessionEditCount: 0, sessionActionCount: 0,
};

function makeMoodCtx(overrides: Record<string, unknown> = {}) {
  return {
    contextPercent: 50,
    size: 'medium' as const,
    animation: 'idle' as const,
    animalType: 'cat' as const,
    git: null,
    fiveHourUsage: null,
    contextVelocity: 0,
    cacheHitRate: null,
    relationshipTier: 'stranger' as const,
    sessionNumber: 1,
    moodTick: 0,
    eventContext: noEvent,
    tierUpgraded: false,
    ...overrides,
  };
}

describe('getMoodMessage', () => {
  it('returns a string', () => {
    const msg = getMoodMessage(makeMoodCtx());
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  // Priority 1: danger
  it('returns danger message at 85%+ context', () => {
    const msg = getMoodMessage(makeMoodCtx({ animation: 'danger' }));
    expect(msg.length).toBeGreaterThan(0);
    // Danger messages are cozy/warm, not alarming
    expect(msg).not.toContain('ERROR');
  });

  // Priority 2: hot event
  it('returns event message for hot test_passed', () => {
    // Cycle through multiple eventTicks to find at least one match
    let matched = false;
    const realNow = Date.now();
    for (let i = 0; i < 20; i++) {
      vi.spyOn(Date, 'now').mockReturnValue(realNow + i * 3000);
      const msg = getMoodMessage(makeMoodCtx({
        eventContext: { ...noEvent, category: 'test_passed', freshness: 'hot' },
      }));
      const keywords = ['green', 'pass', 'test', 'confetti', 'jig', 'checkmark', 'nailed', 'chef', 'suite', 'easy', '100%', 'red', 'assert', 'firework'];
      if (keywords.some(k => msg.toLowerCase().includes(k))) matched = true;
    }
    vi.restoreAllMocks();
    expect(matched).toBe(true);
  });

  it('returns event message for hot build_failed', () => {
    const msg = getMoodMessage(makeMoodCtx({
      eventContext: { ...noEvent, category: 'build_failed', freshness: 'hot' },
    }));
    expect(msg.length).toBeGreaterThan(0);
  });

  it('returns event message for hot git_commit', () => {
    const msg = getMoodMessage(makeMoodCtx({
      eventContext: { ...noEvent, category: 'git_commit', freshness: 'hot' },
    }));
    const keywords = ['commit', 'checkpoint', 'history', 'repo', 'progress', 'posterity', 'future', 'ding', 'chapter', 'saved', 'git', 'books', 'snapshot', 'story', 'brick', 'changelog', 'genius', 'cathedral', 'brilliance'];
    expect(keywords.some(k => msg.toLowerCase().includes(k))).toBe(true);
  });

  // Priority 3: high usage
  it('returns usage message at 80%+ five hour usage', () => {
    const msg = getMoodMessage(makeMoodCtx({ fiveHourUsage: 80 }));
    expect(msg.length).toBeGreaterThan(0);
  });

  // Priority 4: warm event — shown on most ticks (tick % 3 !== 2)
  it('returns event message for warm events most ticks', () => {
    // Warm events should show ~66% of ticks (tick % 3 !== 2)
    // Test by checking that non-idle messages appear on qualifying ticks
    const idleMessages = new Set(['Purring softly...', 'Watching the cursor dance~']);
    let warmShown = 0;
    for (let tick = 0; tick < 12; tick++) {
      const msg = getMoodMessage(makeMoodCtx({
        moodTick: tick,
        eventContext: { ...noEvent, category: 'install', freshness: 'warm' },
      }));
      if (!idleMessages.has(msg)) warmShown++;
    }
    expect(warmShown).toBeGreaterThan(5);
  });

  // Priority 5: busy
  it('returns busy message when animation is busy', () => {
    const msg = getMoodMessage(makeMoodCtx({ animation: 'busy' }));
    expect(msg.length).toBeGreaterThan(0);
  });

  // Priority 7: cold event
  it('shows cold event occasionally', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({
        moodTick: tick,
        eventContext: { ...noEvent, category: 'git_push', freshness: 'cold' },
      }));
      if (msg.toLowerCase().includes('push') || msg.toLowerCase().includes('remote') || msg.toLowerCase().includes('ship') || msg.toLowerCase().includes('cloud') || msg.toLowerCase().includes('code') || msg.toLowerCase().includes('sharing') || msg.toLowerCase().includes('world') || msg.toLowerCase().includes('blessed') || msg.toLowerCase().includes('flying') || msg.toLowerCase().includes('goes')) {
        seen = true;
      }
    }
    expect(seen).toBe(true);
  });

  // Event template messages with detail — mock Date.now to cycle through pool indices
  it('uses file detail in edit_code messages', () => {
    let hasDetail = false;
    const realNow = Date.now();
    for (let i = 0; i < 20; i++) {
      // Each iteration shifts by 3s to select a different pool index
      vi.spyOn(Date, 'now').mockReturnValue(realNow + i * 3000);
      const msg = getMoodMessage(makeMoodCtx({
        eventContext: { ...noEvent, category: 'edit_code', freshness: 'hot', detail: 'auth.ts' },
      }));
      if (msg.includes('auth.ts')) hasDetail = true;
    }
    vi.restoreAllMocks();
    expect(hasDetail).toBe(true);
  });

  it('truncates long file names in templates', () => {
    let hasDetail = false;
    const realNow = Date.now();
    for (let i = 0; i < 20; i++) {
      vi.spyOn(Date, 'now').mockReturnValue(realNow + i * 3000);
      const msg = getMoodMessage(makeMoodCtx({
        eventContext: { ...noEvent, category: 'edit_code', freshness: 'hot', detail: 'very-long-component-name.component.tsx' },
      }));
      if (msg.includes('very-long-component-na...')) hasDetail = true;
    }
    vi.restoreAllMocks();
    expect(hasDetail).toBe(true);
  });

  // All event categories produce messages
  const categories = [
    'test_passed', 'test_failed', 'build_passed', 'build_failed',
    'install', 'git_commit', 'git_push', 'git_pull', 'git_merge',
    'git_rebase', 'git_stash', 'git_checkout', 'lint_format',
    'server_start', 'docker', 'network', 'dangerous', 'search',
    'edit_test', 'edit_docs', 'edit_style', 'edit_config', 'edit_code',
    'creating_file', 'exploring', 'rapid_editing', 'bash_failed',
    'recovered', 'struggling', 'first_action', 'many_edits', 'many_actions',
  ] as const;

  for (const cat of categories) {
    it(`produces message for event category: ${cat}`, () => {
      const msg = getMoodMessage(makeMoodCtx({
        eventContext: { ...noEvent, category: cat, freshness: 'hot', detail: 'test.ts' },
      }));
      expect(msg.length).toBeGreaterThan(0);
    });
  }

  // Velocity messages
  it('shows velocity message for fast context burn', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, contextVelocity: 8 }));
      if (msg.toLowerCase().includes('context') || msg.toLowerCase().includes('speed') || msg.toLowerCase().includes('throttle') || msg.toLowerCase().includes('brrr')) seen = true;
    }
    expect(seen).toBe(true);
  });

  // Cache messages
  it('shows cache message for good cache hits', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, cacheHitRate: 80 }));
      if (msg.toLowerCase().includes('cache')) seen = true;
    }
    expect(seen).toBe(true);
  });

  it('shows cache message for bad cache hits', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, cacheHitRate: 20 }));
      if (msg.toLowerCase().includes('fresh') || msg.toLowerCase().includes('cache') || msg.toLowerCase().includes('uncharted')) seen = true;
    }
    expect(seen).toBe(true);
  });

  // Git mood messages
  it('shows git mood for clean repo', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({
        moodTick: tick,
        git: { branch: 'main', isDirty: false, ahead: 0, behind: 0, modified: 0, added: 0, deleted: 0, untracked: 0, insertions: 0, deletions: 0, fileCount: 0, lastCommit: '', stashCount: 0, dominantFileType: null },
      }));
      if (msg.toLowerCase().includes('tidy') || msg.toLowerCase().includes('clean') || msg.toLowerCase().includes('snug') || msg.toLowerCase().includes('peaceful')) seen = true;
    }
    expect(seen).toBe(true);
  });

  // Size messages
  it('shows size message for tiny', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, size: 'tiny' }));
      if (msg.toLowerCase().includes('smol') || msg.toLowerCase().includes('bean') || msg.toLowerCase().includes('tiny') || msg.toLowerCase().includes('fresh') || msg.toLowerCase().includes('grow')) seen = true;
    }
    expect(seen).toBe(true);
  });

  // Animal idle messages
  it('shows cat-specific idle messages', () => {
    let seen = false;
    for (let tick = 0; tick < 30; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, animalType: 'cat' }));
      if (msg.toLowerCase().includes('purr') || msg.toLowerCase().includes('knead') || msg.toLowerCase().includes('blink') || msg.toLowerCase().includes('sits') || msg.toLowerCase().includes('nap') || msg.toLowerCase().includes('stretch')) seen = true;
    }
    expect(seen).toBe(true);
  });

  it('shows penguin idle messages', () => {
    let seen = false;
    for (let tick = 0; tick < 30; tick++) {
      const msg = getMoodMessage(makeMoodCtx({ moodTick: tick, animalType: 'penguin' }));
      if (msg.toLowerCase().includes('waddle') || msg.toLowerCase().includes('flap') || msg.toLowerCase().includes('tux') || msg.toLowerCase().includes('slid') || msg.toLowerCase().includes('cool') || msg.toLowerCase().includes('chillin')) seen = true;
    }
    expect(seen).toBe(true);
  });

  // Welcome messages
  it('shows welcome for stranger', () => {
    const msg = getMoodMessage(makeMoodCtx({ moodTick: 0, relationshipTier: 'stranger' }));
    expect(msg.toLowerCase()).toMatch(/new friend|nice to meet|welcome/);
  });

  it('shows welcome with session number for returning user', () => {
    const msg = getMoodMessage(makeMoodCtx({
      moodTick: 0, relationshipTier: 'acquaintance', sessionNumber: 5,
    }));
    expect(msg).toContain('#5');
  });

  // File type messages from git
  it('shows file type messages from git dominantFileType', () => {
    let seen = false;
    for (let tick = 0; tick < 20; tick++) {
      const msg = getMoodMessage(makeMoodCtx({
        moodTick: tick,
        git: { branch: 'main', isDirty: true, ahead: 0, behind: 0, modified: 1, added: 0, deleted: 0, untracked: 0, insertions: 0, deletions: 0, fileCount: 1, lastCommit: '', stashCount: 0, dominantFileType: 'Rust' },
      }));
      if (msg.toLowerCase().includes('fearless') || msg.toLowerCase().includes('borrow') || msg.toLowerCase().includes('zero-cost') || msg.toLowerCase().includes('memory') || msg.toLowerCase().includes('rust') || msg.toLowerCase().includes('blazing')) seen = true;
    }
    expect(seen).toBe(true);
  });
});
