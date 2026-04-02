export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';
export function rgb(r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m`;
}
export function bgRgb(r, g, b) {
    return `\x1b[48;2;${r};${g};${b}m`;
}
export function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) {
        r = c;
        g = x;
    }
    else if (h < 120) {
        r = x;
        g = c;
    }
    else if (h < 180) {
        g = c;
        b = x;
    }
    else if (h < 240) {
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        b = c;
    }
    else {
        r = c;
        b = x;
    }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
export function hsl(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    return rgb(r, g, b);
}
export function colorize(text, color) {
    return `${color}${text}${RESET}`;
}
export function dim(text) {
    return colorize(text, DIM);
}
export function bold(text) {
    return colorize(text, BOLD);
}
// Context bar color: green → yellow → red
export function getContextColor(percent) {
    if (percent >= 85)
        return rgb(255, 80, 80);
    if (percent >= 70)
        return rgb(255, 200, 50);
    return rgb(80, 220, 120);
}
// Usage bar color: blue → magenta → red
export function getUsageColor(percent) {
    if (percent >= 90)
        return rgb(255, 80, 80);
    if (percent >= 75)
        return rgb(200, 100, 255);
    return rgb(100, 150, 255);
}
export function progressBar(percent, width, colorFn) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const color = colorFn(percent);
    return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
