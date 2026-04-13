import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    mkdirSync: vi.fn(),
    statSync: vi.fn(),
    renameSync: vi.fn(),
    appendFileSync: vi.fn(),
  },
}));

let logError: typeof import('./log.js')['logError'];
let logWarn: typeof import('./log.js')['logWarn'];
let logDebug: typeof import('./log.js')['logDebug'];

const savedEnv = { ...process.env };

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  delete process.env.CODACHI_QUIET;
  delete process.env.CODACHI_DEBUG;
  const mod = await import('./log.js');
  logError = mod.logError;
  logWarn = mod.logWarn;
  logDebug = mod.logDebug;
});

afterEach(() => {
  process.env = { ...savedEnv };
});

describe('logError', () => {
  it('writes error with scope to log file', () => {
    logError('test.scope', new Error('boom'));
    expect(fs.appendFileSync).toHaveBeenCalledTimes(1);
    const line = (fs.appendFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(line).toContain('ERROR');
    expect(line).toContain('test.scope');
    expect(line).toContain('boom');
  });

  it('handles non-Error values', () => {
    logError('scope', 'string error');
    const line = (fs.appendFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(line).toContain('string error');
  });

  it('handles null/undefined', () => {
    logError('scope', null);
    const line = (fs.appendFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(line).toContain('null');
  });

  it('includes stack trace from Error objects', () => {
    const err = new Error('with stack');
    logError('scope', err);
    const line = (fs.appendFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(line).toContain('with stack');
  });

  it('creates log directory', () => {
    logError('scope', 'msg');
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('codachi'), { recursive: true });
  });
});

describe('logWarn', () => {
  it('writes WARN level', () => {
    logWarn('cfg', 'bad value');
    const line = (fs.appendFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(line).toContain('WARN');
    expect(line).toContain('cfg');
    expect(line).toContain('bad value');
  });
});

describe('logDebug', () => {
  it('is silent by default (CODACHI_DEBUG not set)', async () => {
    // Re-import with no DEBUG
    vi.resetModules();
    delete process.env.CODACHI_DEBUG;
    const mod = await import('./log.js');
    mod.logDebug('scope', 'verbose');
    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });
});

describe('CODACHI_QUIET', () => {
  it('suppresses all logging when set', async () => {
    vi.resetModules();
    process.env.CODACHI_QUIET = '1';
    const mod = await import('./log.js');
    mod.logError('scope', 'should not appear');
    mod.logWarn('scope', 'should not appear');
    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });
});

describe('log rotation', () => {
  it('rotates when file exceeds 256KB', () => {
    vi.mocked(fs.statSync).mockReturnValue({ size: 300 * 1024 } as fs.Stats);
    logError('scope', 'msg');
    expect(fs.renameSync).toHaveBeenCalledWith(
      expect.stringContaining('codachi.log'),
      expect.stringContaining('codachi.log.1'),
    );
  });

  it('does not rotate when file is small', () => {
    vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);
    logError('scope', 'msg');
    expect(fs.renameSync).not.toHaveBeenCalled();
  });
});

describe('resilience', () => {
  it('does not throw when fs operations fail', () => {
    vi.mocked(fs.mkdirSync).mockImplementation(() => { throw new Error('EPERM'); });
    expect(() => logError('scope', 'msg')).not.toThrow();
  });
});
