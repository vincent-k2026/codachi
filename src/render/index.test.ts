import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from './index.js';
import type { EventContext } from '../events.js';

const noEvent: EventContext = {
  category: null, freshness: 'none', detail: '',
  consecutiveFailures: 0, sessionEditCount: 0, sessionActionCount: 0,
};

function makeRenderInput(overrides: Record<string, unknown> = {}) {
  return {
    contextPercent: 50,
    modelName: 'Opus 4.6',
    animalType: 'cat' as const,
    colors: {
      body: '\x1b[38;2;255;127;80m',
      accent: '\x1b[38;2;255;99;71m',
      face: '\x1b[38;2;255;200;150m',
      blush: '\x1b[38;2;255;160;122m',
    },
    git: null,
    project: { name: 'myapp', lang: 'Node' },
    fiveHourUsage: null,
    sevenDayUsage: null,
    contextVelocity: 0,
    cacheHitRate: null,
    tokenSummary: null,
    relationshipTier: 'stranger' as const,
    sessionNumber: 1,
    animTick: 0,
    moodTick: 5,
    uptime: '5m',
    eventContext: noEvent,
    ...overrides,
  };
}

let logOutput: string[];

beforeEach(() => {
  logOutput = [];
  vi.spyOn(console, 'log').mockImplementation((msg: string) => {
    logOutput.push(msg);
  });
});

describe('render', () => {
  it('outputs exactly 3 lines', () => {
    render(makeRenderInput());
    expect(logOutput).toHaveLength(3);
  });

  it('includes model name in line 1', () => {
    render(makeRenderInput());
    expect(logOutput[0]).toContain('Opus 4.6');
  });

  it('includes context percentage in line 1', () => {
    render(makeRenderInput({ contextPercent: 75 }));
    expect(logOutput[0]).toContain('75%');
  });

  it('shows git branch in line 2 when git data present', () => {
    render(makeRenderInput({
      git: {
        branch: 'main', isDirty: true, ahead: 0, behind: 0,
        modified: 2, added: 0, deleted: 0, untracked: 0,
        insertions: 0, deletions: 0, fileCount: 2,
        lastCommit: 'test commit', stashCount: 0, dominantFileType: null,
      },
    }));
    expect(logOutput[1]).toContain('main');
  });

  it('shows "(no git repo)" when no git data', () => {
    render(makeRenderInput());
    expect(logOutput[1]).toContain('no git repo');
  });

  it('includes animal name in line 3', () => {
    render(makeRenderInput());
    expect(logOutput[2]).toContain('Cat');
  });

  it('includes project name in line 3', () => {
    render(makeRenderInput());
    expect(logOutput[2]).toContain('myapp');
  });

  it('includes uptime in line 3', () => {
    render(makeRenderInput());
    expect(logOutput[2]).toContain('5m');
  });

  it('shows token summary when provided', () => {
    render(makeRenderInput({ tokenSummary: '550K/1.0M' }));
    expect(logOutput[0]).toContain('550K/1.0M');
  });

  it('shows cache hit rate when provided', () => {
    render(makeRenderInput({ cacheHitRate: 75 }));
    expect(logOutput[0]).toContain('cache:75%');
  });

  it('shows velocity when > 0.5', () => {
    render(makeRenderInput({ contextVelocity: 3 }));
    expect(logOutput[0]).toContain('^3%/m');
  });

  it('shows five hour usage bar', () => {
    render(makeRenderInput({
      fiveHourUsage: { percent: 40, resetsIn: '2h30m' },
    }));
    expect(logOutput[0]).toContain('5h');
    expect(logOutput[0]).toContain('40%');
    expect(logOutput[0]).toContain('~2h30m');
  });

  it('shows seven day usage when >= 10%', () => {
    render(makeRenderInput({
      sevenDayUsage: { percent: 50, resetsIn: '3d' },
    }));
    expect(logOutput[0]).toContain('7d');
    expect(logOutput[0]).toContain('50%');
  });

  it('hides seven day usage when < 10%', () => {
    render(makeRenderInput({
      sevenDayUsage: { percent: 5, resetsIn: null },
    }));
    expect(logOutput[0]).not.toContain('7d');
  });

  it('shows git insertions/deletions', () => {
    render(makeRenderInput({
      git: {
        branch: 'main', isDirty: true, ahead: 0, behind: 0,
        modified: 0, added: 0, deleted: 0, untracked: 0,
        insertions: 100, deletions: 50, fileCount: 0,
        lastCommit: '', stashCount: 0, dominantFileType: null,
      },
    }));
    expect(logOutput[1]).toContain('+100');
    expect(logOutput[1]).toContain('-50');
  });

  it('shows git ahead/behind', () => {
    render(makeRenderInput({
      git: {
        branch: 'feat', isDirty: false, ahead: 3, behind: 1,
        modified: 0, added: 0, deleted: 0, untracked: 0,
        insertions: 0, deletions: 0, fileCount: 0,
        lastCommit: '', stashCount: 0, dominantFileType: null,
      },
    }));
    expect(logOutput[1]).toContain('up3');
    expect(logOutput[1]).toContain('dn1');
  });

  it('shows stash count', () => {
    render(makeRenderInput({
      git: {
        branch: 'main', isDirty: false, ahead: 0, behind: 0,
        modified: 0, added: 0, deleted: 0, untracked: 0,
        insertions: 0, deletions: 0, fileCount: 0,
        lastCommit: '', stashCount: 3, dominantFileType: null,
      },
    }));
    expect(logOutput[1]).toContain('stash:3');
  });

  it('shows language tag', () => {
    render(makeRenderInput());
    expect(logOutput[2]).toContain('[Node]');
  });
});
