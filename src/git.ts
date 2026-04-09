import { spawnSync } from 'node:child_process';
import type { GitStatus } from './types.js';
import { stringWidth } from './width.js';
import { logError } from './log.js';

const GIT_TIMEOUT = 2000;
const CACHE_TTL_MS = 2000; // cache git results for 2s

let cached: { status: GitStatus | null; cwd: string; time: number } | null = null;

// Pre-sorted by extension length (longest first) so .test.ts matches before .ts
const EXT_MAP: Record<string, string> = {
  '.test.ts': 'Tests', '.test.js': 'Tests', '.spec.ts': 'Tests', '.spec.js': 'Tests',
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript',
  '.py': 'Python', '.rs': 'Rust', '.go': 'Go', '.rb': 'Ruby', '.java': 'Java',
  '.kt': 'Kotlin', '.swift': 'Swift', '.c': 'C', '.cpp': 'C++', '.h': 'C',
  '.css': 'Styles', '.scss': 'Styles', '.html': 'HTML', '.vue': 'Vue', '.svelte': 'Svelte',
  '.md': 'Docs', '.json': 'Config', '.yaml': 'Config', '.yml': 'Config', '.toml': 'Config',
  '.sh': 'Shell', '.sql': 'SQL', '.proto': 'Proto', '.graphql': 'GraphQL',
};
const SORTED_EXT_MAP: [string, string][] = Object.entries(EXT_MAP).sort((a, b) => b[0].length - a[0].length);

/**
 * Run a git subcommand without a shell. This is Windows-safe (no bash redirects)
 * and swallows stderr at the OS level so missing refs / dirty working trees don't
 * leak into Claude Code's statusline output.
 */
function git(args: string[], cwd?: string): string {
  try {
    const res = spawnSync('git', args, {
      cwd,
      encoding: 'utf8',
      timeout: GIT_TIMEOUT,
      // Windows: resolve git.exe via PATH. `shell: false` avoids cmd.exe quoting hazards.
      shell: false,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    });
    if (res.error) {
      // ENOENT (git not installed) is expected on some systems — log once, degrade silently.
      if ((res.error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logError('git.spawn:' + args[0], res.error);
      }
      return '';
    }
    if (res.status !== 0) return '';
    return (res.stdout || '').trim();
  } catch (err) {
    logError('git.spawn:' + args[0], err);
    return '';
  }
}

function truncateByWidth(str: string, maxWidth: number): string {
  let w = 0;
  let i = 0;
  for (const ch of str) {
    const cw = stringWidth(ch);
    if (w + cw > maxWidth - 3) return str.slice(0, i) + '...';
    w += cw;
    i += ch.length;
  }
  return str;
}

function compute(cwd?: string): GitStatus | null {
  // 1. Branch + files + ahead/behind in one call
  const statusRaw = git(['status', '--porcelain', '-b'], cwd);
  if (!statusRaw) return null;

  const lines = statusRaw.split('\n');
  const branchLine = lines[0] || '';
  const fileLines = lines.slice(1).filter(Boolean);

  // Handle "## No commits yet on master" for fresh repos
  if (branchLine.includes('No commits yet')) {
    const initMatch = branchLine.match(/on\s+(\S+)/);
    return {
      branch: initMatch ? initMatch[1] : 'init',
      isDirty: fileLines.length > 0,
      ahead: 0, behind: 0, modified: 0, added: 0, deleted: 0,
      untracked: fileLines.length, insertions: 0, deletions: 0,
      fileCount: fileLines.length, lastCommit: '', stashCount: 0,
      dominantFileType: null,
    };
  }

  const branchMatch = branchLine.match(/^## ([^\s.]+)/);
  let branch = branchMatch ? branchMatch[1] : 'HEAD';
  // Truncate long branch names (Unicode-safe)
  if (stringWidth(branch) > 25) branch = truncateByWidth(branch, 25);

  let ahead = 0, behind = 0;
  const abMatch = branchLine.match(/\[(?:ahead (\d+))?(?:, )?(?:behind (\d+))?\]/);
  if (abMatch) {
    ahead = parseInt(abMatch[1]) || 0;
    behind = parseInt(abMatch[2]) || 0;
  }

  let modified = 0, added = 0, deleted = 0, untracked = 0;
  for (const line of fileLines) {
    const code = line.slice(0, 2);
    if (code.includes('?')) untracked++;
    else if (code.includes('A')) added++;
    else if (code.includes('D')) deleted++;
    else modified++;
  }

  // 2. Line stats + last commit + stash — three separate calls, portable everywhere.
  // spawnSync is cheap (~1ms each); parallelism via shell pipelines isn't worth the
  // Windows compatibility cost.
  let insertions = 0, deletions = 0, lastCommit = '', stashCount = 0;

  const shortstat = git(['diff', 'HEAD', '--shortstat'], cwd);
  if (shortstat) {
    const insMatch = shortstat.match(/(\d+) insertion/);
    const delMatch = shortstat.match(/(\d+) deletion/);
    if (insMatch) insertions = parseInt(insMatch[1]);
    if (delMatch) deletions = parseInt(delMatch[1]);
  }

  const lastLog = git(['log', '-1', '--format=%s'], cwd);
  lastCommit = truncateByWidth(lastLog, 40);

  const stashRaw = git(['stash', 'list'], cwd);
  stashCount = stashRaw ? stashRaw.split('\n').filter(Boolean).length : 0;

  // 3. Detect dominant file type from changed file paths
  const typeCounts: Record<string, number> = {};
  for (const line of fileLines) {
    const filePath = line.slice(3).trim().split(' -> ').pop() || '';
    let matched = false;
    // Check longer extensions first (.test.ts before .ts) — pre-sorted
    for (const [ext, type] of SORTED_EXT_MAP) {
      if (filePath.endsWith(ext)) { typeCounts[type] = (typeCounts[type] ?? 0) + 1; matched = true; break; }
    }
    if (!matched) typeCounts['Other'] = (typeCounts['Other'] ?? 0) + 1;
  }
  let dominantFileType: string | null = null;
  let maxCount = 0;
  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) { maxCount = count; dominantFileType = type; }
  }

  return {
    branch, isDirty: fileLines.length > 0,
    ahead, behind, modified, added, deleted, untracked,
    insertions, deletions, fileCount: fileLines.length,
    lastCommit, stashCount, dominantFileType,
  };
}

export function getGitStatus(cwd?: string): GitStatus | null {
  const now = Date.now();
  const dir = cwd || '';
  if (cached && cached.cwd === dir && (now - cached.time) < CACHE_TTL_MS) {
    return cached.status;
  }
  const status = compute(cwd);
  cached = { status, cwd: dir, time: now };
  return status;
}
