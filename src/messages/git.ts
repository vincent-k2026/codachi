import type { GitStatus } from '../types.js';

export function getGitMood(git: GitStatus | null, tick: number): string | null {
  if (!git) return null;
  if (!git.isDirty && git.ahead === 0) {
    const m = [
      'Everything\'s tidy~ feels nice', 'Clean repo, clean mind~', 'All snug and committed!',
      'A fresh repo. So peaceful', 'Pristine repo vibes~', 'Not a single change out of place!',
      'Zen garden of a repository~',
    ];
    return m[tick % m.length];
  }
  if (git.fileCount > 20) {
    const m = [
      'Wow, you\'ve been busy! So cool~', 'Look at all these changes!',
      'Big things happening here~', 'The diff is getting thicc~',
      'That\'s a lot of changes! Impressive!', 'Major operation in progress!',
    ];
    return m[tick % m.length];
  }
  if (git.ahead > 3) {
    const m = [
      'Got some commits saved up~ nice', 'Building up a nice batch!',
      'Lots of progress stacking up~', 'Commits queued and ready!',
      'Local branch is ahead of the curve!',
    ];
    return m[tick % m.length];
  }
  if (git.behind > 0) {
    const m = [
      'Ooh there\'s new stuff upstream~', 'The remote has surprises!',
      'I wonder what\'s new upstream...', 'Someone\'s been busy upstream!',
      'New commits waiting to be discovered~',
    ];
    return m[tick % m.length];
  }
  if (git.stashCount > 2) {
    const m = [
      'A little stash collection~ cute', 'So many stashes! A treasure trove!',
      'Your stash game is strong~',
    ];
    return m[tick % m.length];
  }
  const m = [
    'Work in progress~ looking good!', 'I can see you\'re working on something',
    'Coming along nicely!', 'Keep going, you\'re on a roll~',
    'Changes brewing... I like it!', 'Something cool is taking shape!', 'The code is evolving~',
  ];
  return m[tick % m.length];
}

export const FILE_TYPE_MESSAGES: Record<string, string[]> = {
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
