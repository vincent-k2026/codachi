import type { AnimalDef } from './types.js';
import { f } from './types.js';

export const penguin: AnimalDef = {
  name: 'Penguin',
  frames: {
    tiny: {
      idle: [
        f([' (o v o)', '/|   |\\ ', ' d   b  ']),
        f([' (o v o)', '\\|   |/ ', ' d   b  ']),
      ],
      busy: [
        f([' (o v o)', '/|   |\\~', ' d   b  ']),
        f([' (o v o)', '~\\|   |/', ' d   b  ']),
      ],
      danger: [
        f([' (O v O)!', '/|   |\\  ', ' d   b   ']),
        f(['!(O v O) ', '/|   |\\  ', ' d   b   ']),
      ],
      sleep: [
        f([' (- v -)  ', '/|   |\\  z', ' d   b    ']),
        f([' (- v -)   ', '/|   |\\  zZ', ' d   b     ']),
      ],
    },
    small: {
      idle: [
        f(['  (o  v  o)  ', ' /|      |\\ ', '  d      b   ']),
        f(['  (o  v  o)  ', ' \\|      |/ ', '  d      b   ']),
      ],
      busy: [
        f(['  (o  v  o)  ', ' /|      |\\~', '  d      b   ']),
        f(['  (o  v  o)  ', '~\\|      |/ ', '  d      b   ']),
      ],
      danger: [
        f(['  (O  v  O) !!', ' /|      |\\  ', '  d      b    ']),
        f(['!!(O  v  O)   ', ' /|      |\\  ', '  d      b    ']),
      ],
      sleep: [
        f(['  (-  v  -)  zZ ', ' /|      |\\    ', '  d      b      ']),
        f(['  (-  v  -) zZzZ', ' /|      |\\    ', '  d      b      ']),
      ],
    },
    medium: {
      idle: [
        f(['   (o   v   o)   ', '  /|         |\\ ', '   d         b   ']),
        f(['   (o   v   o)   ', '  \\|         |/ ', '   d         b   ']),
      ],
      busy: [
        f(['   (o   v   o)   ', '  /|         |\\~', '   d         b   ']),
        f(['   (o   v   o)   ', '~ \\|         |/ ', '   d         b   ']),
      ],
      danger: [
        f(['   (O   v   O) !!', '  /|         |\\  ', '   d         b   ']),
        f(['!! (o   v   o)   ', '  /|         |\\  ', '   d         b   ']),
      ],
      sleep: [
        f(['   (-   v   -)  zZz ', '  /|         |\\    ', '   d         b      ']),
        f(['   (-   v   -) zZzZz', '  /|         |\\    ', '   d         b      ']),
      ],
    },
    chubby: {
      idle: [
        f(['    (o     v     o)     ', '   /|              |\\ ', '    d              b    ']),
        f(['    (o     v     o)     ', '   \\|              |/ ', '    d              b    ']),
      ],
      busy: [
        f(['    (o     v     o)     ', '   /|              |\\~', '    d              b    ']),
        f(['    (o     v     o)     ', '  ~\\|              |/ ', '    d              b    ']),
      ],
      danger: [
        f(['    (O     v     O) !!!!', '   /|              |\\  ', '    d              b    ']),
        f(['!!!!(O     v     O)     ', '   /|              |\\  ', '    d              b    ']),
      ],
      sleep: [
        f(['    (-     v     -)  zZzZz', '   /|              |\\    ', '    d              b      ']),
        f(['    (-     v     -) zZzZzZ', '   /|              |\\    ', '    d              b      ']),
      ],
    },
    thicc: {
      idle: [
        f(['     (o        v        o)       ', '    /|                     |\\   ', '     d                     b     ']),
        f(['     (o        v        o)       ', '    \\|                     |/   ', '     d                     b     ']),
      ],
      busy: [
        f(['     (o        v        o)       ', '    /|                     |\\~  ', '     d                     b     ']),
        f(['     (o        v        o)       ', '   ~\\|                     |/   ', '     d                     b     ']),
      ],
      danger: [
        f(['     (O        v        O) !!!!!', '    /|                     |\\   ', '     d                     b    ']),
        f(['!!!!!(O        v        O)      ', '    /|                     |\\   ', '     d                     b    ']),
      ],
      sleep: [
        f(['     (-        v        -)  zZzZzZ', '    /|                     |\\     ', '     d                     b      ']),
        f(['     (-        v        -) zZzZzZz', '    /|                     |\\     ', '     d                     b      ']),
      ],
    },
  },
};
