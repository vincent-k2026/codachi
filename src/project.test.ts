import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { getProjectInfo } from './project.js';

vi.mock('node:fs', () => ({
  default: {
    accessSync: vi.fn(),
  },
}));

const mockAccessSync = vi.mocked(fs.accessSync);

beforeEach(() => {
  vi.resetAllMocks();
  // Default: no marker files found
  mockAccessSync.mockImplementation(() => { throw new Error('ENOENT'); });
});

describe('getProjectInfo', () => {
  it('returns directory name', () => {
    const info = getProjectInfo('/home/user/myproject');
    expect(info.name).toBe('myproject');
  });

  it('returns null lang when no markers found', () => {
    const info = getProjectInfo('/tmp/empty');
    expect(info.lang).toBeNull();
  });

  it('detects Rust project', () => {
    mockAccessSync.mockImplementation((p) => {
      if (String(p).endsWith('Cargo.toml')) return undefined;
      throw new Error('ENOENT');
    });
    const info = getProjectInfo('/tmp/myrust');
    expect(info.lang).toBe('Rust');
  });

  it('detects Go project', () => {
    mockAccessSync.mockImplementation((p) => {
      if (String(p).endsWith('go.mod')) return undefined;
      throw new Error('ENOENT');
    });
    expect(getProjectInfo('/tmp/mygo').lang).toBe('Go');
  });

  it('detects Node project', () => {
    mockAccessSync.mockImplementation((p) => {
      if (String(p).endsWith('package.json')) return undefined;
      throw new Error('ENOENT');
    });
    expect(getProjectInfo('/tmp/mynode').lang).toBe('Node');
  });

  it('detects Python project from pyproject.toml', () => {
    mockAccessSync.mockImplementation((p) => {
      if (String(p).endsWith('pyproject.toml')) return undefined;
      throw new Error('ENOENT');
    });
    expect(getProjectInfo('/tmp/mypy').lang).toBe('Python');
  });

  it('detects Docker project', () => {
    mockAccessSync.mockImplementation((p) => {
      if (String(p).endsWith('Dockerfile')) return undefined;
      throw new Error('ENOENT');
    });
    expect(getProjectInfo('/tmp/mydocker').lang).toBe('Docker');
  });

  it('returns first matching detector (priority order)', () => {
    // If both Cargo.toml and package.json exist, Cargo.toml wins (checked first)
    mockAccessSync.mockImplementation(() => undefined); // all files "exist"
    expect(getProjectInfo('/tmp/multi').lang).toBe('Rust');
  });
});
