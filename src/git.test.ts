import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);

let getGitStatus: typeof import('./git.js')['getGitStatus'];
let callCount: number;

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  callCount = 0;
  const mod = await import('./git.js');
  getGitStatus = mod.getGitStatus;
});

function setupGit(statusOutput: string, combinedOutput = '') {
  mockExecSync.mockImplementation((cmd: string) => {
    callCount++;
    const c = cmd as string;
    if (c.includes('git status')) return statusOutput;
    return combinedOutput;
  });
}

describe('getGitStatus', () => {
  it('returns null for non-git directory', () => {
    mockExecSync.mockImplementation(() => { throw new Error('not a git repo'); });
    // Use unique cwd to avoid cache
    expect(getGitStatus('/tmp/no-git-' + Date.now())).toBeNull();
  });

  it('parses clean repo', () => {
    setupGit('## main');
    const status = getGitStatus('/tmp/clean-' + Date.now());
    expect(status).not.toBeNull();
    expect(status!.branch).toBe('main');
    expect(status!.isDirty).toBe(false);
    expect(status!.fileCount).toBe(0);
  });

  it('parses branch with ahead/behind', () => {
    setupGit('## feature...origin/feature [ahead 3, behind 2]');
    const status = getGitStatus('/tmp/ahead-' + Date.now());
    expect(status!.branch).toBe('feature');
    expect(status!.ahead).toBe(3);
    expect(status!.behind).toBe(2);
  });

  it('parses modified/added/deleted/untracked files', () => {
    setupGit([
      '## main',
      ' M src/foo.ts',
      'A  src/bar.ts',
      ' D src/baz.ts',
      '?? src/new.ts',
    ].join('\n'));
    const status = getGitStatus('/tmp/dirty-' + Date.now());
    expect(status!.isDirty).toBe(true);
    expect(status!.modified).toBe(1);
    expect(status!.added).toBe(1);
    expect(status!.deleted).toBe(1);
    expect(status!.untracked).toBe(1);
    expect(status!.fileCount).toBe(4);
  });

  it('parses insertions/deletions from combined output', () => {
    setupGit(
      '## main',
      ' 3 files changed, 100 insertions(+), 50 deletions(-)\n---SEP---\nfix auth bug\n---SEP---\n',
    );
    const status = getGitStatus('/tmp/stats-' + Date.now());
    expect(status!.insertions).toBe(100);
    expect(status!.deletions).toBe(50);
    expect(status!.lastCommit).toBe('fix auth bug');
  });

  it('parses stash count', () => {
    setupGit(
      '## main',
      '\n---SEP---\nlast commit\n---SEP---\nstash@{0}: WIP\nstash@{1}: WIP2\n',
    );
    const status = getGitStatus('/tmp/stash-' + Date.now());
    expect(status!.stashCount).toBe(2);
  });

  it('handles fresh repo (No commits yet)', () => {
    setupGit('## No commits yet on master\n?? newfile.txt');
    const status = getGitStatus('/tmp/fresh-' + Date.now());
    expect(status!.branch).toBe('master');
    expect(status!.untracked).toBe(1);
  });

  it('truncates long branch names', () => {
    setupGit('## this-is-a-very-long-branch-name-that-exceeds-25-chars');
    const status = getGitStatus('/tmp/longbranch-' + Date.now());
    expect(status!.branch.length).toBeLessThanOrEqual(25);
    expect(status!.branch).toContain('...');
  });

  it('detects dominant file type', () => {
    setupGit([
      '## main',
      ' M src/foo.ts',
      ' M src/bar.ts',
      ' M src/baz.py',
    ].join('\n'));
    const status = getGitStatus('/tmp/filetype-' + Date.now());
    expect(status!.dominantFileType).toBe('TypeScript');
  });

  it('detects test files as dominant type', () => {
    setupGit([
      '## main',
      ' M src/foo.test.ts',
      ' M src/bar.test.ts',
    ].join('\n'));
    const status = getGitStatus('/tmp/testtype-' + Date.now());
    expect(status!.dominantFileType).toBe('Tests');
  });

  it('uses cache for repeated calls with same cwd', () => {
    setupGit('## main');
    const cwd = '/tmp/cache-' + Date.now();
    getGitStatus(cwd);
    const firstCallCount = callCount;
    getGitStatus(cwd);
    // Should not make additional execSync calls (cached)
    expect(callCount).toBe(firstCallCount);
  });
});
