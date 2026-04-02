import fs from 'node:fs';
import path from 'node:path';

export interface ProjectInfo {
  name: string;       // directory basename
  lang: string | null; // detected language/framework
}

const DETECTORS: Array<{ file: string; lang: string }> = [
  { file: 'Cargo.toml', lang: 'Rust' },
  { file: 'go.mod', lang: 'Go' },
  { file: 'pyproject.toml', lang: 'Python' },
  { file: 'requirements.txt', lang: 'Python' },
  { file: 'Pipfile', lang: 'Python' },
  { file: 'package.json', lang: 'Node' },
  { file: 'deno.json', lang: 'Deno' },
  { file: 'Gemfile', lang: 'Ruby' },
  { file: 'pom.xml', lang: 'Java' },
  { file: 'build.gradle', lang: 'Java' },
  { file: 'build.gradle.kts', lang: 'Kotlin' },
  { file: 'mix.exs', lang: 'Elixir' },
  { file: 'pubspec.yaml', lang: 'Dart' },
  { file: 'Package.swift', lang: 'Swift' },
  { file: 'CMakeLists.txt', lang: 'C/C++' },
  { file: 'Makefile', lang: 'Make' },
  { file: 'flake.nix', lang: 'Nix' },
  { file: 'docker-compose.yml', lang: 'Docker' },
  { file: 'docker-compose.yaml', lang: 'Docker' },
  { file: 'Dockerfile', lang: 'Docker' },
  { file: 'Terraform', lang: 'Terraform' },
];

export function getProjectInfo(cwd?: string): ProjectInfo {
  const dir = cwd || process.cwd();
  const name = path.basename(dir);

  let lang: string | null = null;
  for (const det of DETECTORS) {
    try {
      fs.accessSync(path.join(dir, det.file));
      lang = det.lang;
      break;
    } catch {
      // not found, try next
    }
  }

  return { name, lang };
}
