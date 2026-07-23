import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => true),
  },
}));

const mockRead = vi.mocked(fs.readFileSync);
const mockWrite = vi.mocked(fs.writeFileSync);

let runInit: typeof import('./init.js')['runInit'];
let runUninstall: typeof import('./init.js')['runUninstall'];

const origArgv = process.argv[1];

/** Settings as written by the last runInit/runUninstall call. */
function written(): Record<string, any> {
  expect(mockWrite).toHaveBeenCalled();
  return JSON.parse(mockWrite.mock.calls.at(-1)![1] as string);
}

function existing(settings: unknown): void {
  mockRead.mockReturnValue(JSON.stringify(settings));
}

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  // Pretend we're the installed bin so commands are the short, path-free names.
  process.argv[1] = '/tmp/node_modules/.bin/codachi';
  const mod = await import('./init.js');
  runInit = mod.runInit;
  runUninstall = mod.runUninstall;
});

afterEach(() => {
  process.argv[1] = origArgv;
});

describe('runInit', () => {
  it('writes the hook under PostToolUse, not PostToolExecution', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT'); });
    runInit();
    const s = written();
    expect(s.hooks.PostToolUse).toBeDefined();
    expect(s.hooks.PostToolExecution).toBeUndefined();
  });

  it('nests the command in a hooks array so Claude Code can parse it', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT'); });
    runInit();
    expect(written().hooks.PostToolUse).toEqual([
      { matcher: '*', hooks: [{ type: 'command', command: 'codachi-hook' }] },
    ]);
  });

  it('sets the statusLine command', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT'); });
    runInit();
    expect(written().statusLine).toEqual({ type: 'command', command: 'codachi' });
  });

  it('preserves unrelated settings', () => {
    existing({ env: { FOO: '1' }, permissions: { allow: ['Bash(ls:*)'] } });
    runInit();
    const s = written();
    expect(s.env).toEqual({ FOO: '1' });
    expect(s.permissions).toEqual({ allow: ['Bash(ls:*)'] });
  });

  it('preserves hooks belonging to other tools', () => {
    existing({
      hooks: {
        PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'prettier --write' }] }],
        PreToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'audit-log' }] }],
      },
    });
    runInit();
    const s = written();
    expect(s.hooks.PostToolUse).toHaveLength(2);
    expect(s.hooks.PostToolUse[0].hooks[0].command).toBe('prettier --write');
    expect(s.hooks.PreToolUse).toHaveLength(1);
  });

  it('is idempotent — re-running does not duplicate the hook', () => {
    existing({
      hooks: {
        PostToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'codachi-hook' }] }],
      },
    });
    runInit();
    expect(written().hooks.PostToolUse).toHaveLength(1);
  });

  it('migrates a hook left under the legacy event name', () => {
    existing({
      hooks: { PostToolExecution: [{ matcher: '', command: 'codachi-hook' }] },
    });
    runInit();
    const s = written();
    expect(s.hooks.PostToolExecution).toBeUndefined();
    expect(s.hooks.PostToolUse).toHaveLength(1);
  });

  it('keeps foreign entries when clearing the legacy event', () => {
    existing({
      hooks: {
        PostToolExecution: [
          { matcher: '', command: 'codachi-hook' },
          { matcher: '', command: 'someone-elses-tool' },
        ],
      },
    });
    runInit();
    const s = written();
    expect(s.hooks.PostToolExecution).toEqual([{ matcher: '', command: 'someone-elses-tool' }]);
  });

  it('uses absolute node paths when run from a local clone', async () => {
    vi.resetModules();
    process.argv[1] = '/home/dev/codachi/dist/index.js';
    const mod = await import('./init.js');
    mockRead.mockImplementation(() => { throw new Error('ENOENT'); });
    mod.runInit();
    const s = written();
    expect(s.statusLine.command).toMatch(/^node \/.*index\.js$/);
    expect(s.hooks.PostToolUse[0].hooks[0].command).toMatch(/^node \/.*hook\.js$/);
  });
});

describe('runUninstall', () => {
  it('removes the statusLine and the PostToolUse hook', () => {
    existing({
      statusLine: { type: 'command', command: 'codachi' },
      hooks: { PostToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'codachi-hook' }] }] },
    });
    runUninstall();
    const s = written();
    expect(s.statusLine).toBeUndefined();
    expect(s.hooks).toBeUndefined();
  });

  it('removes a hook left under the legacy event name', () => {
    existing({
      statusLine: { type: 'command', command: 'codachi' },
      hooks: { PostToolExecution: [{ matcher: '', command: 'codachi-hook' }] },
    });
    runUninstall();
    expect(written().hooks).toBeUndefined();
  });

  it('leaves other tools\' hooks and statusLine alone', () => {
    existing({
      statusLine: { type: 'command', command: 'my-own-statusline' },
      hooks: {
        PostToolUse: [
          { matcher: '*', hooks: [{ type: 'command', command: 'codachi-hook' }] },
          { matcher: 'Edit', hooks: [{ type: 'command', command: 'prettier --write' }] },
        ],
      },
    });
    runUninstall();
    const s = written();
    expect(s.statusLine).toEqual({ type: 'command', command: 'my-own-statusline' });
    expect(s.hooks.PostToolUse).toEqual([
      { matcher: 'Edit', hooks: [{ type: 'command', command: 'prettier --write' }] },
    ]);
  });

  it('writes nothing when codachi is not installed', () => {
    existing({ env: { FOO: '1' } });
    runUninstall();
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it('writes nothing when there is no settings file', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT'); });
    runUninstall();
    expect(mockWrite).not.toHaveBeenCalled();
  });
});
