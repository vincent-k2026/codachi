import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { parseEvent, detectExitCode, extractFilePath, appendEvent } from './hook.js';
import type { CodachiEvent } from './hook.js';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

beforeEach(() => { vi.resetAllMocks(); });

describe('extractFilePath', () => {
  it('extracts file_path', () => {
    expect(extractFilePath({ file_path: '/tmp/foo.ts' })).toBe('/tmp/foo.ts');
  });

  it('extracts filePath (camelCase)', () => {
    expect(extractFilePath({ filePath: '/tmp/bar.ts' })).toBe('/tmp/bar.ts');
  });

  it('returns empty for missing path', () => {
    expect(extractFilePath({})).toBe('');
  });
});

describe('detectExitCode', () => {
  it('detects success from top-level exit_code', () => {
    expect(detectExitCode({ exit_code: 0 })).toBe(true);
    expect(detectExitCode({ exitCode: 0 })).toBe(true);
  });

  it('detects failure from top-level exit_code', () => {
    expect(detectExitCode({ exit_code: 1 })).toBe(false);
  });

  it('detects from structured tool_output', () => {
    expect(detectExitCode({ tool_output: { exit_code: 0 } })).toBe(true);
    expect(detectExitCode({ tool_output: { exitCode: 1 } })).toBe(false);
  });

  it('detects from string output', () => {
    expect(detectExitCode({ tool_output: 'Output\nExit code: 0' })).toBe(true);
    expect(detectExitCode({ tool_output: 'Error\nexit code: 1' })).toBe(false);
  });

  it('defaults to true for unknown format', () => {
    expect(detectExitCode({})).toBe(true);
    expect(detectExitCode({ tool_output: 'some output' })).toBe(true);
  });
});

describe('parseEvent', () => {
  it('parses bash command', () => {
    const event = parseEvent({ tool_name: 'Bash', tool_input: { command: 'npm test' }, exit_code: 0 });
    expect(event).toEqual({ type: 'bash', detail: 'npm test', ok: true, ts: expect.any(Number) });
  });

  it('parses edit event', () => {
    const event = parseEvent({ tool_name: 'Edit', tool_input: { file_path: '/tmp/src/foo.ts' } });
    expect(event).toEqual({ type: 'edit', detail: 'foo.ts', ok: true, ts: expect.any(Number) });
  });

  it('parses write event', () => {
    const event = parseEvent({ tool_name: 'Write', tool_input: { file_path: '/tmp/bar.ts' } });
    expect(event?.type).toBe('write');
    expect(event?.detail).toBe('bar.ts');
  });

  it('parses read event', () => {
    const event = parseEvent({ tool_name: 'Read', tool_input: { file_path: '/tmp/baz.ts' } });
    expect(event?.type).toBe('read');
    expect(event?.detail).toBe('baz.ts');
  });

  it('returns null for empty tool name', () => {
    expect(parseEvent({ tool_input: {} })).toBeNull();
  });

  it('returns null for bash with no command', () => {
    expect(parseEvent({ tool_name: 'Bash', tool_input: {} })).toBeNull();
  });

  it('returns null for edit with no file path', () => {
    expect(parseEvent({ tool_name: 'Edit', tool_input: {} })).toBeNull();
  });

  it('classifies Grep as search', () => {
    const event = parseEvent({ tool_name: 'Grep', tool_input: { pattern: 'TODO' } });
    expect(event?.type).toBe('search');
    expect(event?.detail).toBe('TODO');
  });

  it('classifies Glob as search', () => {
    const event = parseEvent({ tool_name: 'Glob', tool_input: { pattern: '**/*.ts' } });
    expect(event?.type).toBe('search');
    expect(event?.detail).toBe('**/*.ts');
  });

  it('classifies Agent as agent', () => {
    const event = parseEvent({ tool_name: 'Agent', tool_input: { description: 'find bugs' } });
    expect(event?.type).toBe('agent');
    expect(event?.detail).toBe('find bugs');
  });

  it('classifies WebSearch as web', () => {
    const event = parseEvent({ tool_name: 'WebSearch', tool_input: { query: 'npm publish' } });
    expect(event?.type).toBe('web');
    expect(event?.detail).toBe('npm publish');
  });

  it('classifies LSP as lsp', () => {
    const event = parseEvent({ tool_name: 'LSP', tool_input: { action: 'references' } });
    expect(event?.type).toBe('lsp');
    expect(event?.detail).toBe('references');
  });

  it('handles truly unknown tool types as other', () => {
    const event = parseEvent({ tool_name: 'SomeNewTool', tool_input: {} });
    expect(event?.type).toBe('other');
    expect(event?.detail).toBe('somenewtool');
  });

  it('truncates long bash commands to 300 chars', () => {
    const longCmd = 'x'.repeat(500);
    const event = parseEvent({ tool_name: 'Bash', tool_input: { command: longCmd } });
    expect(event?.detail.length).toBe(300);
  });

  it('is case-insensitive for tool names', () => {
    const event = parseEvent({ tool_name: 'BASH', tool_input: { command: 'ls' } });
    expect(event?.type).toBe('bash');
  });
});

describe('appendEvent', () => {
  it('appends to existing events', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      events: [{ type: 'read', detail: 'a.ts', ok: true, ts: 1 }],
    }));

    const event: CodachiEvent = { type: 'bash', detail: 'npm test', ok: true, ts: 2 };
    appendEvent(event);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('events.json'),
      expect.stringContaining('"npm test"'),
    );
  });

  it('creates directory if needed', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('ENOENT'); });

    appendEvent({ type: 'bash', detail: 'ls', ok: true, ts: 1 });

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('limits to MAX_EVENTS (50)', () => {
    const events = Array.from({ length: 55 }, (_, i) => ({
      type: 'bash', detail: `cmd${i}`, ok: true, ts: i,
    }));
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ events }));

    appendEvent({ type: 'bash', detail: 'new', ok: true, ts: 100 });

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    const written = JSON.parse(writeCall[1] as string) as { events: CodachiEvent[] };
    expect(written.events.length).toBeLessThanOrEqual(50);
    expect(written.events[written.events.length - 1].detail).toBe('new');
  });
});
