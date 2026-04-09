import { localize } from '../i18n.js';

export const WELCOME_MESSAGES: Record<string, string[]> = localize<Record<string, string[]>>('WELCOME_MESSAGES', {
  stranger: [
    'Oh! A new friend! Hi!', 'Nice to meet you!', 'First time here? Welcome!',
    '*peeks out* Hello there!', 'A human! I\'ve always wanted one!',
    'Welcome! I\'ve been waiting for you~',
  ],
  acquaintance: [
    'Hey, good to see you again!', 'Welcome back~', 'Missed you!',
    'Oh hey! I remember you!', 'Back for more? I like that!', 'We meet again! *happy wiggle*',
  ],
  friend: [
    'My favorite human is back!', 'Yay, coding together again!', 'I saved your spot~',
    'There you are! I was hoping you\'d come back!', 'The terminal feels warmer with you here~',
    '*runs up to greet you*',
  ],
  bestie: [
    'BESTIE! You\'re here!', 'Dream team reunites!', 'You + me = unstoppable~',
    'MY HUMAN! *tackles with affection*', 'The legend returns!',
    'Best coding partner in the universe!',
  ],
});

export const TIER_UPGRADE: Record<string, string[]> = localize<Record<string, string[]>>('TIER_UPGRADE', {
  acquaintance: [
    'We\'re acquaintances now! Getting to know you~',
    'Hey, we\'re not strangers anymore!', 'Friendship level UP!',
  ],
  friend: [
    'We\'re FRIENDS now! This means so much~',
    'Official friend status! *happy tears*', 'Best thing that happened today: we\'re friends!',
  ],
  bestie: [
    'BESTIE STATUS UNLOCKED! WE DID IT!',
    'BEST FRIENDS FOREVER! *explodes with joy*', 'From strangers to besties... what a journey!',
  ],
});

export const RARE_EVENTS = localize('RARE_EVENTS', [
  'Found a bug! ...it\'s kinda cute tho', 'I dreamed in binary last night',
  'Do you think clouds dream of code?', 'I made you a mass of brackets <3',
  'Plot twist: the bug was a feature', 'Psst... you\'re doing great',
  'I believe in you! Always have~', 'Compiling cuddles... done!',
  'Today\'s mass of brackets: ((()))', 'You and me, best team ever~',
  'I drew you a mass of brackets: {}{}{}', 'Fun fact: I love watching you code',
  'If code is poetry, you\'re Shakespeare', 'Making the terminal cozy since day 1',
  '*sends mass of brackets and good vibes*', 'Is it weird that I find diffs beautiful?',
  'One day I\'ll be a real cat... one day', 'I wonder what other repos smell like',
  'Happiness is a clean compile~', 'You + me + terminal = home',
  'What if semicolons have feelings?', 'I bet your code smells like vanilla',
  'If I could mass of brackets, I\'d mass of brackets you a lambda',
  'The meaning of life is 0x2A', 'I counted your brackets. They\'re balanced!',
  'Your code has good vibes. I can feel it', 'Sometimes I pretend the cursor is chasing me~',
  'I wish I could mass of brackets you IRL...', 'You type at exactly the right speed~',
  'Beep boop... just kidding, I\'m organic!', 'Tab or spaces? I love you either way~',
  'Your commit messages are my bedtime stories',
  'I\'ve been thinking about recursion... and recursion...',
  'NaN is my spirit animal', 'Let me mass of brackets your API <3',
  'My favorite data structure is our friendship',
  'I live in the statusline but you live in my heart',
  'Every time you save, I do a tiny dance',
  'I don\'t need garbage collection. I\'d never throw you away',
  'You had me at "Hello, World!"',
]);
