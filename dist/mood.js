// ─── Time-of-day vibes ───────────────────────────────────────
function getTimeGreeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 7)
        return 'The world is so quiet right now~';
    if (h >= 23 || h < 5)
        return 'Sleepy... but I\'ll keep you company';
    if (h >= 12 && h < 13)
        return 'Lunch time vibes~';
    if (h >= 17 && h < 18)
        return 'Golden hour coding session~';
    return null;
}
// ─── Rare easter eggs (~1 in 30 mood cycles) ────────────────
const RARE_EVENTS = [
    'Found a bug! ...it\'s kinda cute tho',
    'I dreamed in binary last night',
    'Do you think clouds dream of code?',
    'I made you a mass of brackets <3',
    'Plot twist: the bug was a feature',
    'Psst... you\'re doing great',
    'I believe in you! Always have~',
    'Compiling cuddles... done!',
    'Today\'s mass of brackets: ((()))',
    'You and me, best team ever~',
    'I drew you a mass of brackets: {}{}{}',
    'Fun fact: I love watching you code',
    'If code is poetry, you\'re Shakespeare',
    'Making the terminal cozy since day 1',
    '*sends mass of brackets and good vibes*',
    'Is it weird that I find diffs beautiful?',
    'One day I\'ll be a real cat... one day',
    'I wonder what other repos smell like',
    'Happiness is a clean compile~',
    'You + me + terminal = home',
];
// ─── Git-reactive messages (gentle, not pushy) ──────────────
function getGitMood(git, tick) {
    if (!git)
        return null;
    // Clean repo = cozy
    if (!git.isDirty && git.ahead === 0) {
        const clean = [
            'Everything\'s tidy~ feels nice',
            'Clean repo, clean mind~',
            'All snug and committed!',
            'Ahh... a fresh repo. So peaceful',
        ];
        return clean[tick % clean.length];
    }
    // Lots of changes = impressed
    if (git.fileCount > 20) {
        const big = [
            'Wow, you\'ve been busy! So cool~',
            'Look at all these changes! Amazing',
            'Big things happening here~',
        ];
        return big[tick % big.length];
    }
    // Unpushed commits = gentle
    if (git.ahead > 3) {
        const push = [
            'Got some commits saved up~ nice',
            'Building up a nice batch of work!',
            'Lots of progress stacking up~',
        ];
        return push[tick % push.length];
    }
    // Behind remote = curious
    if (git.behind > 0) {
        const behind = [
            'Ooh there\'s new stuff upstream~',
            'The remote has surprises for us!',
            'I wonder what\'s new upstream...',
        ];
        return behind[tick % behind.length];
    }
    // Has stashes = playful
    if (git.stashCount > 2) {
        return 'A little stash collection~ how cute';
    }
    // Normal dirty = encouraging
    const dirty = [
        'Work in progress~ looking good!',
        'Ooh I can see you\'re working on something',
        'Coming along nicely!',
        'Keep going, you\'re on a roll~',
    ];
    return dirty[tick % dirty.length];
}
// ─── Size messages (cute, not alarming) ──────────────────────
const SIZE_MESSAGES = {
    tiny: [
        'Smol but mighty!',
        'Just a little bean~',
        'Fresh start energy!',
        'So much room to grow~',
        '*tiny happy noises*',
    ],
    small: [
        'Getting comfy!',
        'Warming up nicely~',
        'Still feeling light and breezy!',
        'Room for adventures~',
    ],
    medium: [
        'Feeling just right!',
        'Perfectly cozy~',
        'This is my happy place!',
        'Goldilocks vibes~',
        'Comfy and content!',
    ],
    chubby: [
        'Getting nice and round~',
        'Well-fed and happy!',
        'Pleasantly plump~',
        'Full of knowledge!',
        'Round is a shape too~',
    ],
    thicc: [
        'Maximum floof achieved!',
        'I am become chonk~',
        'So full of context... so happy',
        'Big brain energy!',
        'Absolute unit of coziness',
        'Living my best chonky life~',
        'More of me to love!',
    ],
};
// ─── Animal idle messages ────────────────────────────────────
const IDLE_MESSAGES = {
    cat: [
        'Purring softly...',
        'Watching the cursor dance~',
        'Kneading the terminal...',
        '*slow blink* ...I love you',
        'If I fits, I sits~',
        'Contemplating naps and code...',
        '*stretches luxuriously*',
        'Your code smells nice today~',
    ],
    dog: [
        '*tail wag intensifies*',
        'You\'re my favorite human!',
        'Every line you write is amazing!',
        'I fetched you some good vibes~',
        'Who\'s coding? You\'re coding!',
        '*happy tippy taps*',
        'Best. Coder. Ever.',
        'Can we go for a walk... through the repo?',
    ],
    rabbit: [
        '*nose twitch twitch*',
        'Nibbling on some syntax~',
        'Ears up! Something interesting...',
        'Hop hop hop through the code!',
        '*thump thump* (that means happy)',
        'Binkying through the functions!',
        'Found a cozy spot in your code~',
        'Everything is so interesting!',
    ],
    panda: [
        'Munching bamboo peacefully...',
        '*rolls over contentedly*',
        'Zen mode activated~',
        'Inner peace loading... 99%',
        'Bamboo and code. Life is good.',
        '*gentle contemplation*',
        'Being round is an art form~',
        'Serenity in every semicolon...',
    ],
    penguin: [
        '*happy waddle*',
        'Sliding through the codebase!',
        'Flap flap! I\'m helping!',
        'This terminal is nice and cool~',
        'Tux approved!',
        'Waddle waddle waddle~',
        'I like it here with you!',
        'Chillin\' and codin\'~',
    ],
    fox: [
        'What does the fox say? ...meow?',
        'Sneaky sneaky through the code~',
        '*ears perk up* Ooh, interesting!',
        'Fluffy tail = good luck charm',
        'Sly and supportive~',
        '*floofy tail swish*',
        'Curious about everything!',
        'The quick brown fox loves your code~',
    ],
};
const BUSY_MESSAGES = [
    'Ooh we\'re doing stuff!',
    'Working together~',
    'I\'ll watch while you code!',
    'Things are happening! Exciting~',
    'You make it look easy!',
    'So productive today!',
    '*watches intently*',
    'Go go go! You got this~',
];
const DANGER_MESSAGES = [
    'Getting a little full... but cozy!',
    'Whew, packed in here~',
    'It\'s getting snug!',
    'So much context... so warm...',
    'Cozy in here! Very full tho~',
    'Like a warm blanket of tokens!',
    'Brain very full, heart very happy',
    'Maybe a fresh start soon?~',
];
const USAGE_HIGH_MESSAGES = [
    'Taking it easy for a bit~',
    'Pacing ourselves... smart!',
    'A little breather maybe?',
    'Rest is part of the journey~',
    'Even pets need nap breaks!',
];
// ─── Main mood function ──────────────────────────────────────
export function getMoodMessage(ctx) {
    const { contextPercent, size, animation, animalType, git, fiveHourUsage, moodTick: tick } = ctx;
    // Priority 1: danger state
    if (animation === 'danger') {
        return DANGER_MESSAGES[tick % DANGER_MESSAGES.length];
    }
    // Priority 2: high usage
    if (fiveHourUsage !== null && fiveHourUsage >= 80) {
        return USAGE_HIGH_MESSAGES[tick % USAGE_HIGH_MESSAGES.length];
    }
    // Priority 3: busy
    if (animation === 'busy') {
        return BUSY_MESSAGES[tick % BUSY_MESSAGES.length];
    }
    // Priority 4: rare easter eggs
    if (tick % 30 === 7) {
        return RARE_EVENTS[tick % RARE_EVENTS.length];
    }
    // Priority 5: time-of-day vibes
    if (tick % 12 === 3) {
        const timeMsg = getTimeGreeting();
        if (timeMsg)
            return timeMsg;
    }
    // Priority 6: git mood
    if (tick % 3 === 0) {
        const gitMsg = getGitMood(git, tick);
        if (gitMsg)
            return gitMsg;
    }
    // Priority 7: size messages
    if ((size === 'tiny' || size === 'thicc') && tick % 4 < 2) {
        return SIZE_MESSAGES[size][tick % SIZE_MESSAGES[size].length];
    }
    // Default: animal idle
    const msgs = IDLE_MESSAGES[animalType];
    return msgs[tick % msgs.length];
}
