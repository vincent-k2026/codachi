import { execSync } from 'node:child_process';
import type { GitStatus } from './types.js';

function run(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', timeout: 2000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

export function getGitStatus(cwd?: string): GitStatus | null {
  // Single call: branch + tracking + file status
  const statusRaw = run('git status --porcelain -b', cwd);
  if (!statusRaw) return null;

  const lines = statusRaw.split('\n');
  const branchLine = lines[0] || '';
  const fileLines = lines.slice(1).filter(Boolean);

  // Parse branch line: "## main...origin/main [ahead 2, behind 1]"
  const branchMatch = branchLine.match(/^## ([^\s.]+)/);
  const branch = branchMatch ? branchMatch[1] : 'HEAD';

  let ahead = 0, behind = 0;
  const abMatch = branchLine.match(/\[(?:ahead (\d+))?(?:, )?(?:behind (\d+))?\]/);
  if (abMatch) {
    ahead = parseInt(abMatch[1]) || 0;
    behind = parseInt(abMatch[2]) || 0;
  }

  // Parse file status
  let modified = 0, added = 0, deleted = 0, untracked = 0;
  for (const line of fileLines) {
    const code = line.slice(0, 2);
    if (code.includes('?')) untracked++;
    else if (code.includes('A')) added++;
    else if (code.includes('D')) deleted++;
    else modified++;
  }

  // Single call: combined diff stats (staged + unstaged)
  let insertions = 0, deletions = 0;
  const diffStat = run('git diff HEAD --shortstat', cwd);
  const insMatch = diffStat.match(/(\d+) insertion/);
  const delMatch = diffStat.match(/(\d+) deletion/);
  if (insMatch) insertions = parseInt(insMatch[1]);
  if (delMatch) deletions = parseInt(delMatch[1]);

  // Last commit + stash in one shot
  const lastCommitRaw = run('git log -1 --format=%s', cwd);
  const lastCommit = lastCommitRaw.length > 40 ? lastCommitRaw.slice(0, 37) + '...' : lastCommitRaw;

  const stashList = run('git stash list', cwd);
  const stashCount = stashList ? stashList.split('\n').filter(Boolean).length : 0;

  return {
    branch,
    isDirty: fileLines.length > 0,
    ahead, behind,
    modified, added, deleted, untracked,
    insertions, deletions,
    fileCount: fileLines.length,
    lastCommit,
    stashCount,
  };
}
