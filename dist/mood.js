const IDLE_MESSAGES = {
    cat: [
        'Purring softly...',
        'Watching the cursor move~',
        'Kneading the terminal...',
        'Tail swish... swish...',
    ],
    dog: [
        'Wags tail happily!',
        'Good boy mode: ON',
        'Panting with excitement~',
        'Waiting for treats...',
    ],
    rabbit: [
        'Nose twitch... twitch...',
        'Munching on some code~',
        'Ears up, listening...',
        'Hopping around happily!',
    ],
    panda: [
        'Chewing bamboo peacefully...',
        'Rolling around lazily~',
        'Zen mode activated...',
        'Contemplating the void...',
    ],
    penguin: [
        'Waddle waddle~',
        'Sliding on the ice!',
        'Flapping wings happily!',
        'Staring at the fish...',
    ],
    fox: [
        'What does the fox say?',
        'Sneaking through the code~',
        'Ears perked up!',
        'Pounce mode ready...',
    ],
};
const SIZE_MESSAGES = {
    tiny: [
        'So hungry... feed me tokens!',
        'Just a smol baby...',
        'Need more context to grow~',
        'Barely hatched...',
    ],
    small: [
        'Getting warmed up!',
        'Growing nicely~',
        'A light snack would be nice...',
        'Still room for more!',
    ],
    medium: [
        'Feeling just right!',
        'Perfectly balanced~',
        'In my happy place!',
        'This is the sweet spot!',
    ],
    chubby: [
        'Getting... a bit full...',
        'Maybe one more token...',
        'Starting to feel it...',
        'Round and proud!',
    ],
    thicc: [
        'MAXIMUM CHONK ACHIEVED',
        'I can\'t eat any more...',
        'About to pop!!!',
        'Send help... too many tokens...',
        'This is fine... *sweats*',
    ],
};
const BUSY_MESSAGES = [
    'Working hard!',
    'On it, boss!',
    'Processing... brrr...',
    'Crunching away~',
    'Let me handle this!',
];
const DANGER_MESSAGES = [
    'WARNING: Maximum chonk!',
    'Memory getting tight!!!',
    'About to burst!!!',
    'CRITICAL: Too many tokens!',
    'Compress me please!!!',
];
const GIT_DIRTY_MESSAGES = [
    'Uncommitted changes detected~',
    'Don\'t forget to commit!',
    'Changes waiting to be saved...',
];
const USAGE_HIGH_MESSAGES = [
    'Rate limit getting close...',
    'Easy on the tokens!',
    'Usage creeping up...',
];
export function getMoodMessage(ctx) {
    const { contextPercent, size, animation, animalType, git, fiveHourUsage, frameIndex } = ctx;
    // Priority 1: danger state
    if (animation === 'danger') {
        return DANGER_MESSAGES[frameIndex % DANGER_MESSAGES.length];
    }
    // Priority 2: high usage warning
    if (fiveHourUsage !== null && fiveHourUsage >= 80) {
        return USAGE_HIGH_MESSAGES[frameIndex % USAGE_HIGH_MESSAGES.length];
    }
    // Priority 3: busy
    if (animation === 'busy') {
        return BUSY_MESSAGES[frameIndex % BUSY_MESSAGES.length];
    }
    // Priority 4: git dirty (show sometimes)
    if (git?.isDirty && frameIndex % 8 < 3) {
        return GIT_DIRTY_MESSAGES[frameIndex % GIT_DIRTY_MESSAGES.length];
    }
    // Priority 5: size-based messages (show sometimes based on extremes)
    if ((size === 'tiny' || size === 'thicc') && frameIndex % 6 < 3) {
        return SIZE_MESSAGES[size][frameIndex % SIZE_MESSAGES[size].length];
    }
    // Default: animal-specific idle messages
    const msgs = IDLE_MESSAGES[animalType];
    return msgs[frameIndex % msgs.length];
}
