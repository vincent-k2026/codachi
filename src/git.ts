import { execSync } from 'node:child_process';
import type { GitStatus } from './types.js';
import { stringWidth } from './width.js';

const GIT_TIMEOUT = 2000;
const CACHE_TTL_MS = 2000; // cache git results for 2s

let cached: { status: GitStatus | null; cwd: string; time: number } | null = null;

function run(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', timeout: GIT_TIMEOUT, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
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
  const statusRaw = run('git status --porcelain -b', cwd);
  if (!statusRaw) return null;

  const lines = statusRaw.split('\n');
  const branchLine = lines[0] || '';
  const fileLines = lines.slice(1).filter(Boolean);

  const branchMatch = branchLine.match(/^## ([^\s.]+)/);
  const branch = branchMatch ? branchMatch[1] : 'HEAD';

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

  // 2. Line stats + last commit + stash in one combined call
  let insertions = 0, deletions = 0, lastCommit = '', stashCount = 0;

  const combined = run(
    'git diff HEAD --shortstat 2>/dev/null; echo "---SEP---"; git log -1 --format=%s 2>/dev/null; echo "---SEP---"; git stash list 2>/dev/null',
    cwd,
  );
  if (combined) {
    const parts = combined.split('---SEP---').map(s => s.trim());
    // diff stats
    const insMatch = parts[0]?.match(/(\d+) insertion/);
    const delMatch = parts[0]?.match(/(\d+) deletion/);
    if (insMatch) insertions = parseInt(insMatch[1]);
    if (delMatch) deletions = parseInt(delMatch[1]);
    // last commit (unicode-safe truncation)
    lastCommit = truncateByWidth(parts[1] || '', 40);
    // stash count
    stashCount = parts[2] ? parts[2].split('\n').filter(Boolean).length : 0;
  }

  // 3. Detect dominant file type from changed file paths
  const extMap: Record<string, string> = {
    '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript',
    '.py': 'Python', '.rs': 'Rust', '.go': 'Go', '.rb': 'Ruby', '.java': 'Java',
    '.kt': 'Kotlin', '.swift': 'Swift', '.c': 'C', '.cpp': 'C++', '.h': 'C',
    '.css': 'Styles', '.scss': 'Styles', '.html': 'HTML', '.vue': 'Vue', '.svelte': 'Svelte',
    '.md': 'Docs', '.json': 'Config', '.yaml': 'Config', '.yml': 'Config', '.toml': 'Config',
    '.test.ts': 'Tests', '.test.js': 'Tests', '.spec.ts': 'Tests', '.spec.js': 'Tests',
    '.sh': 'Shell', '.sql': 'SQL', '.proto': 'Proto', '.graphql': 'GraphQL',
  };
  const typeCounts: Record<string, number> = {};
  for (const line of fileLines) {
    const filePath = line.slice(3).trim().split(' -> ').pop() || '';
    // Check longer extensions first (.test.ts before .ts)
    let matched = false;
    for (const ext of Object.keys(extMap).sort((a, b) => b.length - a.length)) {
      if (filePath.endsWith(ext)) { typeCounts[extMap[ext]] = (typeCounts[extMap[ext]] ?? 0) + 1; matched = true; break; }
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
