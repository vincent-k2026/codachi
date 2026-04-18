import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    renameSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
    statSync: vi.fn(() => { throw new Error('ENOENT'); }),
    appendFileSync: vi.fn(),
  },
}));

let atomicWrite: typeof import('./fs-utils.js')['atomicWrite'];

beforeEach(async () => {
  vi.resetAllMocks();
  vi.resetModules();
  const mod = await import('./fs-utils.js');
  atomicWrite = mod.atomicWrite;
});

describe('atomicWrite', () => {
  it('writes to tmp file then renames', () => {
    const result = atomicWrite('/path/to/file.json', '{"a":1}');
    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.tmp.'),
      '{"a":1}',
    );
    expect(fs.renameSync).toHaveBeenCalledWith(
      expect.stringContaining('.tmp.'),
      '/path/to/file.json',
    );
  });

  it('includes unique id in tmp filename', () => {
    atomicWrite('/path/file', 'data');
    const tmpPath = vi.mocked(fs.writeFileSync).mock.calls[0][0] as string;
    expect(tmpPath).toMatch(/\.tmp\.[0-9a-f-]{36}$/);
  });

  it('returns false and cleans up on write failure', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => { throw new Error('ENOSPC'); });
    const result = atomicWrite('/path/file', 'data');
    expect(result).toBe(false);
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('returns false on rename failure', () => {
    vi.mocked(fs.renameSync).mockImplementation(() => { throw new Error('EXDEV'); });
    const result = atomicWrite('/path/file', 'data');
    expect(result).toBe(false);
  });

  it('survives cleanup failure (unlinkSync throws)', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => { throw new Error('ENOSPC'); });
    vi.mocked(fs.unlinkSync).mockImplementation(() => { throw new Error('ENOENT'); });
    expect(() => atomicWrite('/path/file', 'data')).not.toThrow();
  });
});
