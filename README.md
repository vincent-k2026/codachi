# codachi

A tamagotchi-style virtual pet that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.

Your pet grows fatter as your context window fills up, reacts to your git activity, remembers you across sessions, and keeps you company while you code.

```
   /\_/\~      [Opus 4.6] ██████░░░░ 55% ^3%/m cache:80% | 5h ██░░░░ 32% ~2h
 =( o w o )=   git:(main*) ~12 ?3 | +489 -84 lines | last: fix auth bug
   (> ^ <)     Cat Purring softly... | myapp [Node] | 2026-04-04 15:00 | up 45m
```

## Features

### Your Pet Grows With Context

Body size scales with context window usage — from tiny to thicc.

```
 /\_/\~       tiny (~20%)
( owo )
 (^ ^)

  /\_/\~      small (~35%)
 ( owo )
  (^ ^)

   /\_/\~       medium (~55%)
 =( o w o )=
   (> ^ <)

    /\_____/\~       chubby (~75%)
 ==( o  w  o )==
    ( > ^^ < )

     /\_________/\~       thicc (~95%)
 ===( o    w    o )===
     (  > ^^^ <  )
```

### 6 Animals, 10 Color Palettes

Each session gets a random animal and color palette — a fresh companion every conversation.

| Animal | Look | Signature |
|--------|------|-----------|
| Cat | `/\_/\` `( owo )` | Pointy ears, waving tail `~` |
| Dog | `U    U` `( owo )` | Floppy U ears, nose `w` |
| Rabbit | `() ()` `( o.o )` | Tall ears, bunny feet `(")` |
| Panda | `(●)(●)` `( o.o )` | Dark eye patches |
| Penguin | `( ovo )` `<(  )>` | Flippers `< >`, beak `v` |
| Fox | `/V V\` `( owo )` | Sharp ears, bushy tail `~~` |

Palettes: Coral Flame, Electric Blue, Neon Mint, Purple Haze, Hot Pink, Golden Sun, Ice Violet, Cherry Blossom, Cyan Surge, Tangerine.

### 4 Animation States

| State | Trigger | What changes |
|-------|---------|--------------|
| **Idle** | Normal | Eyes blink `o`->`-`, tail wags `~`, happy face `^` |
| **Busy** | Claude working | Rapid eye/tail cycling |
| **Danger** | Context > 85% | Wide eyes `O`, warning `!` |
| **Sleep** | Context < 10% | Closed eyes `-`, snoring `z`/`Z` |

Animations are time-based — the pet changes pose every ~1.5s whenever the statusline refreshes.

### 3-Line Info Display

| Line | Content |
|------|---------|
| **Claude** | Model, context bar + %, burn speed `^3%/m`, cache hit rate `cache:80%`, 5h/7d usage + reset countdown |
| **Git** | Branch, file changes (`~mod +add -del ?new`), line diffs, ahead/behind, last commit, stash count |
| **Pet** | Name, mood message, project name + language, datetime, session uptime |

### Context Velocity

Shows how fast your context window is filling up: `^5%/m` means 5% per minute. Color-coded green (slow) / yellow (moderate) / red (burning fast). Helps you predict when to `/compact`.

### Cache Hit Rate

Displays `cache:73%` — what percentage of input tokens come from cache reads vs. fresh creation. High cache = efficient session. This metric isn't shown anywhere else in Claude Code.

### Pet Memory

Your pet remembers you across sessions. A persistent `memory.json` tracks:

- Total sessions together
- Total time spent coding
- Relationship tier: **stranger** -> **acquaintance** -> **friend** -> **bestie**

Each tier unlocks warmer messages. New pets say "Oh! A new friend!" while besties say "BESTIE! You're here! #47".

### 150+ Mood Messages

Your pet reacts to what's happening:

| Trigger | Examples |
|---------|----------|
| Relationship | "Welcome back! #47" (friend), "Oh! A new friend!" (stranger) |
| Context velocity | "Whoa, burning through context!", "Nice steady pace~" |
| Cache efficiency | "Great cache hits! So efficient~" |
| File types | "Writing tests! So responsible~", "Documentation hero!" |
| Git state | "Work in progress~ looking good!", "Everything's tidy~ feels nice" |
| Context size | "Maximum floof achieved!", "Smol but mighty!" |
| Time of day | "Burning the midnight oil...", "Lunch time vibes~" |
| Easter eggs | "Found a bug! ...it's kinda cute tho", "import antigravity" |
| Per-animal | Cat: "\*slow blink\* ...I love you", Dog: "You're my favorite human!" |

### File Type Awareness

The pet watches what files you're changing and reacts:

TypeScript, JavaScript, Python, Rust, Go, Ruby, Java, Kotlin, Swift, C/C++, CSS, HTML, Vue, Svelte, Shell, SQL, Proto, GraphQL, Config files, Docs, Tests — each with unique messages.

### Language Detection

Auto-detects project language from config files: Rust, Go, Python, Node, Deno, Ruby, Java, Kotlin, Elixir, Dart, Swift, C/C++, Nix, Docker, Terraform, and more.

## Installation

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
Claude Code --stdin:JSON--> codachi --stdout:ANSI--> statusline
```

Claude Code passes session data (model, context window, rate limits, cwd, transcript path) via stdin as JSON. Codachi computes git status, animation frame, mood message, and outputs 3 lines of ANSI-colored text.

Animation is driven by `Date.now()` so each refresh shows the correct frame. Git results are cached for 2 seconds to stay within the refresh budget.

## Project Structure

```
src/
├── index.ts            # Entry: stdin -> compute -> render
├── stdin.ts            # Parse Claude Code JSON, cache hit rate
├── git.ts              # Branch, diff stats, stash, file type detection
├── state.ts            # Session binding, animation ticks, context velocity,
│                       #   pet memory (cross-session), relationship tiers
├── identity.ts         # Session-random animal + palette selection
├── mood.ts             # 150+ mood messages with 11-tier priority system
├── project.ts          # Language/framework detection
├── width.ts            # Terminal character width (East Asian Width)
├── types.ts            # TypeScript interfaces
├── animals/
│   ├── index.ts        # Registry, body size, animation state
│   ├── types.ts        # Template frame builder with auto-alignment
│   ├── cat.ts          # Template: define shape once, swap eyes/mouth/tail
│   ├── dog.ts          #   Each animal has unique structural features
│   ├── rabbit.ts       #   5 sizes × 4 states × 4 frames = 80 frames
│   ├── panda.ts
│   ├── penguin.ts
│   └── fox.ts
└── render/
    ├── index.ts        # 3-line compositor, per-char colorizer
    └── colors.ts       # Truecolor RGB, progress bars
```

## License

ISC
