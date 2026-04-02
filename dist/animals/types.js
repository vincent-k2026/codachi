export function pickFrame(def, size, anim, frameIndex) {
    const frames = def.frames[size][anim];
    return frames[frameIndex % frames.length];
}
