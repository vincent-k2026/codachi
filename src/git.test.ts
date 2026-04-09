import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
}));

const mockSpawnSync = vi.mocked(spawnSync);

let getGitStatus: typeof import('./git.js')['getGitStatus'];
let callCount: number;

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  callCount = 0;
  const mod = await import('./git.js');
  getGitStatus = mod.getGitStatus;
});

function ok(stdout: string) {
  return { status: 0, stdout, stderr: '', signal: null, pid: 1, output: [] as any, error: undefined } as any;
}
function fail() {
  return { status: 1, stdout: '', stderr: '', signal: null, pid: 1, output: [] as any, error: undefined } as any;
}

/**
 * Mock each git subcommand individually. The `compute` function calls:
 *   git status --porcelain -b
 *   git diff HEAD --shortstat
 *   git log -1 --format=%s
 *   git stash list
 */
function setupGit(opts: {
  status: string;        // output of `git status --porcelain -b`
  shortstat?: string;
  log?: string;
  stash?: string;
}) {
  mockSpawnSync.mockImplementation((_cmd: any, args: any) => {
    callCount++;
    const a = args as string[];
    const sub = a[0];
    if (sub === 'status') return opts.status ? ok(opts.status) : fail();
    if (sub === 'diff') return ok(opts.shortstat ?? '');
    if (sub === 'log') return ok(opts.log ?? '');
    if (sub === 'stash') return ok(opts.stash ?? '');
    return ok('');
  });
}

describe('getGitStatus', () => {
  it('returns null for non-git directory', () => {
    mockSpawnSync.mockImplementation(() => fail());
    expect(getGitStatus('/tmp/no-git-' + Date.now())).toBeNull();
  });

  it('parses clean repo', () => {
    setupGit({ status: '## main' });
    const status = getGitStatus('/tmp/clean-' + Date.now());
    expect(status).not.toBeNull();
    expect(status!.branch).toBe('main');
    expect(status!.isDirty).toBe(false);
    expect(status!.fileCount).toBe(0);
  });

  it('parses branch with ahead/behind', () => {
    setupGit({ status: '## feature...origin/feature [ahead 3, behind 2]' });
    const status = getGitStatus('/tmp/ahead-' + Date.now());
    expect(status!.branch).toBe('feature');
    expect(status!.ahead).toBe(3);
    expect(status!.behind).toBe(2);
  });

  it('parses modified/added/deleted/untracked files', () => {
    setupGit({
      status: [
        '## main',
        ' M src/foo.ts',
        'A  src/bar.ts',
        ' D src/baz.ts',
        '?? src/new.ts',
      ].join('\n'),
    });
    const status = getGitStatus('/tmp/dirty-' + Date.now());
    expect(status!.isDirty).toBe(true);
    expect(status!.modified).toBe(1);
    expect(status!.added).toBe(1);
    expect(status!.deleted).toBe(1);
    expect(status!.untracked).toBe(1);
    expect(status!.fileCount).toBe(4);
  });

  it('parses insertions/deletions from shortstat', () => {
    setupGit({
      status: '## main',
      shortstat: ' 3 files changed, 100 insertions(+), 50 deletions(-)',
      log: 'fix auth bug',
    });
    const status = getGitStatus('/tmp/stats-' + Date.now());
    expect(status!.insertions).toBe(100);
    expect(status!.deletions).toBe(50);
    expect(status!.lastCommit).toBe('fix auth bug');
  });

  it('parses stash count', () => {
    setupGit({
      status: '## main',
      log: 'last commit',
      stash: 'stash@{0}: WIP\nstash@{1}: WIP2',
    });
    const status = getGitStatus('/tmp/stash-' + Date.now());
    expect(status!.stashCount).toBe(2);
  });

  it('handles fresh repo (No commits yet)', () => {
    setupGit({ status: '## No commits yet on master\n?? newfile.txt' });
    const status = getGitStatus('/tmp/fresh-' + Date.now());
    expect(status!.branch).toBe('master');
    expect(status!.untracked).toBe(1);
  });

  it('truncates long branch names', () => {
    setupGit({ status: '## this-is-a-very-long-branch-name-that-exceeds-25-chars' });
    const status = getGitStatus('/tmp/longbranch-' + Date.now());
    expect(status!.branch.length).toBeLessThanOrEqual(25);
    expect(status!.branch).toContain('...');
  });

  it('detects dominant file type', () => {
    setupGit({
      status: [
        '## main',
        ' M src/foo.ts',
        ' M src/bar.ts',
        ' M src/baz.py',
      ].join('\n'),
    });
    const status = getGitStatus('/tmp/filetype-' + Date.now());
    expect(status!.dominantFileType).toBe('TypeScript');
  });

  it('detects test files as dominant type', () => {
    setupGit({
      status: [
        '## main',
        ' M src/foo.test.ts',
        ' M src/bar.test.ts',
      ].join('\n'),
    });
    const status = getGitStatus('/tmp/testtype-' + Date.now());
    expect(status!.dominantFileType).toBe('Tests');
  });

  it('uses cache for repeated calls with same cwd', () => {
    setupGit({ status: '## main' });
    const cwd = '/tmp/cache-' + Date.now();
    getGitStatus(cwd);
    const firstCallCount = callCount;
    getGitStatus(cwd);
    expect(callCount).toBe(firstCallCount);
  });
});
