import type { BodySize, Animation, AnimalType, GitStatus } from './types.js';
import type { RelationshipTier } from './state.js';
import type { EventContext } from './events.js';

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
  eventContext: EventContext;
}

// ── Helper: resolve message (string or template function) ──

type Msg = string | ((detail: string) => string);

function pick(pool: Msg[], tick: number, detail: string = ''): string {
  // Sanitize detail for template messages
  const safeDetail = detail.length > 25 ? detail.slice(0, 22) + '...' : detail;

  const m = pool[tick % pool.length];
  if (typeof m === 'function') {
    // Skip template functions when detail is empty — fall through to next message
    if (!safeDetail) return pool[(tick + 1) % pool.length] as string;
    return m(safeDetail);
  }
  return m;
}

// ─────────────────────────────────────────────────────────────
//  EVENT-REACTIVE MESSAGES (~350 messages)
// ─────────────────────────────────────────────────────────────

const EVENT_MESSAGES: Record<string, Msg[]> = {

  // ─── Testing ──────────────────────────────────────
  test_passed: [
    'ALL GREEN! *happy dance*',
    'Tests passed! *victory spin*',
    'Green across the board!',
    '*confetti* Every test passed!',
    'Beautiful green checkmarks~',
    'Nailed it! Every single test!',
    '*does a little jig* All passing!',
    'Tests are happy, I\'m happy~',
    'Clean test run! *chef\'s kiss*',
    'You make testing look easy!',
    '100% pass rate! *sparkling eyes*',
    'The test suite approves!',
  ],
  test_failed: [
    'Tests tripped... you got this!',
    'Oops, a test stumbled~',
    '*gentle pat* Test didn\'t pass...',
    'Red means learning!',
    'A test fell... we\'ll catch it!',
    '*encouraging nod* Almost there!',
    'Test says no... we say try again!',
    'Debugging time! My favorite~',
    'Failure is just success loading...',
    'Tests are just pointing the way!',
  ],

  // ─── Building ─────────────────────────────────────
  build_passed: [
    'Build success! *celebrates*',
    'Clean build! *sparkling eyes*',
    'It compiles! Beautiful~',
    '*triumphant pose* Built!',
    'Zero errors! Zero warnings!',
    'Compiled flawlessly!',
    'Build complete! *flexes*',
    'Fresh build, fresh vibes!',
    'The compiler is pleased~',
    'Ship-ready! *stamps approval*',
  ],
  build_failed: [
    'Build broke... let\'s debug!',
    'Compilation hiccup! *investigates*',
    '*puts on detective hat* Build issue...',
    'Build stumbled... we\'ve got this!',
    'The compiler disagrees... hmm',
    'Build error! Nothing we can\'t fix~',
    'Oops, build didn\'t make it...',
    '*rolls up sleeves* Build fix time!',
    'Syntax gremlin found!',
    'The compiler is being picky today~',
  ],

  // ─── Installing ───────────────────────────────────
  install: [
    'New dependencies! *unwraps eagerly*',
    'Installing packages~ *excited*',
    'Ooh, what are we adding?',
    'Package time! *opens box*',
    'Dependencies flowing in~',
    'Adding new tools to the toolbox!',
    'More packages! More power!',
    'Shopping for dependencies~',
    'Installing... *reads the label*',
    'New toys arriving!',
    'The node_modules grows...',
    'Package delivery! *signs receipt*',
  ],

  // ─── Git: Commit ──────────────────────────────────
  git_commit: [
    'New commit! *stamps with approval*',
    'Committed! Another chapter written~',
    'Saving progress! *checkpoint!*',
    '*ding!* Commit recorded!',
    'History written! Nice commit~',
    'The repo remembers~',
    'Another commit in the books!',
    'Checkpoint saved! *relief*',
    'Your future self says thanks~',
    'Preserved for posterity!',
    'Git log grows! Beautiful~',
    'Commit! Progress is progress!',
  ],

  // ─── Git: Push ────────────────────────────────────
  git_push: [
    'Pushing! *waves goodbye to code*',
    'Code is flying to the remote!',
    'Shipping it! *watches code depart*',
    'Your code goes into the world~',
    'Off it goes! *proud parent vibes*',
    'The remote has been blessed!',
    'Code launched to the cloud!',
    'Your work is out there now!',
    'Push! Sharing is caring~',
    'To the remote and beyond!',
  ],

  // ─── Git: Pull/Fetch ─────────────────────────────
  git_pull: [
    'Pulling fresh code! *catches*',
    'What\'s new? *so excited*',
    'Syncing up with the world~',
    'New code incoming! *receives*',
    'Updating from upstream~',
    'Fresh commits arriving!',
    'Let\'s see what changed!',
    'Ooh, presents from upstream!',
  ],

  // ─── Git: Merge ───────────────────────────────────
  git_merge: [
    'Merging! *holds breath*',
    'Bringing branches together~',
    'Merge time! *crosses fingers*',
    'Two become one! *dramatic*',
    'Hope it\'s clean!',
    'Branch fusion activated!',
    'The branches unite!',
    '*nervous excitement* Merging...',
  ],

  // ─── Git: Rebase ──────────────────────────────────
  git_rebase: [
    'Rewriting history! *dramatic cape*',
    'Rebase! The timeline shifts~',
    'Reorganizing commits... *careful*',
    'Rebase in progress!',
    'Playing commit tetris!',
    'History rewrite! *puts on glasses*',
    'Making history cleaner~',
    'The commits rearrange!',
  ],

  // ─── Git: Stash ───────────────────────────────────
  git_stash: [
    'Stashing for later~ *tucks away*',
    'Saved for a rainy day!',
    'Into the stash it goes!',
    'Pocket save! *stashes safely*',
    'I\'ll remember where this is~',
    'Secret stash growing!',
  ],

  // ─── Git: Checkout/Switch ─────────────────────────
  git_checkout: [
    'Switching branches! *jumps*',
    'New branch, new vibes~',
    'Branch hop! *lands gracefully*',
    'Let\'s explore a new branch!',
    'Off to a different timeline!',
    'Context switch! *whoosh*',
    'Adventure on a new branch!',
  ],

  // ─── Linting / Formatting ────────────────────────
  lint_format: [
    'Tidying up the code~ *sweeps*',
    'Making it pretty! *adjusts*',
    'Format police on duty!',
    'Clean code, clean mind~',
    'Lint brush in action!',
    'Style check! Looking sharp~',
    'Polishing the code! *buff buff*',
    'Code spa day! Refresh~',
    'Every indent in its place!',
    'Pixel-perfect formatting!',
  ],

  // ─── Server / Running ────────────────────────────
  server_start: [
    'Starting up! *engine revs*',
    'Server is waking up~',
    'Let\'s see it run! *excited*',
    'Spinning up! *watches eagerly*',
    'It\'s alive! *dramatic gasp*',
    'Launch sequence initiated!',
    'The server stirs! *humming*',
    'Booting up! Almost there~',
  ],

  // ─── Docker / K8s ────────────────────────────────
  docker: [
    'Container time! *packs boxes*',
    'Docker goes brrr~',
    'Building a container!',
    'Containerizing! Neat and tidy~',
    'Docker magic happening!',
    'Packaging everything up!',
    'Containers are just tiny computers~',
    'Orchestrating! *conducts*',
  ],

  // ─── Network / HTTP ──────────────────────────────
  network: [
    'Reaching out to the internet~',
    'Network call! *casts fishing line*',
    'Fetching from afar! *binoculars*',
    'Downloading... *catches bytes*',
    'Talking to servers!',
    'API call in progress~',
    'Sending bytes into the void!',
    'The internet responds!',
  ],

  // ─── Dangerous Commands ──────────────────────────
  dangerous: [
    'Whoa... careful there! *peeks*',
    '*covers eyes* That\'s bold...',
    'Living on the edge!',
    'That\'s a powerful command...',
    'Brave! Very brave!',
    'Danger zone! *dramatic music*',
    '*hides behind paw* Be careful!',
    'The point of no return~',
  ],

  // ─── Search / Grep ───────────────────────────────
  search: [
    'Searching! *detective mode*',
    'Looking for clues~',
    'Hunt mode activated!',
    'Where oh where could it be?',
    '*magnifying glass* Searching...',
    'Detective work! *sniff sniff*',
    'Seeking... seeking...',
    'The search is on!',
  ],

  // ─── File Editing: Tests ─────────────────────────
  edit_test: [
    'Writing tests! So responsible~',
    'Test code! Future you says thanks!',
    'Testing is caring!',
    'More tests = more confidence!',
    'Test driven! I respect that~',
    'Covering those edge cases!',
    (d: string) => `Testing ${d}~ thorough!`,
    (d: string) => `${d} getting test coverage!`,
    'Tests are love letters to your future self~',
  ],

  // ─── File Editing: Docs ──────────────────────────
  edit_docs: [
    'Documentation hero! *salutes*',
    'Docs! The unsung hero of code!',
    'README power! *flexes*',
    'Documenting! Future devs love you~',
    'Words about code! Important work!',
    'Making knowledge accessible!',
    (d: string) => `Writing ${d}~ so helpful!`,
    (d: string) => `${d} getting documented!`,
    'Good docs make great projects~',
  ],

  // ─── File Editing: Styles ────────────────────────
  edit_style: [
    'Making things pretty! *admires*',
    'CSS wizardry! *waves wand*',
    'Pixel perfect pursuit~',
    'Styling! The art of code~',
    'Visual magic happening!',
    'Design meets code! Beautiful~',
    (d: string) => `Styling ${d}~ gorgeous!`,
    'Colors and layouts and spacing, oh my!',
  ],

  // ─── File Editing: Config ────────────────────────
  edit_config: [
    'Tweaking configs~ *adjusts knobs*',
    'Configuration! The foundation~',
    'Fine-tuning the machine!',
    'Config changes! Careful work~',
    'Under the hood adjustments!',
    'Settings being dialed in~',
    (d: string) => `Configuring ${d}~`,
    (d: string) => `${d} getting tuned up!`,
    'The gears of the machine~',
  ],

  // ─── File Editing: Code ──────────────────────────
  edit_code: [
    'Code flowing! *watches happily*',
    'Editing! The creative process~',
    'Shaping the codebase!',
    'Crafting code, line by line~',
    'The code evolves!',
    'Building something great!',
    (d: string) => `Working on ${d}~ nice!`,
    (d: string) => `${d} is getting some love!`,
    (d: string) => `Ooh, touching ${d}~`,
    (d: string) => `Changes to ${d}... interesting!`,
    'Every keystroke matters!',
    'Art in the making~',
  ],

  // ─── Creating New Files ──────────────────────────
  creating_file: [
    'A new file is born! *celebrates*',
    'Creating something new! *excited*',
    'Fresh file! Full of potential~',
    'New file! A blank canvas!',
    'Welcome to the project, little file!',
    'Hello, new file! Welcome!',
    (d: string) => `${d} enters the world!`,
    (d: string) => `Creating ${d}~ exciting!`,
    'A new beginning!',
  ],

  // ─── Exploring (many reads) ──────────────────────
  exploring: [
    'Exploring the codebase! *curious*',
    'Reading reading reading~',
    'Deep dive mode! *puts on goggles*',
    'Learning the lay of the land~',
    'Code archaeology in progress!',
    'So much to discover!',
    'Mapping the territory!',
    'Understanding everything~',
    'The codebase reveals its secrets!',
  ],

  // ─── Rapid Editing ───────────────────────────────
  rapid_editing: [
    'You\'re on fire! *fans self*',
    'Speed coding! Can barely keep up!',
    'Rapid changes! *watches in awe*',
    'Flow state detected! Beautiful~',
    'Fingers flying! So fast!',
    'Editing spree! Unstoppable!',
    'The code is transforming!',
    'Whoa, so many edits!',
    'Refactoring tornado!',
  ],

  // ─── Generic Bash Failure ────────────────────────
  bash_failed: [
    'Hmm, that didn\'t work...',
    'Oops! But failures are learning~',
    'Error! But you\'ve got this!',
    'Something went wrong...',
    'Not quite... but close!',
    'Stumble! But we keep going~',
    'A bump in the road!',
    'The terminal disagrees...',
  ],

  // ─── Recovery (fail → success) ───────────────────
  recovered: [
    'YES! Fixed it! *celebration dance*',
    'From red to green! Beautiful!',
    'Comeback! *cheers*',
    'You turned it around! Amazing~',
    'Persistence pays off!',
    'That\'s the spirit! Never give up!',
    'NAILED IT this time!',
    'From failure to victory!',
    'The sweetest success!',
    'Redemption arc complete!',
  ],

  // ─── Struggling (3+ failures) ────────────────────
  struggling: [
    'Tough one, huh? You\'ll crack it~',
    'Hang in there! *warm hug*',
    'Every expert was once a debugger~',
    'The bug is scared of you!',
    'Taking a breath might help~',
    'Debugging is just detective work!',
    'You\'re closer than you think!',
    'Even the best hit walls!',
    'I believe in you! Always have~',
    'One step at a time...',
    'The answer is in there somewhere!',
    'Patience... *sends good vibes*',
  ],

  // ─── Milestones ──────────────────────────────────
  first_action: [
    'And we\'re off! Let\'s go!',
    'First move! Here we go~',
    'The journey begins! *excited*',
    'Session kickoff!',
  ],
  many_edits: [
    'So many edits! Productive day!',
    'You\'re on a roll! Unstoppable~',
    'Major refactoring energy!',
    'This session is legendary!',
  ],
  many_actions: [
    'We\'ve done so much together!',
    'What a session! *impressed*',
    'Super productive!',
    'You\'re a coding machine!',
  ],
};

// ─────────────────────────────────────────────────────────────
//  EXISTING MESSAGE POOLS (non-event)
// ─────────────────────────────────────────────────────────────

function getTimeGreeting(): string | null {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'The world is so quiet right now~';
  if (h >= 23 || h < 5) return 'Sleepy... but I\'ll keep you company';
  if (h >= 12 && h < 13) return 'Lunch time vibes~';
  if (h >= 17 && h < 18) return 'Golden hour coding session~';
  return null;
}

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

function getGitMood(git: GitStatus | null, tick: number): string | null {
  if (!git) return null;
  if (!git.isDirty && git.ahead === 0) {
    const m = [
      'Everything\'s tidy~ feels nice',
      'Clean repo, clean mind~',
      'All snug and committed!',
      'A fresh repo. So peaceful',
    ];
    return m[tick % m.length];
  }
  if (git.fileCount > 20) {
    const m = [
      'Wow, you\'ve been busy! So cool~',
      'Look at all these changes!',
      'Big things happening here~',
    ];
    return m[tick % m.length];
  }
  if (git.ahead > 3) {
    const m = [
      'Got some commits saved up~ nice',
      'Building up a nice batch!',
      'Lots of progress stacking up~',
    ];
    return m[tick % m.length];
  }
  if (git.behind > 0) {
    const m = [
      'Ooh there\'s new stuff upstream~',
      'The remote has surprises!',
      'I wonder what\'s new upstream...',
    ];
    return m[tick % m.length];
  }
  if (git.stashCount > 2) return 'A little stash collection~ cute';
  const m = [
    'Work in progress~ looking good!',
    'I can see you\'re working on something',
    'Coming along nicely!',
    'Keep going, you\'re on a roll~',
  ];
  return m[tick % m.length];
}

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
  owl: [
    '*hoo hoo*',
    'Wise owl watches your code~',
    'Night owl coding session!',
    'Whooo writes great code? You do!',
    '*head tilt* ...interesting',
    'Wisdom loading... complete!',
    'The wise owl sees all bugs~',
    'Hoo needs sleep?',
  ],
  octopus: [
    '*wiggles tentacles*',
    'Eight arms, infinite possibilities!',
    'Multi-tasking like a pro~',
    'Ink-redibly good code today!',
    '*squish squish* Comfy~',
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

const FILE_TYPE_MESSAGES: Record<string, string[]> = {
  Tests:      ['Writing tests! So responsible~', 'Testing testing 1 2 3~', 'Test-driven? I respect that!'],
  Docs:       ['Documentation hero!', 'Docs day! Future you says thanks~', 'README vibes~'],
  Styles:     ['Making things pretty~', 'CSS wizardry in progress!', 'Pixel-perfect pursuit~'],
  Config:     ['Tinkering under the hood~', 'Config tweaks... careful~', 'The foundation matters!'],
  Shell:      ['Shell scripting! Powerful~', 'bash bash bash~', 'Automating all the things!'],
  SQL:        ['Database whisperer~', 'Query crafting mode!', 'SELECT * FROM awesome~'],
  TypeScript: ['Type safety feels good~', 'TypeScript gang!', 'Types are love~'],
  Python:     ['Pythonic elegance~', 'import antigravity', 'Beautiful is better than ugly~'],
  Rust:       ['Fearless concurrency!', 'Borrow checker approves~', 'Zero-cost abstractions!'],
  Go:         ['Go go go!', 'Simplicity is sophistication~', 'Goroutines go brrr~'],
};

const WELCOME_MESSAGES: Record<string, string[]> = {
  stranger:     ['Oh! A new friend! Hi!', 'Nice to meet you!', 'First time here? Welcome!'],
  acquaintance: ['Hey, good to see you again!', 'Welcome back~', 'Missed you!'],
  friend:       ['My favorite human is back!', 'Yay, coding together again!', 'I saved your spot~'],
  bestie:       ['BESTIE! You\'re here!', 'Dream team reunites!', 'You + me = unstoppable~'],
};

// ─────────────────────────────────────────────────────────────
//  MAIN MOOD FUNCTION
// ─────────────────────────────────────────────────────────────

export function getMoodMessage(ctx: MoodContext): string {
  const {
    size, animation, animalType, git,
    fiveHourUsage, contextVelocity, cacheHitRate,
    relationshipTier, sessionNumber, moodTick: tick,
    eventContext,
  } = ctx;

  // Use a faster tick for hot events (3s cycle) vs normal (10s)
  const eventTick = Math.floor(Date.now() / 3000);

  // Priority 1: danger state
  if (animation === 'danger') {
    return DANGER_MESSAGES[tick % DANGER_MESSAGES.length];
  }

  // Priority 2: HOT event (< 15s old) — always show
  if (eventContext.freshness === 'hot' && eventContext.category) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 3: high usage
  if (fiveHourUsage !== null && fiveHourUsage >= 80) {
    return USAGE_HIGH_MESSAGES[tick % USAGE_HIGH_MESSAGES.length];
  }

  // Priority 4: WARM event (15-60s) — show most ticks
  if (eventContext.freshness === 'warm' && eventContext.category && tick % 3 !== 2) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 5: busy
  if (animation === 'busy') {
    return BUSY_MESSAGES[tick % BUSY_MESSAGES.length];
  }

  // Priority 6: welcome back (first few ticks)
  if (tick % 60 < 2) {
    const msgs = WELCOME_MESSAGES[relationshipTier];
    const base = msgs[tick % msgs.length];
    return sessionNumber > 1 ? `${base} #${sessionNumber}` : base;
  }

  // Priority 7: COLD event (1-5 min) — show occasionally
  if (eventContext.freshness === 'cold' && eventContext.category && tick % 5 === 0) {
    const pool = EVENT_MESSAGES[eventContext.category];
    if (pool) return pick(pool, eventTick, eventContext.detail);
  }

  // Priority 8: rare easter eggs
  if (tick % 30 === 7) {
    return RARE_EVENTS[tick % RARE_EVENTS.length];
  }

  // Priority 9: context velocity
  if (contextVelocity > 5 && tick % 6 === 1) {
    return VELOCITY_FAST[tick % VELOCITY_FAST.length];
  }
  if (contextVelocity > 0 && contextVelocity <= 1 && tick % 8 === 2) {
    return VELOCITY_SLOW[tick % VELOCITY_SLOW.length];
  }

  // Priority 10: cache hit rate
  if (cacheHitRate !== null && tick % 10 === 4) {
    if (cacheHitRate >= 60) return CACHE_GOOD[tick % CACHE_GOOD.length];
    if (cacheHitRate < 30) return CACHE_BAD[tick % CACHE_BAD.length];
  }

  // Priority 11: time-of-day
  if (tick % 12 === 3) {
    const timeMsg = getTimeGreeting();
    if (timeMsg) return timeMsg;
  }

  // Priority 12: file type awareness (from git)
  if (git?.dominantFileType && tick % 5 === 0) {
    const ftMsgs = FILE_TYPE_MESSAGES[git.dominantFileType];
    if (ftMsgs) return ftMsgs[tick % ftMsgs.length];
  }

  // Priority 13: git mood
  if (tick % 3 === 0) {
    const gitMsg = getGitMood(git, tick);
    if (gitMsg) return gitMsg;
  }

  // Priority 14: size messages
  if ((size === 'tiny' || size === 'thicc') && tick % 4 < 2) {
    return SIZE_MESSAGES[size][tick % SIZE_MESSAGES[size].length];
  }

  // Default: animal idle
  const msgs = IDLE_MESSAGES[animalType];
  return msgs[tick % msgs.length];
}
