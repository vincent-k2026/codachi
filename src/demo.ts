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
}

const DEMO_STEPS: DemoStep[] = [
  { contextPercent: 5, event: noEvent, label: 'Session starts...' },
  { contextPercent: 12, event: { ...noEvent, category: 'first_action', freshness: 'hot', sessionActionCount: 1 }, label: 'First action!' },
  { contextPercent: 20, event: { ...noEvent, category: 'edit_code', freshness: 'hot', detail: 'index.ts', sessionEditCount: 3, sessionActionCount: 5 }, label: 'Editing code...' },
  { contextPercent: 30, event: { ...noEvent, category: 'test_passed', freshness: 'hot', sessionActionCount: 8 }, label: 'Tests pass!' },
  { contextPercent: 40, event: { ...noEvent, category: 'test_failed', freshness: 'hot', sessionActionCount: 10 }, label: 'Test fails...' },
  { contextPercent: 45, event: { ...noEvent, category: 'recovered', freshness: 'hot', sessionActionCount: 12 }, label: 'Fixed it!' },
  { contextPercent: 55, event: { ...noEvent, category: 'git_commit', freshness: 'hot', sessionActionCount: 15 }, label: 'Git commit!' },
  { contextPercent: 65, event: { ...noEvent, category: 'git_push', freshness: 'hot', sessionActionCount: 16 }, label: 'Push to remote!' },
  { contextPercent: 75, event: { ...noEvent, category: 'rapid_editing', freshness: 'hot', sessionEditCount: 20, sessionActionCount: 25 }, label: 'Rapid editing spree!' },
  { contextPercent: 88, event: noEvent, label: 'Context getting full!' },
  { contextPercent: 50, event: { ...noEvent, category: 'build_passed', freshness: 'hot', sessionActionCount: 30 }, label: 'After /compact — build success!' },
];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runDemo(): Promise<void> {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const petName = getAnimalName(animal);

  console.log(`\n  codachi demo — meet your ${petName}!\n`);
  await sleep(1000);

  for (const step of DEMO_STEPS) {
    // Clear previous output (3 lines + label)
    process.stdout.write('\x1b[4A\x1b[J');

    console.log(`  \x1b[2m${step.label}\x1b[0m\n`);

    render({
      contextPercent: step.contextPercent,
      modelName: 'Opus 4.6',
      animalType: animal,
      colors: palette,
      git: {
        branch: 'main', isDirty: true, ahead: 1, behind: 0,
        modified: 3, added: 0, deleted: 0, untracked: 1,
        insertions: 42, deletions: 7, fileCount: 4,
        lastCommit: 'feat: add demo mode', stashCount: 0,
        dominantFileType: 'TypeScript',
      },
      project: { name: 'codachi', lang: 'Node' },
      fiveHourUsage: { percent: 25, resetsIn: '4h12m' },
      sevenDayUsage: null,
      contextVelocity: 3.2,
      cacheHitRate: 72,
      tokenSummary: `${Math.round(step.contextPercent * 10)}K/1.0M`,
      relationshipTier: 'friend',
      sessionNumber: 18,
      animTick: Math.floor(Date.now() / 1500),
      moodTick: Math.floor(Date.now() / 10000),
      uptime: '15m',
      eventContext: step.event,
      petName,
      contextTimeRemaining: step.contextPercent < 80 && step.contextPercent > 20 ? `~${Math.round((100 - step.contextPercent) / 3.2)}m` : null,
      tierUpgraded: false,
    });

    await sleep(2500);
  }

  console.log(`\n  Install: \x1b[1mnode dist/index.js init\x1b[0m\n`);
}
