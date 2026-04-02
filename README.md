# codachi

A tamagotchi-style virtual pet that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.

Your pet grows fatter as your context window fills up, reacts to your git activity, shows you useful dev info at a glance, and keeps you company while you code.

```
   /\_/\~      [Opus 4.6] ██████░░░░ 55% | 5h ██░░░░ 32% ~2h | 7d █░░░░ 25%
 =( o w o )=   git:(main*) ~12 ?3 | +489 -84 lines | last: fix auth bug
   (> ^ <)     Cat Purring softly... | myapp [Node] | 2026-04-02 17:22 | up 45m
```

## Features

### Your Pet Grows With Context

Body size scales with context window usage — from tiny to thicc.

```
 /\_/\~      /\_/\~        /\_/\~            /\_____/\~          /\_________/\~
( owo )    ( owo )     =( o w o )=      ==( o  w  o )==     ===( o    w    o )===
 (^ ^)      (^ ^)       (> ^ <)          ( > ^^ < )          (  > ^^^ <  )
  ~20%       ~35%          ~55%              ~75%                   ~95%
```

### 6 Animals, 10 Color Palettes

Your username hash determines your pet and color scheme.

| Animal | Ears | Face | Feature |
|--------|------|------|---------|
| Cat | `/\_/\` | `( owo )` | Pointy ears, tail `~` |
| Dog | `U\_/U` | `( owo )` | Floppy ears |
| Rabbit | `(\  (\` | `( o.o )` | Long ears, feet `o(")("` |
| Panda | `(@)(@)` | `( o.o )` | Round ear patches |
| Penguin | | `( ovo )` | Flippers `/\|  \|\\` |
| Fox | `/V\_/V\` | `( owo )` | Pointy ears, tail `\_Y_/` |

Palettes: Coral Flame, Electric Blue, Neon Mint, Purple Haze, Hot Pink, Golden Sun, Ice Violet, Cherry Blossom, Cyan Surge, Tangerine.

### 4 Animation States

| State | Trigger | What changes |
|-------|---------|--------------|
| **Idle** | Normal | Eyes blink (`o` -> `-`), tail wags (`~`), happy face (`^`) |
| **Busy** | Claude working | Rapid eye/tail cycling |
| **Danger** | Context > 85% | Wide eyes (`O`), `!` warning |
| **Sleep** | Context < 10% | Closed eyes (`-`), `z` / `Z` |

Animations are time-based (`Date.now()`), so the pet changes pose every ~1.5s whenever the statusline refreshes.

### 3-Line Info Display

| Line | Content |
|------|---------|
| **Claude** | Model, context bar + %, 5h usage + reset countdown, 7d usage |
| **Git** | Branch, file changes, line +/-, ahead/behind, last commit, stash |
| **Pet** | Name, mood, project [lang], datetime, session uptime |

### 100+ Mood Messages

| Trigger | Examples |
|---------|----------|
| Git dirty | "Work in progress~ looking good!" |
| Clean repo | "Everything's tidy~ feels nice" |
| Context size | "Maximum floof achieved!", "Smol but mighty!" |
| Time of day | "Burning the midnight oil..." |
| Easter eggs | "Found a bug! ...it's kinda cute tho" |
| Per-animal | Cat: "\*slow blink\* ...I love you" |

### Language Detection

Auto-detects: Rust, Go, Python, Node, Deno, Ruby, Java, Kotlin, Elixir, Dart, Swift, C/C++, Nix, Docker, Terraform.

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

Restart Claude Code.

## How It Works

```
Claude Code --stdin:JSON--> codachi --stdout:ANSI--> statusline
```

Statusline refreshes during active rendering (streaming, tool execution). Animation uses wall-clock time so each refresh shows the correct frame.

## Project Structure

```
src/
├── index.ts            # Entry: stdin -> compute -> render
├── stdin.ts            # Parse Claude Code JSON
├── git.ts              # Branch, diff stats, stash (4 git commands)
├── state.ts            # Wall-clock animation, session uptime
├── identity.ts         # Username hash -> animal + palette
├── mood.ts             # 100+ context-aware messages
├── project.ts          # Language detection
├── width.ts            # Terminal width calculation
├── types.ts            # TypeScript interfaces
├── animals/
│   ├── index.ts        # Registry, body size, animation state
│   ├── types.ts        # Template frame builder with auto-alignment
│   ├── cat.ts          # Template: shape once, swap eyes/mouth/tail
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
