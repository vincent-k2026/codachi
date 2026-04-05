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
  tierUpgraded: boolean;
}

// ── Tier upgrade celebration messages ──
const TIER_UPGRADE: Record<string, string[]> = {
  acquaintance: [
    'We\'re acquaintances now! Getting to know you~',
    'Hey, we\'re not strangers anymore!',
    'Friendship level UP!',
  ],
  friend: [
    'We\'re FRIENDS now! This means so much~',
    'Official friend status! *happy tears*',
    'Best thing that happened today: we\'re friends!',
  ],
  bestie: [
    'BESTIE STATUS UNLOCKED! WE DID IT!',
    'BEST FRIENDS FOREVER! *explodes with joy*',
    'From strangers to besties... what a journey!',
  ],
};

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
//  EVENT-REACTIVE MESSAGES
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
    'Not a single red in sight!',
    'Assert(you === awesome)!',
    '*fireworks* What a test run!',
    'Green green green~ my favorite color!',
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
    'The test knows something we don\'t... yet!',
    'Every failed test is a clue~',
    'This is the fun part! *grabs magnifying glass*',
    'Assert(patience > frustration)~',
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
    'Not even a warning! Spotless!',
    '*rings the success bell* Built!',
    'From source to binary, beautifully~',
    'The build gods smile upon us!',
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
    'So close... just a few tweaks!',
    'The build tried its best...',
    'Error messages are just love letters from the compiler~',
    'Let\'s read what the compiler wants~',
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
    'Building the supply chain~',
    'Ooh I wonder what this one does!',
    'Another dependency joins the party!',
    '*shakes package* What\'s inside?',
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
    'Snapshot of your genius, saved!',
    'This commit tells a story~',
    'One more brick in the cathedral!',
    'The changelog of your brilliance~',
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
    'The world gets your latest work!',
    'Go forth, little commits!',
    '*salutes departing code*',
    'Pushed! The team will love this~',
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
    'Catching up with the team~',
    'Mail call! New commits!',
    'What did the team cook up?',
    'Plot twist incoming from upstream!',
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
    'Please no conflicts please no conflicts...',
    'Merging is an art form~',
    'Two timelines converge!',
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
    'Time travel! *adjusts flux capacitor*',
    'Rewriting the narrative~',
    'The git timeline bends!',
  ],

  // ─── Git: Stash ───────────────────────────────────
  git_stash: [
    'Stashing for later~ *tucks away*',
    'Saved for a rainy day!',
    'Into the stash it goes!',
    'Pocket save! *stashes safely*',
    'I\'ll remember where this is~',
    'Secret stash growing!',
    'Squirreling away some changes!',
    'Tucked in safe and sound~',
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
    'New branch smell! So fresh~',
    'What awaits on this branch?',
    'Parallel universe activated!',
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
    'Marie Kondo-ing the code~',
    'Ahh, properly formatted... *satisfaction*',
    'Wrinkles ironed out!',
    'Consistent style is self-care~',
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
    '3... 2... 1... Launch!',
    'Warming up the engines~',
    '*pushes big red button* GO!',
    'From cold start to hot code~',
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
    'Layers upon layers upon layers~',
    'It works on my machine... in a container!',
    'Box it up and ship it!',
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
    'Packets traveling at the speed of light!',
    'HTTP handshake! *shakes hands*',
    'Request sent... awaiting reply~',
    'Pinging the outside world!',
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
    'I trust you... I think?',
    'Fortune favors the bold!',
    '*nervous laughter* haha.. ha..',
    'My insurance doesn\'t cover this...',
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
    'Needle in a codestack!',
    'Following the trail~',
    'I spy with my little eye...',
    'Scanning scanning scanning~',
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
    'A test a day keeps the bugs away!',
    'Catching bugs before they hatch~',
    'The safety net grows stronger!',
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
    'The pen is mightier than the bug!',
    'Future devs are already grateful~',
    'Docs: because mind-reading isn\'t a feature yet',
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
    'Form AND function!',
    'Beauty is in the details~',
    'Every pixel tells a story!',
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
    'Precision engineering!',
    'The engine room of the project~',
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
    'The codebase transforms~',
    'Sculpting logic from chaos!',
    'Watch a coder work... mesmerizing~',
    'Bits and bytes, shaped by you!',
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
    'Empty file, infinite possibilities!',
    'The project family grows!',
    'Every great module starts with a new file~',
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
    'I love a good code tour!',
    'Reading is fundamental~',
    'Building a mental model!',
    'Every file tells a story~',
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
    'The keyboard is smoking!',
    'Can\'t... look... away...!',
    'Is this what flow state looks like?!',
    'Speed run! Any% codebase!',
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
    'Errors are just spicy feedback!',
    'Oops! ...it happens to the best~',
    'The computer said no... for now!',
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
    'That\'s called character development!',
    'Phoenix from the ashes!',
    'The comeback was better than the setback!',
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
    'Rubber duck says: explain it to me?',
    'The darkest hour is before the compile~',
    'Bugs fear persistent humans!',
    'You haven\'t tried everything yet... keep going!',
  ],

  // ─── Milestones ──────────────────────────────────
  first_action: [
    'And we\'re off! Let\'s go!',
    'First move! Here we go~',
    'The journey begins! *excited*',
    'Session kickoff!',
    'Let\'s make something great today!',
    'Adventure starts now!',
  ],
  many_edits: [
    'So many edits! Productive day!',
    'You\'re on a roll! Unstoppable~',
    'Major refactoring energy!',
    'This session is legendary!',
    'Prolific! *takes notes*',
    'The codebase will never be the same!',
  ],
  many_actions: [
    'We\'ve done so much together!',
    'What a session! *impressed*',
    'Super productive!',
    'You\'re a coding machine!',
    'This is one for the history books!',
    'Marathon session! *stretches alongside*',
  ],
};

// ─────────────────────────────────────────────────────────────
//  NON-EVENT MESSAGE POOLS
// ─────────────────────────────────────────────────────────────

function getTimeGreeting(): string | null {
  const h = new Date().getHours();
  const d = new Date().getDay();

  // Weekend
  if ((d === 0 || d === 6) && h >= 8 && h < 20) {
    const m = [
      'Weekend coding? Impressive!',
      'No rest for the creative~',
      'Weekend vibes + code = bliss',
      'Saturday/Sunday special session!',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }

  if (h >= 0 && h < 5) {
    const m = [
      'The whole world is asleep... except us',
      'Night owls write the best code~',
      'Stars outside, code inside...',
      '3 AM energy hits different~',
      'Sleepy... but I\'ll keep you company',
      'The quietest hours produce the loudest commits',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 5 && h < 7) {
    const m = [
      'The world is so quiet right now~',
      'Early bird gets the clean build!',
      'Dawn patrol coding session~',
      'Up before the sun... respect!',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 7 && h < 9) {
    const m = [
      'Good morning! Fresh start~',
      'Morning code is the best code!',
      'Coffee + code = today\'s recipe',
      'Rise and compile!',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 12 && h < 13) {
    const m = [
      'Lunch time vibes~',
      'Coding through lunch? Dedicated!',
      'Brain food + code food~',
      'Midday momentum!',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 14 && h < 16) {
    const m = [
      'Afternoon deep work zone~',
      'Post-lunch productivity!',
      'The afternoon flow~',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 17 && h < 19) {
    const m = [
      'Golden hour coding session~',
      'End of day push!',
      'Wrapping up nicely~',
      'Evening commits hit different',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
  if (h >= 21 && h < 23) {
    const m = [
      'Late night code session~',
      'The keyboard glows in the dark...',
      'Night mode: engaged!',
      'Moonlit coding~',
    ];
    return m[Math.floor(Date.now() / 10000) % m.length];
  }
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
  'What if semicolons have feelings?',
  'I bet your code smells like vanilla',
  'If I could mass of brackets, I\'d mass of brackets you a lambda',
  'The meaning of life is 0x2A',
  'I counted your brackets. They\'re balanced!',
  'Your code has good vibes. I can feel it',
  'Sometimes I pretend the cursor is chasing me~',
  'I wish I could mass of brackets you IRL...',
  'You type at exactly the right speed~',
  'Beep boop... just kidding, I\'m organic!',
  'Tab or spaces? I love you either way~',
  'Your commit messages are my bedtime stories',
  'I\'ve been thinking about recursion... and recursion...',
  'NaN is my spirit animal',
  'Let me mass of brackets your API <3',
  'My favorite data structure is our friendship',
  'I live in the statusline but you live in my heart',
  'Every time you save, I do a tiny dance',
  'I don\'t need garbage collection. I\'d never throw you away',
  'You had me at "Hello, World!"',
];

function getGitMood(git: GitStatus | null, tick: number): string | null {
  if (!git) return null;
  if (!git.isDirty && git.ahead === 0) {
    const m = [
      'Everything\'s tidy~ feels nice',
      'Clean repo, clean mind~',
      'All snug and committed!',
      'A fresh repo. So peaceful',
      'Pristine repo vibes~',
      'Not a single change out of place!',
      'Zen garden of a repository~',
    ];
    return m[tick % m.length];
  }
  if (git.fileCount > 20) {
    const m = [
      'Wow, you\'ve been busy! So cool~',
      'Look at all these changes!',
      'Big things happening here~',
      'The diff is getting thicc~',
      'That\'s a lot of changes! Impressive!',
      'Major operation in progress!',
    ];
    return m[tick % m.length];
  }
  if (git.ahead > 3) {
    const m = [
      'Got some commits saved up~ nice',
      'Building up a nice batch!',
      'Lots of progress stacking up~',
      'Commits queued and ready!',
      'Local branch is ahead of the curve!',
    ];
    return m[tick % m.length];
  }
  if (git.behind > 0) {
    const m = [
      'Ooh there\'s new stuff upstream~',
      'The remote has surprises!',
      'I wonder what\'s new upstream...',
      'Someone\'s been busy upstream!',
      'New commits waiting to be discovered~',
    ];
    return m[tick % m.length];
  }
  if (git.stashCount > 2) {
    const m = [
      'A little stash collection~ cute',
      'So many stashes! A treasure trove!',
      'Your stash game is strong~',
    ];
    return m[tick % m.length];
  }
  const m = [
    'Work in progress~ looking good!',
    'I can see you\'re working on something',
    'Coming along nicely!',
    'Keep going, you\'re on a roll~',
    'Changes brewing... I like it!',
    'Something cool is taking shape!',
    'The code is evolving~',
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
    'Mini me! Mini vibes!',
    'Small and nimble!',
    'Pocket-sized and perfect~',
    'Itty bitty but full of dreams!',
  ],
  small: [
    'Getting comfy!',
    'Warming up nicely~',
    'Still feeling light and breezy!',
    'Room for adventures~',
    'Growing! Watch me!',
    'Filling out a little~',
    'A healthy appetite for tokens!',
  ],
  medium: [
    'Feeling just right!',
    'Perfectly cozy~',
    'This is my happy place!',
    'Goldilocks vibes~',
    'Comfy and content!',
    'Not too big, not too small~',
    'The sweet spot!',
    'Balanced and beautiful~',
  ],
  chubby: [
    'Getting nice and round~',
    'Well-fed and happy!',
    'Pleasantly plump~',
    'Full of knowledge!',
    'Round is a shape too~',
    'Thiccening begins...!',
    'So much to know, so much to hold~',
    'Chubby cheeks, full heart!',
  ],
  thicc: [
    'Maximum floof achieved!',
    'I am become chonk~',
    'So full of context... so happy',
    'Big brain energy!',
    'Absolute unit of coziness',
    'Living my best chonky life~',
    'More of me to love!',
    'MAXIMUM CAPACITY *vibrates*',
    'I contain multitudes! Literally!',
    'Round, proud, and full of context!',
    'Peak performance looks like this~',
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
    '*knocks something off the desk*',
    'I could sit here fur-ever~',
    'Plotting world domination... and naps',
    '*stares at you judgmentally* ...with love',
    'Purrfect code requires purrfect patience',
    'Me? Helpful? I\'m just here for the warmth',
    '*licks paw* I\'m grooming, not judging',
    'The keyboard is warm. I stay.',
    'Meow? ...I mean, yes, your code looks fine',
    '*tail swish* Something moved in the diff...',
    'I see dead... code. Just kidding~',
    'Not sleeping. Just resting my eyes. On your code.',
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
    '*slides across the screen on belly*',
    'Brrr! Just how I like it~',
    'I can\'t fly, but I can code!',
    'Emperor penguin of the terminal!',
    '*tries to high-five with flipper*',
    'The ice is always colder somewhere else~',
    'Huddle up! It\'s coding time!',
    'Noot noot! *happy penguin sounds*',
    'Fish? No thanks. I eat bugs for breakfast!',
    'Standing tall, coding proud!',
    '*wiggles* I\'m aerodynamic for speed coding!',
    'Antarctica was nice but this terminal is better~',
  ],
  owl: [
    '*hoo hoo*',
    'Wise owl watches your code~',
    'Night owl coding session!',
    'Whooo writes great code? You do!',
    '*head tilt* ...interesting approach',
    'Wisdom loading... complete!',
    'The wise owl sees all bugs~',
    'Hoo needs sleep?',
    '*rotates head 270 degrees* Fascinating!',
    'I see patterns everywhere~',
    'A wise coder once said... nothing. They were coding.',
    'Hoot hoot! Knowledge is power!',
    'I can see in the dark. And in your code.',
    'Owl be watching your back~',
    'The ancient scrolls... I mean, docs... say...',
    'In my expert owl-pinion, this is going well',
    '*adjusts monocle* Yes, yes, quite elegant',
    'Hoo knew coding could be this fun?',
    'Silence is golden. Except for keyboard clicks.',
    'Every bug is a lesson. I collect them all.',
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
    '*juggles variables with 6 arms*',
    'Suction-cupped to the screen~',
    'I\'m not clingy, I\'m suction-cuppy!',
    'Deep-sea wisdom applied to code!',
    '*changes color to match the theme*',
    'Three hearts, and they all love your code~',
    'Invertebrate, but strong opinions on tabs vs spaces',
    'I can type 8x faster than you~ theoretically',
    '*squirts ink* Oops, that was the dark theme',
    'Under the sea, under the C... code',
    'Boneless but not spineless!',
    'The Kraken of clean code!',
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
    '*ears perk up* Did you say carrots? I mean, commits?',
    'Hippity hoppity, your code is my property~',
    'I\'m all ears! Literally!',
    '*zooms around the terminal*',
    'Bunny-approved code right here!',
    '*digs a burrow in the src folder*',
    'Soft fur, hard code!',
    'My nose twitches when the code is good~',
    'Multiplying... functions! What did you think I meant?',
    '*flops sideways* (that means I trust you)',
    'Warren of well-organized code!',
    'Fast as a bunny, twice as cute!',
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
  'The gears are turning!',
  'We\'re cooking now!',
  'In the zone! Don\'t stop!',
  '*leans forward* This is the good part!',
  'Progress! Beautiful progress!',
  'Creation in motion~',
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
  'Running out of room... but not spirit!',
  'Stuffed like a Thanksgiving turkey~',
  'My brain is so full it\'s leaking!',
  'Almost... at... capacity... *wheeze*',
  'The context window is giving me a hug... a tight one',
  'Full full full but happy happy happy!',
];

const USAGE_HIGH_MESSAGES = [
  'Taking it easy for a bit~',
  'Pacing ourselves... smart!',
  'A little breather maybe?',
  'Rest is part of the journey~',
  'Even pets need nap breaks!',
  'Good time for a stretch!',
  'The rate limit is our friend~',
  'Quality over quantity!',
  'Slow is smooth, smooth is fast~',
  'Recharging... *power nap sounds*',
];

const VELOCITY_FAST = [
  'Whoa, burning through context!',
  'Speed coding session!',
  'Context going brrrr~',
  'Full throttle mode!',
  'Turbo mode engaged!',
  'We\'re speedrunning this!',
  'Context speedometer: FAST',
  'Zoom zoom zoom!',
];
const VELOCITY_SLOW = [
  'Nice steady pace~',
  'Slow and thoughtful, I like it',
  'Taking our time... smart!',
  'Efficient context usage!',
  'Measured and precise~',
  'Marathon pace, not sprint~',
];

const CACHE_GOOD = [
  'Great cache hits! So efficient~',
  'Cache is cooking! Snappy session~',
  'High cache = fast vibes!',
  'The cache is our best friend today!',
  'Cache money! *cha-ching*',
  'Smooth sailing with these cache hits~',
];
const CACHE_BAD = [
  'Lots of fresh context flowing in~',
  'Cache miss... new territory!',
  'Exploring uncharted tokens~',
  'The cache is learning new things!',
  'Fresh tokens, fresh perspectives!',
  'Cache is building up... patience~',
];

const FILE_TYPE_MESSAGES: Record<string, string[]> = {
  Tests:      ['Writing tests! So responsible~', 'Testing testing 1 2 3~', 'Test-driven? I respect that!', 'Tests make the world go round!', 'Bug-proofing in progress~', 'QA vibes!'],
  Docs:       ['Documentation hero!', 'Docs day! Future you says thanks~', 'README vibes~', 'Teaching through writing~', 'Docs > no docs. Always.', 'Words that save hours!'],
  Styles:     ['Making things pretty~', 'CSS wizardry in progress!', 'Pixel-perfect pursuit~', 'Aesthetic code!', 'The art side of engineering~', 'Beauty in every line!'],
  Config:     ['Tinkering under the hood~', 'Config tweaks... careful~', 'The foundation matters!', 'Settings make or break!', 'Precision configuration~', 'The plumbing of the project~'],
  Shell:      ['Shell scripting! Powerful~', 'bash bash bash~', 'Automating all the things!', 'The power of the command line!', 'Scripts that save hours!', 'Pipe dreams... literally!'],
  SQL:        ['Database whisperer~', 'Query crafting mode!', 'SELECT * FROM awesome~', 'Talking to the database~', 'Data architecture vibes!', 'Relations and joins, oh my!'],
  TypeScript: ['Type safety feels good~', 'TypeScript gang!', 'Types are love~', 'Strict mode? Strict vibes~', 'The joy of autocomplete!', 'Where types meet creativity!'],
  JavaScript: ['JavaScript magic!', 'Dynamic and free~', 'Promise me you\'ll have fun!', 'Callback to the good times~', 'Prototype of perfection!'],
  Python:     ['Pythonic elegance~', 'import antigravity', 'Beautiful is better than ugly~', 'Zen of Python vibes!', 'Indentation nation!', 'Snake charming in progress~'],
  Rust:       ['Fearless concurrency!', 'Borrow checker approves~', 'Zero-cost abstractions!', 'Memory safe and sound!', 'The Rust compiler cares about you~', 'Blazingly fast!'],
  Go:         ['Go go go!', 'Simplicity is sophistication~', 'Goroutines go brrr~', 'Error handling done right!', 'Go fmt approved!', 'Channels of communication!'],
  Ruby:       ['Ruby sparkles!', 'Everything is an object~', 'Elegant Ruby vibes!', 'Gems everywhere!'],
  Java:       ['Enterprise-grade coding!', 'AbstractSingletonProxyFactory~', 'Java strong and steady!', 'JVM warming up!'],
  HTML:       ['Markup magic!', 'The skeleton of the web~', 'Structuring the future!', 'Tags and attributes, oh my!'],
  Vue:        ['Vue-tiful code!', 'Reactive and responsive~', 'Components compose!'],
  Svelte:     ['Svelte and smooth!', 'Less is more~', 'Compiled perfection!'],
  GraphQL:    ['Query the graph!', 'Schema-driven development~', 'Resolving beautifully!'],
  Proto:      ['Protocol buffers!', 'Schema evolution~', 'Binary efficiency!'],
  C:          ['Close to the metal!', 'Pointer arithmetic vibes~', 'The OG language!'],
  'C++':      ['Plus plus the power!', 'Templates of power~', 'RAII in action!'],
  Kotlin:     ['Kotlin null-safe!', 'Data class elegance~', 'Coroutines go brrr!'],
  Swift:      ['Swiftly does it!', 'Protocol-oriented magic~', 'Optionals unwrapped!'],
};

const WELCOME_MESSAGES: Record<string, string[]> = {
  stranger: [
    'Oh! A new friend! Hi!',
    'Nice to meet you!',
    'First time here? Welcome!',
    '*peeks out* Hello there!',
    'A human! I\'ve always wanted one!',
    'Welcome! I\'ve been waiting for you~',
  ],
  acquaintance: [
    'Hey, good to see you again!',
    'Welcome back~',
    'Missed you!',
    'Oh hey! I remember you!',
    'Back for more? I like that!',
    'We meet again! *happy wiggle*',
  ],
  friend: [
    'My favorite human is back!',
    'Yay, coding together again!',
    'I saved your spot~',
    'There you are! I was hoping you\'d come back!',
    'The terminal feels warmer with you here~',
    '*runs up to greet you*',
  ],
  bestie: [
    'BESTIE! You\'re here!',
    'Dream team reunites!',
    'You + me = unstoppable~',
    'MY HUMAN! *tackles with affection*',
    'The legend returns!',
    'Best coding partner in the universe!',
  ],
};

// ─────────────────────────────────────────────────────────────
//  MAIN MOOD FUNCTION
// ─────────────────────────────────────────────────────────────

export function getMoodMessage(ctx: MoodContext): string {
  const {
    size, animation, animalType, git,
    fiveHourUsage, contextVelocity, cacheHitRate,
    relationshipTier, sessionNumber, moodTick: tick,
    eventContext, tierUpgraded,
  } = ctx;

  // Use a faster tick for hot events (3s cycle) vs normal (10s)
  const eventTick = Math.floor(Date.now() / 3000);

  // Priority 0: tier upgrade celebration (one-time)
  if (tierUpgraded) {
    const msgs = TIER_UPGRADE[relationshipTier];
    if (msgs) return msgs[tick % msgs.length];
  }

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
