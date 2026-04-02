---
allowed-tools: ["Bash", "Read", "Edit", "Write"]
description: "Set up claude-pet as your statusline"
---

# Claude Pet Setup

You are setting up claude-pet as the user's Claude Code statusline.

## Steps

1. Determine the absolute path to the `dist/index.js` file in this project
2. Test that the command works by running: `echo '{"model":{"display_name":"Test"},"context_window":{"used_percentage":50}}' | node <path>/dist/index.js`
3. Read `~/.claude/settings.json` to check current statusline config
4. Set the statusLine config:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node <absolute-path-to>/dist/index.js"
  }
}
```

5. Tell the user to restart Claude Code for the pet to appear

## Important
- Use the absolute path to dist/index.js
- Preserve any existing settings in settings.json
- If there's already a statusLine configured, warn the user before overwriting
