import { stringWidth } from '../width.js';
/**
 * Build a frame from content lines + optional tail.
 * Forces all content to the same width (even), then centers each line.
 * Tail goes to the right of line 0.
 */
export function f(contentLines, tail = '') {
    const widths = contentLines.map(l => stringWidth(l));
    let targetW = Math.max(...widths);
    // Force even width so centering is always symmetric
    if (targetW % 2 !== 0)
        targetW += 1;
    const centered = contentLines.map(l => {
        const w = stringWidth(l);
        const gap = targetW - w;
        // Distribute gap: half left, half right. If odd gap, extra goes right.
        const left = Math.floor(gap / 2);
        const right = gap - left;
        return ' '.repeat(left) + l + ' '.repeat(right);
    });
    const tailStr = tail || ' ';
    const lines = centered.map((l, i) => i === 0 ? l + tailStr : l + ' '.repeat(stringWidth(tailStr)));
    const width = Math.max(...lines.map(l => stringWidth(l)));
    return { lines, width };
}
/** Pick a frame. Normalizes all frames in the same animation to equal width. */
export function pickFrame(def, size, anim, tick) {
    const frames = def.frames[size][anim];
    const maxWidth = Math.max(...frames.map(fr => fr.width));
    const frame = frames[tick % frames.length];
    if (frame.width === maxWidth)
        return frame;
    const lines = frame.lines.map(l => {
        const pad = maxWidth - stringWidth(l);
        return pad > 0 ? l + ' '.repeat(pad) : l;
    });
    return { lines, width: maxWidth };
}
