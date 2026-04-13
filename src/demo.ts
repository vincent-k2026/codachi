/**
 * codachi demo — simulate a live session in the terminal.
 * Shows the pet growing, reacting to events, and displaying moods.
 */
import { render } from './render/index.js';
import { getAnimalName } from './animals/index.js';
import { PALETTES } from './identity.js';
import type { AnimalType } from './types.js';
import type { EventContext } from './events.js';

const ANIMALS: AnimalType[] = ['cat', 'penguin', 'owl', 'octopus', 'bunny'];

const noEvent: EventContext = {
  category: null, freshness: 'none', detail: '',
  consecutiveFailures: 0, sessionEditCount: 0, sessionActionCount: 0,
};

interface DemoStep {
  contextPercent: number;
  event: EventContext;
  label: string;
  velocity: number;
  cacheHit: number;
  pauseMs: number;
}

const DEMO_STEPS: DemoStep[] = [
  { contextPercent: 3, event: noEvent, label: 'Session starts...', velocity: 0, cacheHit: 95, pauseMs: 2000 },
  { contextPercent: 8, event: { ...noEvent, category: 'exploring', freshness: 'hot', sessionActionCount: 6 }, label: 'Exploring the codebase...', velocity: 1.2, cacheHit: 88, pauseMs: 2500 },
  { contextPercent: 18, event: { ...noEvent, category: 'edit_code', freshness: 'hot', detail: 'auth.ts', sessionEditCount: 3, sessionActionCount: 12 }, label: 'Editing code...', velocity: 2.1, cacheHit: 82, pauseMs: 2500 },
  { contextPercent: 28, event: { ...noEvent, category: 'test_failed', freshness: 'hot', sessionActionCount: 15 }, label: 'Test fails...', velocity: 2.8, cacheHit: 75, pauseMs: 2500 },
  { contextPercent: 35, event: { ...noEvent, category: 'recovered', freshness: 'hot', sessionActionCount: 18 }, label: 'Fixed! Tests pass!', velocity: 2.5, cacheHit: 70, pauseMs: 2500 },
  { contextPercent: 45, event: { ...noEvent, category: 'git_commit', freshness: 'hot', sessionActionCount: 20 }, label: 'Git commit!', velocity: 3.0, cacheHit: 65, pauseMs: 2500 },
  { contextPercent: 55, event: { ...noEvent, category: 'rapid_editing', freshness: 'hot', sessionEditCount: 15, sessionActionCount: 30 }, label: 'Rapid editing spree!', velocity: 4.2, cacheHit: 55, pauseMs: 2500 },
  { contextPercent: 68, event: { ...noEvent, category: 'build_passed', freshness: 'hot', sessionActionCount: 35 }, label: 'Build passes!', velocity: 3.5, cacheHit: 48, pauseMs: 2500 },
  { contextPercent: 78, event: { ...noEvent, category: 'git_push', freshness: 'hot', sessionActionCount: 38 }, label: 'Push to remote!', velocity: 2.8, cacheHit: 42, pauseMs: 2500 },
  { contextPercent: 88, event: noEvent, label: 'Context getting full!', velocity: 3.0, cacheHit: 30, pauseMs: 2500 },
  { contextPercent: 25, event: { ...noEvent, category: 'test_passed', freshness: 'hot', sessionActionCount: 42 }, label: 'After /compact — all green!', velocity: 1.0, cacheHit: 90, pauseMs: 3000 },
];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runDemo(): Promise<void> {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const petName = getAnimalName(animal);

  // Print header with blank lines so first clear doesn't eat prompt
  console.log('');
  console.log(`  \x1b[1mcodachi demo\x1b[0m — meet your ${petName}!`);
  console.log('');
  console.log(''); // placeholder for 3 render lines
  console.log('');
  console.log('');

  for (const step of DEMO_STEPS) {
    // Move up 4 lines (label + 3 render lines) and clear
    process.stdout.write('\x1b[4A\x1b[J');

    console.log(`  \x1b[2m${step.label}\x1b[0m`);

    const uptime = step.contextPercent < 30 ? '5m' : step.contextPercent < 60 ? '18m' : '32m';

    render({
      contextPercent: step.contextPercent,
      modelName: 'Opus 4.6',
      animalType: animal,
      colors: palette,
      git: {
        branch: 'main', isDirty: true, ahead: 1, behind: 0,
        modified: 3, added: 1, deleted: 0, untracked: 1,
        insertions: 142, deletions: 37, fileCount: 5,
        lastCommit: 'feat: add auth middleware', stashCount: 0,
        dominantFileType: 'TypeScript',
      },
      project: { name: 'myapp', lang: 'Node' },
      fiveHourUsage: { percent: 15, resetsIn: '4h12m' },
      sevenDayUsage: null,
      contextVelocity: step.velocity,
      tokenSummary: `${Math.round(step.contextPercent * 10)}K/1.0M`,
      cacheHitRate: Math.max(0, 85 - Math.round(step.contextPercent * 0.8)),
      relationshipTier: 'friend',
      sessionNumber: 18,
      animTick: Math.floor(Date.now() / 1500),
      moodTick: Math.floor(Date.now() / 3000), // faster tick for demo variety
      uptime,
      eventContext: step.event,
      petName,
      contextTimeRemaining: step.velocity > 0.5 ? `~${Math.round((100 - step.contextPercent) / step.velocity)}m` : null,
      tierUpgraded: false,
    });

    await sleep(step.pauseMs);
  }

  console.log('');
  console.log(`  \x1b[2mInstall:\x1b[0m \x1b[1mnode dist/index.js init\x1b[0m`);
  console.log('');
}
