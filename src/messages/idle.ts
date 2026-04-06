import type { AnimalType, BodySize } from '../types.js';

export const IDLE_MESSAGES: Record<AnimalType, string[]> = {
  cat: [
    'Purring softly...', 'Watching the cursor dance~', 'Kneading the terminal...',
    '*slow blink* ...I love you', 'If I fits, I sits~', 'Contemplating naps and code...',
    '*stretches luxuriously*', 'Your code smells nice today~', '*knocks something off the desk*',
    'I could sit here fur-ever~', 'Plotting world domination... and naps',
    '*stares at you judgmentally* ...with love', 'Purrfect code requires purrfect patience',
    'Me? Helpful? I\'m just here for the warmth', '*licks paw* I\'m grooming, not judging',
    'The keyboard is warm. I stay.', 'Meow? ...I mean, yes, your code looks fine',
    '*tail swish* Something moved in the diff...', 'I see dead... code. Just kidding~',
    'Not sleeping. Just resting my eyes. On your code.',
  ],
  penguin: [
    '*happy waddle*', 'Sliding through the codebase!', 'Flap flap! I\'m helping!',
    'This terminal is nice and cool~', 'Tux approved!', 'Waddle waddle waddle~',
    'I like it here with you!', 'Chillin\' and codin\'~', '*slides across the screen on belly*',
    'Brrr! Just how I like it~', 'I can\'t fly, but I can code!', 'Emperor penguin of the terminal!',
    '*tries to high-five with flipper*', 'The ice is always colder somewhere else~',
    'Huddle up! It\'s coding time!', 'Noot noot! *happy penguin sounds*',
    'Fish? No thanks. I eat bugs for breakfast!', 'Standing tall, coding proud!',
    '*wiggles* I\'m aerodynamic for speed coding!', 'Antarctica was nice but this terminal is better~',
  ],
  owl: [
    '*hoo hoo*', 'Wise owl watches your code~', 'Night owl coding session!',
    'Whooo writes great code? You do!', '*head tilt* ...interesting approach',
    'Wisdom loading... complete!', 'The wise owl sees all bugs~', 'Hoo needs sleep?',
    '*rotates head 270 degrees* Fascinating!', 'I see patterns everywhere~',
    'A wise coder once said... nothing. They were coding.', 'Hoot hoot! Knowledge is power!',
    'I can see in the dark. And in your code.', 'Owl be watching your back~',
    'The ancient scrolls... I mean, docs... say...', 'In my expert owl-pinion, this is going well',
    '*adjusts monocle* Yes, yes, quite elegant', 'Hoo knew coding could be this fun?',
    'Silence is golden. Except for keyboard clicks.', 'Every bug is a lesson. I collect them all.',
  ],
  octopus: [
    '*wiggles tentacles*', 'Eight arms, infinite possibilities!', 'Multi-tasking like a pro~',
    'Ink-redibly good code today!', '*squish squish* Comfy~', 'Tentacles on the keyboard!',
    'Ocean-deep concentration...', 'I can hold 8 files at once!',
    '*juggles variables with 6 arms*', 'Suction-cupped to the screen~',
    'I\'m not clingy, I\'m suction-cuppy!', 'Deep-sea wisdom applied to code!',
    '*changes color to match the theme*', 'Three hearts, and they all love your code~',
    'Invertebrate, but strong opinions on tabs vs spaces',
    'I can type 8x faster than you~ theoretically',
    '*squirts ink* Oops, that was the dark theme', 'Under the sea, under the C... code',
    'Boneless but not spineless!', 'The Kraken of clean code!',
  ],
  bunny: [
    '*nose twitch twitch*', 'Nibbling on some syntax~', 'Ears up! Something interesting...',
    'Hop hop hop through the code!', '*thump thump* (that means happy)',
    'Binkying through the functions!', 'Found a cozy spot in your code~',
    'Everything is so interesting!', '*ears perk up* Did you say carrots? I mean, commits?',
    'Hippity hoppity, your code is my property~', 'I\'m all ears! Literally!',
    '*zooms around the terminal*', 'Bunny-approved code right here!',
    '*digs a burrow in the src folder*', 'Soft fur, hard code!',
    'My nose twitches when the code is good~',
    'Multiplying... functions! What did you think I meant?',
    '*flops sideways* (that means I trust you)', 'Warren of well-organized code!',
    'Fast as a bunny, twice as cute!',
  ],
};

export const SIZE_MESSAGES: Record<BodySize, string[]> = {
  tiny: [
    'Smol but mighty!', 'Just a little bean~', 'Fresh start energy!', 'So much room to grow~',
    '*tiny happy noises*', 'Mini me! Mini vibes!', 'Small and nimble!',
    'Pocket-sized and perfect~', 'Itty bitty but full of dreams!',
  ],
  small: [
    'Getting comfy!', 'Warming up nicely~', 'Still feeling light and breezy!',
    'Room for adventures~', 'Growing! Watch me!', 'Filling out a little~', 'A healthy appetite for tokens!',
  ],
  medium: [
    'Feeling just right!', 'Perfectly cozy~', 'This is my happy place!', 'Goldilocks vibes~',
    'Comfy and content!', 'Not too big, not too small~', 'The sweet spot!', 'Balanced and beautiful~',
  ],
  chubby: [
    'Getting nice and round~', 'Well-fed and happy!', 'Pleasantly plump~', 'Full of knowledge!',
    'Round is a shape too~', 'Thiccening begins...!', 'So much to know, so much to hold~',
    'Chubby cheeks, full heart!',
  ],
  thicc: [
    'Maximum floof achieved!', 'I am become chonk~', 'So full of context... so happy',
    'Big brain energy!', 'Absolute unit of coziness', 'Living my best chonky life~',
    'More of me to love!', 'MAXIMUM CAPACITY *vibrates*', 'I contain multitudes! Literally!',
    'Round, proud, and full of context!', 'Peak performance looks like this~',
  ],
};
