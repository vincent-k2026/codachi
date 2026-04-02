export async function readStdin() {
    if (process.stdin.isTTY) {
        return null;
    }
    const chunks = [];
    try {
        process.stdin.setEncoding('utf8');
        for await (const chunk of process.stdin) {
            chunks.push(chunk);
        }
        const raw = chunks.join('');
        if (!raw.trim())
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function getContextPercent(stdin) {
    const native = stdin.context_window?.used_percentage;
    if (typeof native === 'number' && !Number.isNaN(native)) {
        return Math.min(100, Math.max(0, Math.round(native)));
    }
    const size = stdin.context_window?.context_window_size;
    if (!size || size <= 0)
        return 0;
    const usage = stdin.context_window?.current_usage;
    const total = (usage?.input_tokens ?? 0) +
        (usage?.cache_creation_input_tokens ?? 0) +
        (usage?.cache_read_input_tokens ?? 0);
    return Math.min(100, Math.round((total / size) * 100));
}
export function getModelName(stdin) {
    return stdin.model?.display_name?.trim() || stdin.model?.id?.trim() || 'Unknown';
}
export function getFiveHourUsage(stdin) {
    const pct = stdin.rate_limits?.five_hour?.used_percentage;
    if (typeof pct !== 'number' || !Number.isFinite(pct))
        return null;
    const percent = Math.round(Math.min(100, Math.max(0, pct)));
    let resetsIn = null;
    const resetAt = stdin.rate_limits?.five_hour?.resets_at;
    if (typeof resetAt === 'number' && resetAt > 0) {
        const ms = resetAt * 1000 - Date.now();
        if (ms > 0) {
            const mins = Math.floor(ms / 60000);
            if (mins < 60)
                resetsIn = `${mins}m`;
            else
                resetsIn = `${Math.floor(mins / 60)}h${mins % 60}m`;
        }
    }
    return { percent, resetsIn };
}
export function getSevenDayUsage(stdin) {
    const pct = stdin.rate_limits?.seven_day?.used_percentage;
    if (typeof pct !== 'number' || !Number.isFinite(pct))
        return null;
    const percent = Math.round(Math.min(100, Math.max(0, pct)));
    let resetsIn = null;
    const resetAt = stdin.rate_limits?.seven_day?.resets_at;
    if (typeof resetAt === 'number' && resetAt > 0) {
        const ms = resetAt * 1000 - Date.now();
        if (ms > 0) {
            const hrs = Math.floor(ms / 3600000);
            if (hrs < 24)
                resetsIn = `${hrs}h`;
            else
                resetsIn = `${Math.floor(hrs / 24)}d${hrs % 24}h`;
        }
    }
    return { percent, resetsIn };
}
function formatTokenCount(n) {
    if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(0)}K`;
    return `${n}`;
}
export function getTokenBreakdown(stdin) {
    const usage = stdin.context_window?.current_usage;
    const windowSize = stdin.context_window?.context_window_size;
    if (!usage || !windowSize)
        return null;
    const input = usage.input_tokens ?? 0;
    const output = usage.output_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const total = input + cacheWrite + cacheRead;
    return {
        input, output, cacheWrite, cacheRead, total, windowSize,
        inputStr: formatTokenCount(input),
        outputStr: formatTokenCount(output),
        cacheWriteStr: formatTokenCount(cacheWrite),
        cacheReadStr: formatTokenCount(cacheRead),
        totalStr: formatTokenCount(total),
        windowStr: formatTokenCount(windowSize),
    };
}
