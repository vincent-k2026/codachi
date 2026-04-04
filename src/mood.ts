import type { BodySize, Animation, AnimalType, GitStatus } from './types.js';
import type { RelationshipTier } from './state.js';

interface MoodContext {
  contextPercent: number;
  size: BodySize;
  animation: Animation;
  animalType: AnimalType;
  git: GitStatus | null;
  fiveHourUsage: number | null;
  contextVelocity: number;
  cacheHitRate: number | null;
  relationshipTier: RelationshipTier;
  sessionNumber: number;
  moodTick: number;
}

// ─── Time-of-day vibes ───────────────────────────────────────
function getTimeGreeting(): string | null {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'The world is so quiet right now~';
  if (h >= 23 || h < 5) return 'Sleepy... but I\'ll keep you company';
  if (h >= 12 && h < 13) return 'Lunch time vibes~';
  if (h >= 17 && h < 18) return 'Golden hour coding session~';
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
function getGitMood(git: GitStatus | null, tick: number): string | null {
  if (!git) return null;

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
const SIZE_MESSAGES: Record<BodySize, string[]> = {
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
const IDLE_MESSAGES: Record<AnimalType, string[]> = {
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
  frog: [
    '*ribbit ribbit*',
    'Sitting on a lily pad of code~',
    'Catching bugs! Literally!',
    '*blink blink* ...big frog eyes',
    'Leap of faith into the codebase!',
    'It\'s not easy being green~',
    '*tongue zap* Got a bug!',
    'Frog and code, a classic combo~',
  ],
  octopus: [
    '*wiggles tentacles*',
    'Eight arms, infinite possibilities!',
    'Multi-tasking like a pro~',
    'Ink-redibly good code today!',
    '*squish squish* Comfy in here~',
    'Tentacles on the keyboard!',
    'Ocean-deep concentration...',
    'I can hold 8 files at once!',
  ],
  bunny: [
    '*nose twitch twitch*',
    'Nibbling on some syntax~',
    'Ears up! Something interesting...',
    'Hop hop hop through the code!',
    '*thump thump* (that means happy)',
    'Binkying through the functions!',
    'Found a cozy spot in your code~',
    'Everything is so interesting!',
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

// ─── Context velocity messages ───────────────────────────────
const VELOCITY_FAST = [
  'Whoa, burning through context!',
  'Speed coding session!',
  'Context going brrrr~',
  'Full throttle mode!',
];
const VELOCITY_SLOW = [
  'Nice steady pace~',
  'Slow and thoughtful, I like it',
  'Taking our time... smart!',
];

// ─── Cache messages ──────────────────────────────────────────
const CACHE_GOOD = [
  'Great cache hits! So efficient~',
  'Cache is cooking! Snappy session~',
  'High cache = fast vibes!',
];
const CACHE_BAD = [
  'Lots of fresh context flowing in~',
  'Cache miss... new territory!',
  'Exploring uncharted tokens~',
];

// ─── File type messages ──────────────────────────────────────
const FILE_TYPE_MESSAGES: Record<string, string[]> = {
  Tests:      ['Writing tests! So responsible~', 'Testing testing 1 2 3~', 'Test-driven? I respect that!'],
  Docs:       ['Documentation hero!', 'Docs day! Future you says thanks~', 'README vibes~'],
  Styles:     ['Making things pretty~', 'CSS wizardry in progress!', 'Pixel-perfect pursuit~'],
  Config:     ['Ooh, tinkering under the hood~', 'Config tweaks... careful now~', 'The foundation matters!'],
  Shell:      ['Shell scripting! Powerful stuff~', 'bash bash bash~', 'Automating all the things!'],
  SQL:        ['Database whisperer~', 'Query crafting mode!', 'SELECT * FROM awesome~'],
  TypeScript: ['Type safety feels good~', 'TypeScript gang!', 'Types are love, types are life~'],
  Python:     ['Pythonic elegance~', 'import antigravity', 'Beautiful is better than ugly~'],
  Rust:       ['Fearless concurrency!', 'The borrow checker approves~', 'Zero-cost abstractions!'],
  Go:         ['Go go go!', 'Simplicity is the ultimate sophistication~', 'Goroutines go brrr~'],
};

// ─── Relationship-tier messages ──────────────────────────────
const WELCOME_MESSAGES: Record<string, string[]> = {
  stranger:     ['Oh! A new friend! Hi!', 'Nice to meet you!', 'First time here? Welcome!'],
  acquaintance: ['Hey, good to see you again!', 'Welcome back~', 'Missed you!'],
  friend:       ['My favorite human is back!', 'Yay, we\'re coding together again!', 'I saved your spot~'],
  bestie:       ['BESTIE! You\'re here!', 'The dream team reunites!', 'You + me = unstoppable~'],
};

// ─── Main mood function ──────────────────────────────────────
export function getMoodMessage(ctx: MoodContext): string {
  const {
    contextPercent, size, animation, animalType, git,
    fiveHourUsage, contextVelocity, cacheHitRate,
    relationshipTier, sessionNumber, moodTick: tick,
  } = ctx;

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

  // Priority 4: welcome back (first few ticks of session)
  if (tick % 60 < 2) {
    const msgs = WELCOME_MESSAGES[relationshipTier];
    const base = msgs[tick % msgs.length];
    return sessionNumber > 1 ? `${base} #${sessionNumber}` : base;
  }

  // Priority 5: rare easter eggs
  if (tick % 30 === 7) {
    return RARE_EVENTS[tick % RARE_EVENTS.length];
  }

  // Priority 6: context velocity (when burning fast)
  if (contextVelocity > 5 && tick % 6 === 1) {
    return VELOCITY_FAST[tick % VELOCITY_FAST.length];
  }
  if (contextVelocity > 0 && contextVelocity <= 1 && tick % 8 === 2) {
    return VELOCITY_SLOW[tick % VELOCITY_SLOW.length];
  }

  // Priority 7: cache hit rate
  if (cacheHitRate !== null && tick % 10 === 4) {
    if (cacheHitRate >= 60) return CACHE_GOOD[tick % CACHE_GOOD.length];
    if (cacheHitRate < 30) return CACHE_BAD[tick % CACHE_BAD.length];
  }

  // Priority 8: time-of-day vibes
  if (tick % 12 === 3) {
    const timeMsg = getTimeGreeting();
    if (timeMsg) return timeMsg;
  }

  // Priority 9: file type awareness
  if (git?.dominantFileType && tick % 5 === 0) {
    const ftMsgs = FILE_TYPE_MESSAGES[git.dominantFileType];
    if (ftMsgs) return ftMsgs[tick % ftMsgs.length];
  }

  // Priority 10: git mood
  if (tick % 3 === 0) {
    const gitMsg = getGitMood(git, tick);
    if (gitMsg) return gitMsg;
  }

  // Priority 11: size messages
  if ((size === 'tiny' || size === 'thicc') && tick % 4 < 2) {
    return SIZE_MESSAGES[size][tick % SIZE_MESSAGES[size].length];
  }

  // Default: animal idle
  const msgs = IDLE_MESSAGES[animalType];
  return msgs[tick % msgs.length];
}
