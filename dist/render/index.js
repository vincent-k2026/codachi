import { RESET, DIM, rgb, progressBar, getContextColor, getUsageColor } from './colors.js';
import { getAnimalFrame, getAnimalName, getBodySize, getAnimation } from '../animals/index.js';
import { getMoodMessage } from '../mood.js';
function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
function visualLength(str) {
    return stripAnsi(str).length;
}
function getTerminalWidth() {
    const w = process.stderr?.columns || process.stdout?.columns;
    if (typeof w === 'number' && w > 0)
        return w;
    const env = parseInt(process.env.COLUMNS ?? '', 10);
    if (env > 0)
        return env;
    return 120;
}
function truncate(str, maxWidth) {
    if (visualLength(str) <= maxWidth)
        return str;
    const plain = stripAnsi(str);
    return plain.slice(0, maxWidth - 3) + '...' + RESET;
}
function padPetLine(colorizedLine, targetWidth) {
    const vis = visualLength(colorizedLine);
    const pad = Math.max(0, targetWidth - vis);
    return colorizedLine + ' '.repeat(pad);
}
const SEP = `${DIM}│${RESET}`;
export function render(input) {
    const { contextPercent, modelName, animalType, colors, git, fiveHourUsage, sevenDayUsage, tokens, frameIndex, } = input;
    const termWidth = getTerminalWidth();
    const size = getBodySize(contextPercent);
    const hasRunningTools = false;
    const animation = getAnimation(contextPercent, hasRunningTools);
    const frame = getAnimalFrame(animalType, size, animation, frameIndex);
    const mood = getMoodMessage({
        contextPercent, size, animation, animalType, git, fiveHourUsage: fiveHourUsage?.percent ?? null, frameIndex,
    });
    const petLines = frame.lines.map(line => colorizePetLine(line, colors));
    const petWidth = frame.width + 2;
    // ═══════════════════════════════════════════════════════════════
    // Line 1: [Model] Ctx ████░░ 65% (650K/1M) │ 5h ██░░ 25% ~3h │ 7d 15%
    // ═══════════════════════════════════════════════════════════════
    const ctxBar = progressBar(contextPercent, 10, getContextColor);
    const ctxColor = contextPercent >= 85 ? rgb(255, 80, 80)
        : contextPercent >= 70 ? rgb(255, 200, 50)
            : rgb(80, 220, 120);
    let ctxDetail = '';
    if (tokens) {
        ctxDetail = ` ${DIM}(${tokens.totalStr}/${tokens.windowStr})${RESET}`;
    }
    let line1 = `${DIM}[${RESET}${colors.accent}${modelName}${RESET}${DIM}]${RESET} ${ctxBar} ${ctxColor}${contextPercent}%${RESET}${ctxDetail}`;
    if (fiveHourUsage) {
        const u = fiveHourUsage;
        const uBar = progressBar(u.percent, 6, getUsageColor);
        const uColor = u.percent >= 90 ? rgb(255, 80, 80)
            : u.percent >= 75 ? rgb(200, 100, 255)
                : rgb(100, 150, 255);
        let resetStr = '';
        if (u.resetsIn)
            resetStr = ` ${DIM}~${u.resetsIn}${RESET}`;
        line1 += ` ${SEP} ${DIM}5h${RESET} ${uBar} ${uColor}${u.percent}%${RESET}${resetStr}`;
    }
    if (sevenDayUsage && sevenDayUsage.percent >= 10) {
        const u7 = sevenDayUsage;
        const u7Color = u7.percent >= 90 ? rgb(255, 80, 80)
            : u7.percent >= 75 ? rgb(200, 100, 255)
                : rgb(100, 150, 255);
        let reset7 = '';
        if (u7.resetsIn)
            reset7 = ` ${DIM}~${u7.resetsIn}${RESET}`;
        line1 += ` ${SEP} ${DIM}7d${RESET} ${u7Color}${u7.percent}%${RESET}${reset7}`;
    }
    // ═══════════════════════════════════════════════════════════════
    // Line 2: git:(main*) ~3 +1 -1 ?2 │ +127 -45 lines │ ↑2 ↓1
    // ═══════════════════════════════════════════════════════════════
    let line2 = '';
    if (git) {
        const dirtyMark = git.isDirty ? '*' : '';
        line2 = `${DIM}git:(${RESET}${colors.accent}${git.branch}${dirtyMark}${RESET}${DIM})${RESET}`;
        // File-level changes: ~modified +added -deleted ?untracked
        const fileStats = [];
        if (git.modified > 0)
            fileStats.push(`${rgb(255, 200, 50)}~${git.modified}${RESET}`);
        if (git.added > 0)
            fileStats.push(`${rgb(80, 220, 120)}+${git.added}${RESET}`);
        if (git.deleted > 0)
            fileStats.push(`${rgb(255, 80, 80)}-${git.deleted}${RESET}`);
        if (git.untracked > 0)
            fileStats.push(`${DIM}?${git.untracked}${RESET}`);
        if (fileStats.length > 0) {
            line2 += ` ${fileStats.join(' ')}`;
        }
        // Line-level changes: +insertions -deletions
        if (git.insertions > 0 || git.deletions > 0) {
            const lineParts = [];
            if (git.insertions > 0)
                lineParts.push(`${rgb(80, 220, 120)}+${git.insertions}${RESET}`);
            if (git.deletions > 0)
                lineParts.push(`${rgb(255, 80, 80)}-${git.deletions}${RESET}`);
            line2 += ` ${SEP} ${lineParts.join(' ')} ${DIM}lines${RESET}`;
        }
        // Ahead/behind
        if (git.ahead > 0 || git.behind > 0) {
            const remoteParts = [];
            if (git.ahead > 0)
                remoteParts.push(`${rgb(255, 200, 50)}↑${git.ahead}${RESET}`);
            if (git.behind > 0)
                remoteParts.push(`${rgb(200, 100, 255)}↓${git.behind}${RESET}`);
            line2 += ` ${SEP} ${remoteParts.join(' ')}`;
        }
    }
    // ═══════════════════════════════════════════════════════════════
    // Line 3: Cat "mood" │ in:45K out:12K cache:580K
    // ═══════════════════════════════════════════════════════════════
    const animalName = getAnimalName(animalType);
    let line3 = `${colors.body}${animalName}${RESET} ${DIM}${mood}${RESET}`;
    if (tokens) {
        const parts = [];
        if (tokens.input > 0)
            parts.push(`${DIM}in:${RESET}${rgb(100, 200, 255)}${tokens.inputStr}${RESET}`);
        if (tokens.output > 0)
            parts.push(`${DIM}out:${RESET}${rgb(180, 255, 150)}${tokens.outputStr}${RESET}`);
        if (tokens.cacheRead > 0)
            parts.push(`${DIM}cached:${RESET}${rgb(200, 180, 255)}${tokens.cacheReadStr}${RESET}`);
        if (tokens.cacheWrite > 0)
            parts.push(`${DIM}new:${RESET}${rgb(255, 200, 150)}${tokens.cacheWriteStr}${RESET}`);
        if (parts.length > 0) {
            line3 += ` ${SEP} ${parts.join(' ')}`;
        }
    }
    // ═══════════════════════════════════════════════════════════════
    // Compose: pet on left, info on right
    // ═══════════════════════════════════════════════════════════════
    const infos = [line1, line2, line3];
    const outputLines = [];
    for (let i = 0; i < 3; i++) {
        const pet = padPetLine(petLines[i] || '', petWidth);
        const info = infos[i] || '';
        outputLines.push(truncate(`${pet}${info}`, termWidth));
    }
    for (const line of outputLines) {
        console.log(`${RESET}${line}`);
    }
}
function colorizePetLine(line, colors) {
    let result = '';
    let currentColor = '';
    for (const ch of line) {
        let targetColor;
        if ('oO@.-^~><'.includes(ch)) {
            targetColor = colors.face;
        }
        else if ('()[]{}'.includes(ch)) {
            targetColor = colors.body;
        }
        else if ('/\\|_=─┌┐└┘│┬'.includes(ch)) {
            targetColor = colors.body;
        }
        else if ('Uu'.includes(ch)) {
            targetColor = colors.accent;
        }
        else if ('Vv'.includes(ch)) {
            targetColor = colors.accent;
        }
        else if ('wYdb'.includes(ch)) {
            targetColor = colors.blush;
        }
        else if (ch === '!' || ch === '?' || ch === 'z' || ch === 'Z') {
            targetColor = colors.face;
        }
        else if ('◕◡‿⊙▽□○'.includes(ch)) {
            targetColor = colors.face;
        }
        else if (ch === '"') {
            targetColor = colors.accent;
        }
        else {
            targetColor = '';
        }
        if (targetColor !== currentColor) {
            result += targetColor === '' ? RESET : targetColor;
            currentColor = targetColor;
        }
        result += ch;
    }
    if (currentColor !== '')
        result += RESET;
    return result;
}
