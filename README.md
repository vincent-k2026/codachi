<div align="center">

# codachi

**A tamagotchi that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.**

Your pet hatches when you start coding, grows as your context fills up, reacts to your git activity, and remembers you between sessions.

```
/\_____________/\  ~                                                        
==( o   w   o  )==   [Opus 4.6] ██████░░░░ 55% ^3%/m cache:80% | 5h ██░░░░ 32% ~2h
==( "       "  )==   Cat *slow blink* ...I love you | myapp [Node] | up 45m        
```

</div>

## What it does

- Your pet **grows fatter** as context fills up — from tiny to thicc
- It **blinks, wags its tail**, and changes pose every 1.5 seconds
- It **reacts to your git activity** — celebrates clean repos, notices big diffs
- It shows **context burn speed** `^3%/m` and **cache efficiency** `cache:80%` — info shown nowhere else
- It **remembers you** across sessions — relationship evolves from stranger to bestie
- It **knows what files you're editing** and comments on them

## Install

```bash
git clone https://github.com/vincent-k2026/codachi.git
cd codachi && npm install && npm run build
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

Restart Claude Code. Your pet will hatch.

## Your pet grows

Body scales with context window usage. The fatter your context, the fatter your pet.

```
/\_____/\ ~     /\_________/\ ~     /\_____________/\ ~     /\___________________/\ ~
( o w o )       =( o  w  o )=       ==( o   w   o )==       ===( o     w     o )===
( "   " )       =( "     " )=       ==( "       " )==       ===( "           " )===
   tiny              small               medium                    chubby

                          /\_________________________/\ ~
                          ====( o       w       o )====
                          ====( "               " )====
                                      thicc
```

## 5 animals

Each session randomly assigns a species and color palette — a fresh companion every conversation.

```
  /\_____/\ ~       (ovo)         {O,O}         ,---.         (\  /)  
  ( o w o )        <(   )>       /)--(\\       ( O.O )       ( oYo ) 
  ( "   " )         (" ")         " "         /|~|~|\\        (")(") 
     Cat           Penguin         Owl        Octopus         Bunny  
```

10 color palettes: Coral Flame, Electric Blue, Neon Mint, Purple Haze, Hot Pink, Golden Sun, Ice Violet, Cherry Blossom, Cyan Surge, Tangerine.

## 4 moods

| | Trigger | Eyes | Tail |
|---|---------|------|------|
| **Idle** | Normal | Blinks `o` `^` `-` | Wags `~` |
| **Busy** | Claude streaming | Rapid cycling | `~` |
| **Danger** | Context > 85% | Wide `O` | `!` |
| **Sleep** | Context < 10% | Closed `-` | `z` `Z` |

## What you see at a glance

```
Line 1:  [Model] ██████░░░░ 55% ^3%/m cache:80% | 5h ██░░░░ 32% ~2h | 7d █░░░░ 20%
Line 2:  git:(main*) ~12 ?3 | +489 -84 lines | ↑2 | last: fix auth bug | stash:3
Line 3:  Cat *slow blink* ...I love you | myapp [Node] | 2026-04-04 15:00 | up 45m
```

| What | Why it matters |
|------|----------------|
| Context bar `██░░ 55%` | How full is your context window |
| Burn speed `^3%/m` | How fast context is filling — predict when to `/compact` |
| Cache hit `cache:80%` | Token efficiency — not shown anywhere else in Claude Code |
| 5h / 7d usage bars | Rate limits with reset countdown |
| Git status | Branch, file changes, line diffs, unpushed commits, last commit |
| Mood message | 150+ messages reacting to git, context, file types, time of day |
| Project `[Node]` | Auto-detected language from config files |
| Uptime `up 45m` | How long this session has been running |

## Pet memory

Your pet remembers you. A persistent `memory.json` tracks sessions across conversations.

| Tier | After | Greeting |
|------|-------|----------|
| **Stranger** | 0 sessions | "Oh! A new friend!" |
| **Acquaintance** | 3 sessions | "Hey, good to see you again!" |
| **Friend** | 15 sessions | "My favorite human is back!" |
| **Bestie** | 50 sessions | "BESTIE! You're here! #50" |

## 150+ mood messages

Your pet is context-aware. It reacts to what's happening:

| Trigger | Example |
|---------|---------|
| Fast context burn | "Whoa, burning through context!" |
| Good cache hits | "Great cache hits! So efficient~" |
| Editing tests | "Writing tests! So responsible~" |
| Clean repo | "Everything's tidy~ feels nice" |
| Midnight coding | "Burning the midnight oil..." |
| Easter egg (rare) | "Found a bug! ...it's kinda cute tho" |
| Cat personality | "\*slow blink\* ...I love you" |
| Owl personality | "Whooo writes great code? You do!" |

<details>
<summary>Supported file types for mood reactions</summary>

TypeScript, JavaScript, Python, Rust, Go, Ruby, Java, Kotlin, Swift, C/C++, CSS/SCSS, HTML, Vue, Svelte, Shell, SQL, Proto, GraphQL, Config (JSON/YAML/TOML), Docs (Markdown), Tests.

</details>

<details>
<summary>Supported project language detection</summary>

Rust, Go, Python, Node, Deno, Ruby, Java, Kotlin, Elixir, Dart, Swift, C/C++, Make, Nix, Docker, Terraform.

</details>

## How it works

```
Claude Code ──stdin:JSON──> codachi ──stdout:ANSI──> statusline
```

Claude Code invokes the statusline command during active rendering. It passes session data (model, context, rate limits, cwd) via stdin. Codachi computes git status, picks the animation frame, generates a mood message, and outputs 3 lines of ANSI-colored text.

- Animation driven by `Date.now()` — correct frame on every refresh
- Git commands cached for 2 seconds — fits within refresh budget
- Session identity bound to `transcript_path` — same conversation = same pet

## Configuration

Optional. Create `~/.config/codachi/config.json` (or `~/.codachi.json`):

```json
{
  "animal": "cat",
  "palette": 0,
  "showTokens": true,
  "showVelocity": true,
  "showCache": true,
  "showUptime": true,
  "showGit": true,
  "animationSpeed": 1.5
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `animal` | random | Force a species: `cat`, `penguin`, `owl`, `octopus`, `bunny` |
| `palette` | random | Force a color palette (0-9) |
| `showTokens` | `true` | Show token count `550K/1M` |
| `showVelocity` | `true` | Show context burn speed `^3%/m` |
| `showCache` | `true` | Show cache hit rate `cache:80%` |
| `showUptime` | `true` | Show session uptime `up 45m` |
| `showGit` | `true` | Show git status line |
| `animationSpeed` | `1.5` | Seconds per animation frame |

All fields are optional. Omitted fields use defaults.

<details>
<summary>Project structure</summary>

```
src/
├── index.ts            # Entry: stdin → compute → render
├── stdin.ts            # Parse Claude Code JSON, cache hit rate
├── git.ts              # Branch, diff stats, stash, file type detection
├── state.ts            # Session binding, context velocity, pet memory
├── config.ts           # User configuration (~/.config/codachi/config.json)
├── identity.ts         # Session-random animal + palette (config override)
├── mood.ts             # 150+ messages, 11-tier priority system
├── project.ts          # Language/framework detection
├── width.ts            # Terminal character width
├── types.ts            # TypeScript interfaces
├── animals/
│   ├── index.ts        # Registry, body size, animation state
│   ├── types.ts        # Frame builder with auto-centering
│   ├── cat.ts          # 5 sizes × 4 states × 4 frames each
���   ├── penguin.ts
│   ├── owl.ts
│   ├── octopus.ts
│   └── bunny.ts
└── render/
    ├── index.ts        # 3-line compositor, per-char colorizer
    └── colors.ts       # Truecolor RGB, progress bars
```

</details>

## License

MIT
