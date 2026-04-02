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

export function getFiveHourUsage(stdin: StdinData): { percent: number; resetsIn: string | null } | null {
  const pct = stdin.rate_limits?.five_hour?.used_percentage;
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  return {
    percent: Math.round(Math.min(100, Math.max(0, pct))),
    resetsIn: formatResetTime(stdin.rate_limits?.five_hour?.resets_at),
  };
}

export function getSevenDayUsage(stdin: StdinData): { percent: number; resetsIn: string | null } | null {
  const pct = stdin.rate_limits?.seven_day?.used_percentage;
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  return {
    percent: Math.round(Math.min(100, Math.max(0, pct))),
    resetsIn: formatResetTime(stdin.rate_limits?.seven_day?.resets_at),
  };
}
