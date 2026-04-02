# codachi

A tamagotchi-style virtual pet that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.

Your pet grows fatter as your context window fills up, reacts to your git activity, shows you useful dev info at a glance, and keeps you company while you code.

```
    /\_/\         [Opus 4.6] ██████░░░░ 55% │ 5h ██░░░░ 32% ~2h │ 7d █░░░░ 25%
=(  o ω o )=~     git:(main*) ~12 ?3 │ +489 -84 lines │ last: fix auth bug
 (/> ^ ^ <\)      Cat Purring softly... │ myapp [Node] │ 2026-04-02 17:22 │ up 45m
```

## Features

### Your Pet Grows With Context

The pet's body size scales with your context window usage — from tiny to absolute unit.

```
  ~20%           ~40%              ~60%                ~80%                    ~95%

 /\_/\         /\_/\            /\_/\              /\_____/\             /\_________/\
( oωo )      ( oωo )~       =(  o ω o )=~    ==(  o  ω  o  )==~   ===(  o    ω    o  )===~
(> ^ <)~     (/> ^<\)        (/> ^ ^ <\)       (/> ^^ ^^ <\)        (/> ^^^ ^^^ <\)
  tiny          small            medium              chubby                  thicc
```

### 6 Animals, 10 Color Palettes

Your username hash determines your pet and color scheme — every developer gets a unique companion.

| Animal | Preview |
|--------|---------|
| Cat | `=(  o ω o )=~` |
| Dog | `(  o ᴥ o  )  ~\__w w__/` |
| Rabbit | `(  o . o  )  o__(").__(")` |
| Panda | `(  o  .  o )  d        b` |
| Penguin | `(o   v   o)  /\|       \|\\` |
| Fox | `(   o ᴥ o   )  \\__\\_Y__/~` |

10 curated color palettes: Coral Flame, Electric Blue, Neon Mint, Purple Haze, Hot Pink, Golden Sun, Ice Violet, Cherry Blossom, Cyan Surge, Tangerine.

### 4 Animation States

| State | Trigger | Behavior |
|-------|---------|----------|
| **Idle** | Normal | Blinks, wags tail, shifts around |
| **Busy** | Claude is working | Excited movement |
| **Danger** | Context > 85% | Panics with `!!!` |
| **Sleep** | Context < 10% | Dozes off with `zZz` |

Animations are driven by wall-clock time, so your pet is always in a different pose each time the statusline refreshes.

### 3-Line Info Display

Everything a developer needs, at a glance:

| Line | Content |
|------|---------|
| **Claude** | Model name, context bar + %, 5h usage + reset countdown, 7d usage + reset countdown |
| **Git** | Branch, file changes (`~mod +add -del ?new`), line-level `+ins -del`, ahead/behind (`↑↓`), last commit, stash count |
| **Pet** | Pet name, mood message, project name, detected language, datetime, session uptime |

### 100+ Mood Messages

Your pet reacts to what's happening:

| Trigger | Examples |
|---------|----------|
| Git changes | "Work in progress~ looking good!", "Keep going, you're on a roll~" |
| Clean repo | "Everything's tidy~ feels nice", "Ahh... a fresh repo. So peaceful" |
| Context size | "Maximum floof achieved!", "Smol but mighty!" |
| Time of day | "Burning the midnight oil...", "Golden hour coding session~" |
| Easter eggs | "Found a bug! ...it's kinda cute tho", "Compiling cuddles... done!" |
| Per-animal | Cat: "\*slow blink\* ...I love you" / Dog: "You're my favorite human!" |

### Language Detection

Automatically detects your project's language from config files:

Rust, Go, Python, Node, Deno, Ruby, Java, Kotlin, Elixir, Dart, Swift, C/C++, Nix, Docker, Terraform, and more.

## Installation

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js 18+

### Setup

```bash
git clone https://github.com/vincent-k2026/codachi.git
cd codachi
npm install
npm run build
```

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/codachi/dist/index.js"
  }
}
```

Restart Claude Code. Your pet will appear below the input box.

## How It Works

```
Claude Code ──stdin:JSON──▶ codachi ──stdout:ANSI──▶ statusline
```

Claude Code invokes the statusline command during active rendering (streaming responses, tool execution). The command receives session data (model, context, rate limits, cwd) via stdin as JSON, and outputs 3 lines of ANSI-colored text to stdout.

The pet's animation is driven by `Date.now()`, so each invocation shows the correct frame regardless of time gaps between refreshes.

## Project Structure

```
src/
├── index.ts            # Entry: stdin → compute → render
├── stdin.ts            # Parse Claude Code JSON input
├── git.ts              # Branch, diff stats, ahead/behind, stash
├── state.ts            # Wall-clock animation ticks, session uptime
├── identity.ts         # Username hash → animal + color palette
├── mood.ts             # 100+ context-aware mood messages
├── project.ts          # Language/framework detection
├── width.ts            # East Asian Width character handling
├── types.ts            # TypeScript interfaces
├── animals/
│   ├── index.ts        # Registry, body size calc, animation state
│   ├── types.ts        # Frame builder with auto-alignment
│   ├── cat.ts          # 5 sizes × 4 states × 4 frames
│   ├── dog.ts
│   ├── rabbit.ts
│   ├── panda.ts
│   ├── penguin.ts
│   └── fox.ts
└── render/
    ├── index.ts        # 3-line compositor, per-char colorizer
    └── colors.ts       # Truecolor RGB, progress bars
```

## License

ISC
