# codachi

A tamagotchi-style virtual pet that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.

Your pet grows fatter as your context window fills up, reacts to your git activity, shows you useful dev info at a glance, and keeps you company while you code.

```
   /\_/\        [Opus 4.6] ██████░░░░ 55% │ 5h ██░░░░ 32% ~2h │ 7d ██░░░ 25%
 =( o ω o )=~   git:(main*) ~12 ?3 │ +489 -84 lines │ last: fix auth bug
  =/> ^ ^ <\=   Cat Purring softly... │ myapp [Node] │ 2026-04-02 17:22 │ up 45m
```

## Features

### Your Pet Grows With Context

The pet's body size scales with your context window usage — from tiny to thicc.

```
 /\_/\         =( o ω o )=         ==( o  ω  o )==        ===( o    ω    o )===
( oωo )         =/> ^ ^ <\=         ==/> ^^ ^^ <\==        ===/> ^^^ ^^^ <\===
 > ^ <          tiny → small →      medium → chubby →      thicc
  ~20%             ~40%                 ~60%                    ~90%
```

### 6 Animals, 10 Color Palettes

Your username hash determines your pet and color scheme — every developer gets a unique companion.

| Animal | Preview |
|--------|---------|
| Cat | `=( o ω o )=~` |
| Dog | `( oᴥo ) ~/▽\` |
| Rabbit | `( o.o ) o(")(")` |
| Panda | `( o.o ) d   b` |
| Penguin | `(o  v  o) /\|  \|\\` |
| Fox | `( oᴥo ) \\_Y_/~` |

Color palettes: Coral Flame, Electric Blue, Neon Mint, Purple Haze, Hot Pink, Golden Sun, Ice Violet, Cherry Blossom, Cyan Surge, Tangerine.

### 4 Animation States

- **Idle** — blinks, wags tail, shifts around
- **Busy** — excited movement while Claude is working
- **Danger** — panics when context > 85%
- **Sleep** — dozes off when context < 10%

Animations are time-based (wall clock), so your pet is always in a different pose each time the statusline refreshes.

### 3-Line Info Display

Everything a developer needs, at a glance:

```
Line 1 │ [Model] Context ██████░░░░ 55% │ 5h ██░░░░ 32% ~2h │ 7d ██░░░ 25%
Line 2 │ git:(branch*) ~12 +3 -1 ?2 │ +489 -84 lines │ ↑2 │ last: fix bug │ stash:3
Line 3 │ Cat *slow blink* ...I love you │ myapp [Node] │ 2026-04-02 17:22 │ up 45m
```

| Line | Content |
|------|---------|
| **Claude** | Model name, context bar + %, 5-hour usage + reset timer, 7-day usage + reset timer |
| **Git** | Branch, file changes (~modified +added -deleted ?untracked), line-level +/- , ahead/behind (↑↓), last commit message, stash count |
| **Pet** | Pet name + mood message, project name + detected language, date/time, session uptime |

### 100+ Mood Messages

Your pet reacts to what's happening:

- **Git activity** — "Work in progress~ looking good!", "Everything's tidy~ feels nice"
- **Context size** — "Maximum floof achieved!", "Smol but mighty!"
- **Time of day** — "Burning the midnight oil...", "Golden hour coding session~"
- **Easter eggs** — "Found a bug! ...it's kinda cute tho", "sudo make me a sandwich"
- **Per-animal personality** — Cat: "*slow blink* ...I love you", Dog: "You're my favorite human!"

### Language Detection

Automatically detects your project's language/framework from config files:

Rust, Go, Python, Node, Deno, Ruby, Java, Kotlin, Elixir, Dart, Swift, C/C++, Nix, Docker, Terraform, and more.

## Installation

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js 18+

### Setup

```bash
# Clone and build
git clone https://github.com/vincent-k2026/codachi.git
cd codachi
npm install
npm run build

# Configure Claude Code statusline
# Add to ~/.claude/settings.json:
```

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/codachi/dist/index.js"
  }
}
```

Then restart Claude Code. Your pet will appear below the input box.

## How It Works

Claude Code invokes the statusline command during active rendering (streaming responses, tool execution, user input). The command receives session data via stdin (JSON) and outputs ANSI-colored text to stdout.

```
Claude Code (stdin: JSON) → codachi → (stdout: ANSI text) → statusline area
```

The pet's animation is driven by wall-clock time, so each refresh shows the correct frame regardless of how long between invocations.

## Project Structure

```
src/
├── index.ts              # Entry point: stdin → state → render
├── stdin.ts              # Parse Claude Code JSON input
├── git.ts                # Git branch, changes, ahead/behind, stash
├── state.ts              # Time-based animation ticks, session uptime
├── identity.ts           # Username hash → animal type + color palette
├── mood.ts               # Context-aware mood message system
├── project.ts            # Language/framework detection
├── width.ts              # Terminal character width calculation
├── types.ts              # TypeScript interfaces
├── animals/
│   ├── index.ts          # Animal registry, body size, animation state
│   ├── types.ts          # Frame builder with proper width calc
│   ├── cat.ts            # Cat frames (5 sizes × 4 animations × 4 frames)
│   ├── dog.ts
│   ├── rabbit.ts
│   ├── panda.ts
│   ├── penguin.ts
│   └── fox.ts
└── render/
    ├── index.ts          # 3-line compositor, ANSI colorizer
    └── colors.ts         # Truecolor RGB, progress bars, HSL
```

## License

ISC
