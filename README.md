<div align="center">

# codachi

**A tamagotchi that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.**

Your pet hatches when you start coding, grows as context fills up,<br>
reacts to your work, and remembers you between sessions.

```
/\_____________/\  ~   [Opus 4.6] ██████░░░░ 55% 555K/1M cache:80% | 5h ██░░░░ 32% ~2h
==( o   w   o  )==    git:(main*) ~12 ?3 | +489 -84 lines | last: fix auth bug
==( "       "  )==    Cat *slow blink* ...I love you | myapp [Node] | up 45m
```

</div>

---

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

---

## Your pet grows

The fatter your context, the fatter your pet.

```
/\_____/\  ~            tiny    (~20% context)
( o w o )
( "   " )

/\_________/\  ~         small   (~35%)
=( o  w  o )=
=( "     " )=

/\_____________/\  ~     medium  (~55%)
==( o   w   o )==
==( "       " )==

/\___________________/\  ~     chubby  (~75%)
===( o     w     o )===
===( "           " )===

/\_________________________/\  ~     thicc   (~95%)
====( o       w       o )====
====( "               " )====
```

---

## 5 species

Each session gets a random species and color palette.

```
/\_____/\  ~       (ovo)        {O,O}        ,---.        (\  /)
( o w o )         <(   )>      /)--(\\      ( O.O )      ( oYo )
( "   " )          (" ")        " "        /|~|~|\\       (")(")
   Cat            Penguin        Owl       Octopus        Bunny
```

10 palettes: Coral Flame · Electric Blue · Neon Mint · Purple Haze · Hot Pink · Golden Sun · Ice Violet · Cherry Blossom · Cyan Surge · Tangerine

---

## 4 moods

| State | When | Eyes | Tail |
|:------|:-----|:-----|:-----|
| **Idle** | Normal | `o`  `^`  `-` blink | `~` wag |
| **Busy** | Claude streaming | Rapid cycle | `~` |
| **Danger** | Context > 85% | `O` wide | `!` |
| **Sleep** | Context < 10% | `-` closed | `z` `Z` |

---

## What you see

```
Line 1   [Model] ██████░░░░ 55% 555K/1M ^3%/m cache:80% | 5h ██░░░░ 32% ~2h
Line 2   git:(main*) ~12 ?3 | +489 -84 lines | last: fix auth bug | stash:3
Line 3   Cat *slow blink* ...I love you | myapp [Node] | up 45m
```

| Metric | What it tells you |
|:-------|:------------------|
| `██████░░░░ 55%` | Context window usage |
| `555K/1M` | Tokens used / window size |
| `^3%/m` | Context burn speed — predict when to `/compact` |
| `cache:80%` | Token cache efficiency — unique to codachi |
| `5h ██░░ 32% ~2h` | Rate limit usage + reset countdown |
| `git:(main*) ~12 ?3` | Branch, modified/untracked files |
| `+489 -84 lines` | Insertions / deletions |
| `Cat *slow blink*` | Pet name + mood message (150+ messages) |
| `myapp [Node]` | Project name + auto-detected language |
| `up 45m` | Session uptime |

---

## Pet memory

Your pet remembers you across sessions.

| Tier | Sessions | Greeting |
|:-----|:---------|:---------|
| Stranger | 0 | *"Oh! A new friend!"* |
| Acquaintance | 3+ | *"Hey, good to see you again!"* |
| Friend | 15+ | *"My favorite human is back!"* |
| Bestie | 50+ | *"BESTIE! You're here! #50"* |

---

## 150+ mood messages

| When | Example |
|:-----|:--------|
| Fast context burn | *"Whoa, burning through context!"* |
| Good cache hits | *"Great cache hits! So efficient~"* |
| Editing tests | *"Writing tests! So responsible~"* |
| Clean repo | *"Everything's tidy~ feels nice"* |
| Midnight | *"Burning the midnight oil..."* |
| Easter egg | *"Found a bug! ...it's kinda cute tho"* |
| Cat | *"\*slow blink\* ...I love you"* |
| Owl | *"Whooo writes great code? You do!"* |

<details>
<summary>Supported file types</summary>

TypeScript · JavaScript · Python · Rust · Go · Ruby · Java · Kotlin · Swift · C/C++ · CSS · HTML · Vue · Svelte · Shell · SQL · Proto · GraphQL · Config · Docs · Tests

</details>

---

## Configuration

Optional. Create `~/.config/codachi/config.json`:

```json
{
  "animal": "cat",
  "palette": 0,
  "animationSpeed": 1.5
}
```

| Option | Default | Values |
|:-------|:--------|:-------|
| `animal` | random | `cat` `penguin` `owl` `octopus` `bunny` |
| `palette` | random | `0`-`9` |
| `showTokens` | `true` | Token count display |
| `showVelocity` | `true` | Context burn speed |
| `showCache` | `true` | Cache hit rate |
| `showGit` | `true` | Git status line |
| `showUptime` | `true` | Session uptime |
| `animationSpeed` | `1.5` | Seconds per frame |

---

## How it works

```
Claude Code ──stdin:JSON──▶ codachi ──stdout:ANSI──▶ statusline
```

- Animation driven by wall clock — correct frame on every refresh
- Git results cached 2 seconds
- Session bound to `transcript_path`

<details>
<summary>Project structure</summary>

```
src/
├── index.ts          # Entry point
├── stdin.ts          # Parse Claude Code JSON
├── git.ts            # Git status + file type detection
├── state.ts          # Session, velocity, memory
├── config.ts         # User configuration
├── identity.ts       # Animal + palette selection
├── mood.ts           # 150+ messages, 11-tier priority
├── project.ts        # Language detection
├── width.ts          # Terminal char width
├── types.ts          # TypeScript types
├── animals/          # 5 species × 5 sizes × 4 states × 4 frames
└── render/           # 3-line compositor + truecolor
```

</details>

## License

MIT
