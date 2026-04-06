<div align="center">

# codachi

**A tamagotchi that lives in your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) statusline.**

Your pet hatches when you start coding, grows as context fills up,<br>
reacts to your work, and remembers you between sessions.

![codachi demo](codachi-demo.gif)

</div>

---

## Install

```bash
git clone https://github.com/vincent-k2026/codachi.git
cd codachi && npm install && npm run build
node dist/index.js init
```

That's it. Restart Claude Code and your pet will hatch.

Try the demo first: `node dist/index.js demo`

<details>
<summary>Manual setup</summary>

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/codachi/dist/index.js"
  },
  "hooks": {
    "PostToolExecution": [
      {
        "matcher": "",
        "command": "node /absolute/path/to/codachi/dist/hook.js"
      }
    ]
  }
}
```

</details>

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

## 5 moods

Your pet's expression changes based on what's happening.

| State | When | Eyes | Tail |
|:------|:-----|:-----|:-----|
| **Idle** | Normal | `o` `^` `-` blink | `~` wag |
| **Happy** | Tests pass, commit, recovery | `^` squint | `~` wag |
| **Busy** | Claude streaming | Rapid cycle | `~` |
| **Danger** | Context > 85% | `O` wide | `!` |
| **Sleep** | Context < 10% | `-` closed | `z` `Z` |

---

## What you see

```
Line 1   [Opus 4.6] [======----] 55% 555K/1.0M ^3%/m ~15m cache:78% | 5h [==----] 32% ~2h
Line 2   git:(main*) ~12 ?3 | +489 -84 lines | last: fix auth bug
Line 3   Mochi *slow blink* ...I love you | myapp [Node] | up 45m
```

| Metric | What it tells you |
|:-------|:------------------|
| `[======----] 55%` | Context window usage |
| `555K/1M` | Tokens used / window size |
| `^3%/m` | Context burn speed |
| `~15m` | Estimated time until context is full |
| `cache:78%` | Token cache efficiency |
| `5h [==----] 32% ~2h` | Rate limit usage + reset countdown |
| `git:(main*) ~12 ?3` | Branch, modified/untracked files |
| `+489 -84 lines` | Insertions / deletions |
| `Mochi *slow blink*` | Pet name + mood message (850+ messages) |
| `myapp [Node]` | Project name + auto-detected language |
| `up 45m` | Session uptime |

---

## Pet memory

Your pet remembers you across sessions. When you level up, your pet celebrates.

| Tier | Sessions | Greeting |
|:-----|:---------|:---------|
| Stranger | 0 | *"Oh! A new friend!"* |
| Acquaintance | 3+ | *"Hey, good to see you again!"* |
| Friend | 15+ | *"My favorite human is back!"* |
| Bestie | 50+ | *"BESTIE! You're here! #50"* |

Tier upgrades trigger a one-time celebration: *"BESTIE STATUS UNLOCKED! WE DID IT!"*

---

## 850+ mood messages

Your pet watches what Claude does via hooks and reacts in real time.

| When | Example |
|:-----|:--------|
| Tests pass | *"ALL GREEN! \*happy dance\*"* |
| Tests fail | *"Tests tripped... you got this!"* |
| Build succeeds | *"Clean build! \*sparkling eyes\*"* |
| Build fails | *"The compiler disagrees... hmm"* |
| Git commit | *"Checkpoint saved! \*relief\*"* |
| Git push | *"Code is flying to the remote!"* |
| Installing packages | *"New dependencies! \*unwraps eagerly\*"* |
| Editing a file | *"Working on auth.ts~ nice!"* |
| Creating new file | *"A new file is born! \*celebrates\*"* |
| Writing tests | *"Testing is caring!"* |
| Writing docs | *"Documentation hero! \*salutes\*"* |
| Linting/formatting | *"Code spa day! Refresh~"* |
| Multiple failures | *"Hang in there! \*warm hug\*"* |
| Fix after failure | *"Redemption arc complete!"* |
| Rapid editing | *"Flow state detected! Beautiful~"* |
| Exploring code | *"Code archaeology in progress!"* |
| Dangerous commands | *"My insurance doesn't cover this..."* |
| Cat idle | *"\*knocks something off the desk\*"* |
| Owl idle | *"In my expert owl-pinion, this is going well"* |
| Penguin idle | *"Noot noot! \*happy penguin sounds\*"* |
| Octopus idle | *"\*squirts ink\* Oops, that was the dark theme"* |
| Bunny idle | *"\*flops sideways\* (that means I trust you)"* |
| Late night | *"The whole world is asleep... except us"* |
| Weekend | *"Weekend coding? Impressive!"* |
| Easter egg | *"I live in the statusline but you live in my heart"* |

<details>
<summary>All event categories</summary>

Testing · Building · Installing · Git commit/push/pull/merge/rebase/stash/checkout · Linting · Server start · Docker/K8s · Network/HTTP · Dangerous commands · Search · File editing by type (tests/docs/styles/config/code) · New file creation · Rapid editing · Code exploration · Recovery from errors · Struggling pattern · Session milestones · Tier upgrades

</details>

<details>
<summary>Supported languages</summary>

TypeScript · JavaScript · Python · Rust · Go · Ruby · Java · Kotlin · Swift · C/C++ · CSS · HTML · Vue · Svelte · Shell · SQL · Proto · GraphQL · Config · Docs · Tests

</details>

---

## Configuration

Optional. Create `~/.config/codachi/config.json`:

```json
{
  "name": "Mochi",
  "animal": "cat",
  "palette": 3
}
```

| Option | Default | Values |
|:-------|:--------|:-------|
| `name` | species name | Custom pet name |
| `animal` | random | `cat` `penguin` `owl` `octopus` `bunny` |
| `palette` | random | `0`-`9` |
| `showTokens` | `true` | Token count display |
| `showVelocity` | `true` | Context burn speed + time remaining |
| `showCache` | `true` | Cache hit rate |
| `showGit` | `true` | Git status line |
| `showUptime` | `true` | Session uptime |
| `animationSpeed` | `1.5` | Seconds per frame |

---

## How it works

```
Claude Code ──stdin:JSON──▶ codachi ──stdout:ANSI──▶ statusline
                 │
                 └──hook──▶ events.json ──▶ mood engine
```

- **Zero cost** — hooks log events to disk, no API calls, no tokens
- **Event-reactive** — hot (< 15s), warm (< 60s), cold (< 5m) freshness tiers
- **Pattern detection** — struggling (3+ failures), recovery, rapid editing, exploring
- **Predictive** — estimates time until context is full based on burn velocity
- **Atomic writes** — state files use write-to-tmp + rename to prevent corruption
- **Fast** — git results cached 2s, ~50ms render time
- **Session-bound** — pet identity tied to `transcript_path`

<details>
<summary>Project structure</summary>

```
src/
├── index.ts          # Entry point + init/demo routing
├── init.ts           # One-command install
├── demo.ts           # Live terminal demo
├── hook.ts           # Claude Code hook — logs events
├── events.ts         # Event reader + 40-type classifier
├── stdin.ts          # Parse Claude Code JSON
├── git.ts            # Git status + file type detection
├── state.ts          # Session, velocity, memory, tier tracking
├── config.ts         # User configuration
├── identity.ts       # Animal + palette selection
├── mood.ts           # 850+ messages, 15-tier priority
├── project.ts        # Language detection (21 markers)
├── fs-utils.ts       # Atomic file writes
├── width.ts          # Terminal char width (CJK-aware)
├── types.ts          # TypeScript types
├── animals/          # 5 species × 5 sizes × 5 states × 4 frames
└── render/           # 3-line compositor + truecolor
```

</details>

<details>
<summary>Testing</summary>

```bash
npm test              # 292 tests
npm run test:cov      # coverage report (91%+ lines)
```

</details>

## License

MIT
