/**
 * codachi init — auto-configure Claude Code settings.json
 * Adds statusLine and PostToolExecution hook.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');

export function runInit(): void {
  // Detect codachi dist path
  const distDir = path.dirname(new URL(import.meta.url).pathname);
  const indexPath = path.join(distDir, 'index.js');
  const hookPath = path.join(distDir, 'hook.js');

  // Verify dist files exist
  if (!fs.existsSync(indexPath)) {
    console.log('Error: dist/index.js not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Load existing settings
  let settings: Record<string, unknown> = {};
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) as Record<string, unknown>;
  } catch {
    // No existing settings — create new
  }

  // Set statusLine
  settings.statusLine = {
    type: 'command',
    command: `node ${indexPath}`,
  };

  // Set hooks (preserve existing hooks)
  const hooks = (settings.hooks ?? {}) as Record<string, unknown[]>;
  const postHooks = Array.isArray(hooks.PostToolExecution) ? hooks.PostToolExecution : [];

  // Check if codachi hook already exists
  const hookCommand = `node ${hookPath}`;
  const hasHook = postHooks.some((h: unknown) => {
    const hook = h as Record<string, unknown>;
    return typeof hook.command === 'string' && hook.command.includes('codachi');
  });

  if (!hasHook) {
    postHooks.push({ matcher: '', command: hookCommand });
  }

  hooks.PostToolExecution = postHooks;
  settings.hooks = hooks;

  // Write settings
  const dir = path.dirname(SETTINGS_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');

  console.log('codachi installed successfully!');
  console.log('');
  console.log(`  statusLine → node ${indexPath}`);
  console.log(`  hook       → node ${hookPath}`);
  console.log('');
  console.log('Restart Claude Code to see your pet hatch.');
}
