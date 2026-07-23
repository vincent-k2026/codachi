/**
 * codachi init — auto-configure Claude Code's ~/.claude/settings.json.
 *
 * Adds a statusLine entry and a PostToolUse hook. The commands it writes
 * depend on how codachi is running:
 *
 *   - When installed globally or via `npx codachi init` (argv[1] resolved to
 *     a node_modules or npx cache path), we prefer the bin names `codachi`
 *     and `codachi-hook` — they're short, version-stable, and don't bake
 *     absolute paths into the user's settings.
 *   - When run from a local clone (`node dist/index.js init`), we fall back
 *     to absolute `node /path/to/dist/*.js` so the install still works even
 *     if the clone is not on PATH.
 *
 * Idempotent: if a codachi statusLine / hook already exists, it updates in
 * place rather than duplicating.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');

/** The Claude Code hook event we attach to. */
const HOOK_EVENT = 'PostToolUse';

/** Pre-0.3.1 releases wrote this event name, which Claude Code never fires. */
const LEGACY_HOOK_EVENT = 'PostToolExecution';

const CODACHI_CMD = /codachi(-hook)?|codachi[\\/]dist[\\/]hook/;

/**
 * True for both the nested matcher entry Claude Code expects
 * (`{matcher, hooks: [{type, command}]}`) and the flat legacy shape codachi
 * used to write (`{matcher, command}`), so migration and uninstall catch both.
 */
function isCodachiEntry(entry: unknown): boolean {
  const e = entry as Record<string, unknown> | null;
  if (!e || typeof e !== 'object') return false;
  if (typeof e.command === 'string' && CODACHI_CMD.test(e.command)) return true;
  const nested = Array.isArray(e.hooks) ? e.hooks : [];
  return nested.some((h: unknown) => {
    const hook = h as Record<string, unknown> | null;
    return !!hook && typeof hook.command === 'string' && CODACHI_CMD.test(hook.command);
  });
}

function detectMode(): { statusCmd: string; hookCmd: string; mode: 'bin' | 'local' } {
  const entry = process.argv[1] || '';
  const fromNodeModules = entry.includes(`${path.sep}node_modules${path.sep}`);
  const fromNpxCache = entry.includes(`${path.sep}_npx${path.sep}`) || entry.includes(`${path.sep}.npm${path.sep}`);

  // `npx codachi init` is the dream path: settings reference the short bin
  // names and npx resolves them each run.
  if (fromNodeModules || fromNpxCache) {
    return { statusCmd: 'codachi', hookCmd: 'codachi-hook', mode: 'bin' };
  }

  // Local dev: absolute paths into the clone.
  const distDir = path.dirname(new URL(import.meta.url).pathname);
  const indexPath = path.join(distDir, 'index.js');
  const hookPath = path.join(distDir, 'hook.js');
  if (!fs.existsSync(indexPath)) {
    console.error('Error: dist/index.js not found. Run `npm run build` first.');
    process.exit(1);
  }
  return {
    statusCmd: `node ${indexPath}`,
    hookCmd: `node ${hookPath}`,
    mode: 'local',
  };
}

export function runInit(): void {
  const { statusCmd, hookCmd, mode } = detectMode();

  // Load existing settings — preserve whatever the user already has.
  let settings: Record<string, unknown> = {};
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) as Record<string, unknown>;
  } catch {
    // No existing file — fine, we'll create one.
  }

  settings.statusLine = { type: 'command', command: statusCmd };

  const hooks = (settings.hooks ?? {}) as Record<string, unknown[]>;
  const postHooks = Array.isArray(hooks[HOOK_EVENT]) ? hooks[HOOK_EVENT] : [];

  // Replace any existing codachi hook rather than duplicating.
  const cleaned = postHooks.filter((h) => !isCodachiEntry(h));
  cleaned.push({ matcher: '*', hooks: [{ type: 'command', command: hookCmd }] });
  hooks[HOOK_EVENT] = cleaned;

  // Migrate installs from before the event name was corrected.
  if (Array.isArray(hooks[LEGACY_HOOK_EVENT])) {
    const legacy = hooks[LEGACY_HOOK_EVENT].filter((h) => !isCodachiEntry(h));
    if (legacy.length > 0) hooks[LEGACY_HOOK_EVENT] = legacy;
    else delete hooks[LEGACY_HOOK_EVENT];
  }

  settings.hooks = hooks;

  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');

  console.log('codachi installed successfully!');
  console.log('');
  console.log(`  mode       ${mode === 'bin' ? 'bin (npx / global install)' : 'local clone (absolute paths)'}`);
  console.log(`  statusLine ${statusCmd}`);
  console.log(`  hook       ${hookCmd}`);
  console.log('');
  console.log('Restart Claude Code to see your pet hatch.');
  if (mode === 'bin') {
    console.log('Tip: `npx codachi stats` for a productivity summary.');
  }
}

export function runUninstall(): void {
  let settings: Record<string, unknown> = {};
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) as Record<string, unknown>;
  } catch {
    console.log('No settings file found — nothing to uninstall.');
    return;
  }

  let changed = false;

  // Remove statusLine if it references codachi.
  const sl = settings.statusLine as Record<string, unknown> | undefined;
  if (sl && typeof sl.command === 'string' && /codachi/.test(sl.command)) {
    delete settings.statusLine;
    changed = true;
  }

  // Remove the codachi hook — including any left behind by older installs
  // under the legacy event name.
  const hooks = settings.hooks as Record<string, unknown[]> | undefined;
  if (hooks) {
    for (const event of [HOOK_EVENT, LEGACY_HOOK_EVENT]) {
      if (!Array.isArray(hooks[event])) continue;
      const before = hooks[event].length;
      hooks[event] = hooks[event].filter((h) => !isCodachiEntry(h));
      if (hooks[event].length < before) changed = true;
      if (hooks[event].length === 0) delete hooks[event];
    }
    if (Object.keys(hooks).length === 0) delete settings.hooks;
  }

  if (!changed) {
    console.log('codachi is not configured in settings — nothing to remove.');
    return;
  }

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');
  console.log('codachi uninstalled from Claude Code settings.');
  console.log('Restart Claude Code to take effect.');
  console.log('');
  console.log('Note: pet data in ~/.claude/plugins/codachi/ is preserved.');
  console.log('Delete it manually if you want a clean break.');
}
