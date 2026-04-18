import type { StdinData } from './types.js';

export async function readStdin(): Promise<StdinData | null> {
  if (process.stdin.isTTY) {
    return null;
  }

  const chunks: string[] = [];
  try {
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) {
      chunks.push(chunk as string);
    }
    const raw = chunks.join('');
    if (!raw.trim()) return null;
    return JSON.parse(raw) as StdinData;
  } catch {
    return null;
  }
}

export function getContextPercent(stdin: StdinData): number {
  const native = stdin.context_window?.used_percentage;
  if (typeof native === 'number' && !Number.isNaN(native)) {
    return Math.min(100, Math.max(0, Math.round(native)));
  }
  const size = stdin.context_window?.context_window_size;
  if (!size || size <= 0) return 0;
  const usage = stdin.context_window?.current_usage;
  const total = (usage?.input_tokens ?? 0) +
    (usage?.cache_creation_input_tokens ?? 0) +
    (usage?.cache_read_input_tokens ?? 0);
  return Math.min(100, Math.round((total / size) * 100));
}

export function getModelName(stdin: StdinData): string {
  const raw = stdin.model?.display_name?.trim() || stdin.model?.id?.trim() || 'Unknown';
  let name = raw.replace(/\s*\(.*?\)\s*/g, '').trim();
  name = name.replace(/^Claude\s+/i, '');
  return name;
}

function formatResetTime(resetAt: number | undefined): string | null {
  if (typeof resetAt !== 'number' || resetAt <= 0) return null;
  const ms = resetAt * 1000 - Date.now();
  if (ms <= 0) return null;
  const totalMins = Math.floor(ms / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours < 24) return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d${remHours}h` : `${days}d`;
}

export interface RateLimitInfo {
  percent: number;
  resetsIn: string | null;
  /** Pace delta: positive = over-consuming, negative = has headroom. null if unknown. */
  paceDelta: number | null;
}

/**
 * Compute pace delta: how far ahead or behind you are relative to the
 * rate limit window's natural pace.
 *
 *   delta = used% − elapsed%
 *   elapsed% = (windowMin − remainingMin) / windowMin × 100
 *
 * Example: 5h window, used 40%, 200 min left → elapsed 33% → delta +7% (over-consuming).
 */
function computePaceDelta(usedPct: number, resetsAt: number | undefined, windowMin: number): number | null {
  if (typeof resetsAt !== 'number' || resetsAt <= 0) return null;
  const remainingMin = (resetsAt * 1000 - Date.now()) / 60000;
  if (remainingMin < 0 || remainingMin > windowMin) return null;
  const elapsedPct = ((windowMin - remainingMin) / windowMin) * 100;
  return Math.round(usedPct - elapsedPct);
}

export function getFiveHourUsage(stdin: StdinData): RateLimitInfo | null {
  const pct = stdin.rate_limits?.five_hour?.used_percentage;
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  const percent = Math.round(Math.min(100, Math.max(0, pct)));
  return {
    percent,
    resetsIn: formatResetTime(stdin.rate_limits?.five_hour?.resets_at),
    paceDelta: computePaceDelta(percent, stdin.rate_limits?.five_hour?.resets_at, 300),
  };
}

export function getSevenDayUsage(stdin: StdinData): RateLimitInfo | null {
  const pct = stdin.rate_limits?.seven_day?.used_percentage;
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  const percent = Math.round(Math.min(100, Math.max(0, pct)));
  return {
    percent,
    resetsIn: formatResetTime(stdin.rate_limits?.seven_day?.resets_at),
    paceDelta: computePaceDelta(percent, stdin.rate_limits?.seven_day?.resets_at, 10080),
  };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

/** Returns session cost in USD, or null if Claude Code doesn't provide it. */
export function getSessionCost(stdin: StdinData): number | null {
  const cost = stdin.cost?.total_cost_usd;
  if (typeof cost !== 'number' || !Number.isFinite(cost)) return null;
  return cost;
}

/** Returns human-readable token usage like "550K/1M" */
export function getTokenSummary(stdin: StdinData): string | null {
  const usage = stdin.context_window?.current_usage;
  const windowSize = stdin.context_window?.context_window_size;
  if (!usage || !windowSize) return null;
  const used = (usage.input_tokens ?? 0) +
    (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0);
  if (used === 0) return null;
  return `${formatTokens(used)}/${formatTokens(windowSize)}`;
}

