#!/usr/bin/env node
/**
 * Claude Code PostToolExecution hook — logs tool events for codachi.
 * Receives JSON on stdin from Claude Code, appends to events file.
 * Must exit quickly to never block Claude Code.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { atomicWrite } from './fs-utils.js';
import { logError } from './log.js';

const EVENTS_DIR = path.join(os.homedir(), '.claude', 'plugins', 'codachi');
const EVENTS_FILE = path.join(EVENTS_DIR, 'events.json');
const MAX_EVENTS = 50;

interface CodachiEvent {
  type: string;
  detail: string;
  ok: boolean;
  ts: number;
}

function extractFilePath(input: Record<string, unknown>): string {
  return String(input.file_path ?? input.filePath ?? '');
}

function detectExitCode(data: Record<string, unknown>): boolean {
  // Check top-level exit_code (some Claude Code versions)
  const topCode = data.exit_code ?? data.exitCode;
  if (topCode !== undefined) return Number(topCode) === 0;

  const output = data.tool_output ?? data.tool_result ?? data.toolResult ?? data.output ?? '';

  // Structured result object with exit_code field
  if (typeof output === 'object' && output !== null) {
    const out = output as Record<string, unknown>;
    const code = out.exit_code ?? out.exitCode ?? out.code;
    if (code !== undefined) return Number(code) === 0;
  }

  // String result — look for "Exit code: N" pattern
  if (typeof output === 'string') {
    const m = output.match(/exit code[:\s]+(\d+)/i);
    if (m) return m[1] === '0';
  }

  // Unknown — assume success (optimistic default)
  return true;
}

function parseEvent(data: Record<string, unknown>): CodachiEvent | null {
  const toolName = String(data.tool_name ?? data.toolName ?? '').toLowerCase();
  const toolInput = (data.tool_input ?? data.toolInput ?? {}) as Record<string, unknown>;

  if (!toolName) return null;

  switch (toolName) {
    case 'bash': {
      const cmd = String(toolInput.command ?? '').slice(0, 300);
      if (!cmd) return null;
      return { type: 'bash', detail: cmd, ok: detectExitCode(data), ts: Date.now() };
    }
    case 'edit':
    case 'write': {
      const file = extractFilePath(toolInput);
      if (!file) return null;
      return { type: toolName, detail: path.basename(file), ok: true, ts: Date.now() };
    }
    case 'read': {
      const file = extractFilePath(toolInput);
      if (!file) return null;
      return { type: 'read', detail: path.basename(file), ok: true, ts: Date.now() };
    }
    case 'glob': {
      const pattern = String(toolInput.pattern ?? '').slice(0, 100);
      return { type: 'search', detail: pattern || 'glob', ok: true, ts: Date.now() };
    }
    case 'grep': {
      const pattern = String(toolInput.pattern ?? '').slice(0, 100);
      return { type: 'search', detail: pattern || 'grep', ok: true, ts: Date.now() };
    }
    case 'agent': {
      const desc = String(toolInput.description ?? toolInput.prompt ?? '').slice(0, 80);
      return { type: 'agent', detail: desc || 'subagent', ok: true, ts: Date.now() };
    }
    case 'websearch':
    case 'webfetch': {
      const query = String(toolInput.query ?? toolInput.url ?? '').slice(0, 100);
      return { type: 'web', detail: query || toolName, ok: true, ts: Date.now() };
    }
    case 'lsp': {
      return { type: 'lsp', detail: String(toolInput.action ?? 'lsp').slice(0, 50), ok: true, ts: Date.now() };
    }
    default:
      return { type: 'other', detail: toolName.slice(0, 50), ok: true, ts: Date.now() };
  }
}

/**
 * Append an event with a simple optimistic-concurrency guard.
 *
 * Problem: two hook invocations can overlap (read → modify → write),
 * causing the slower one to overwrite the faster one's append.
 *
 * Solution: the events file carries a monotonic `gen` counter.
 * After reading, we write with `gen + 1`. On write, if the file's gen
 * has moved past ours (another hook raced us), we re-read and retry
 * once. One retry is enough — the window is <5ms per hook invocation,
 * so triple-collisions are astronomically unlikely.
 */
const MAX_RETRIES = 1;

function readEvents(): { events: CodachiEvent[]; gen: number } {
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    const data = JSON.parse(raw) as { events?: CodachiEvent[]; gen?: number };
    return {
      events: Array.isArray(data.events) ? data.events : [],
      gen: typeof data.gen === 'number' ? data.gen : 0,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      logError('hook.appendEvent.read', err);
    }
    return { events: [], gen: 0 };
  }
}

function appendEvent(event: CodachiEvent): void {
  try {
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
  } catch (err) {
    logError('hook.appendEvent.mkdir', err);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { events, gen } = readEvents();
    events.push(event);
    const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
    const nextGen = gen + 1;

    if (!atomicWrite(EVENTS_FILE, JSON.stringify({ events: trimmed, gen: nextGen }))) {
      continue; // write failed (e.g., disk full) — retry
    }

    // Optimistic check: re-read and verify our gen landed.
    // If another hook overwrote us, our gen won't match.
    if (attempt < MAX_RETRIES) {
      const check = readEvents();
      if (check.gen === nextGen) return; // success
      // Race detected — retry with fresh state.
      continue;
    }
    return;
  }
}

// Export for testing
export { parseEvent, detectExitCode, extractFilePath, appendEvent };
export type { CodachiEvent };

// ── Main — only runs when executed directly ─────────
const isDirectExecution = process.argv[1]?.endsWith('hook.js') ?? false;
if (isDirectExecution) {
  const chunks: string[] = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d: string) => chunks.push(d));
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(chunks.join('')) as Record<string, unknown>;
      const event = parseEvent(data);
      if (event) appendEvent(event);
    } catch (err) {
      logError('hook.main', err);
    }
    process.exit(0);
  });
  // Safety timeout: 5s is generous for file I/O even on slow disks / NFS.
  // The old 2s limit could race with the optimistic-retry appendEvent on
  // slow storage. Claude Code won't block on this — hooks are fire-and-forget.
  setTimeout(() => process.exit(0), 5000);
}
