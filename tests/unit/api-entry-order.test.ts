import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// C-11 (A05-007): packages/domain/src/auth.ts reads TOKEN_SECRET when the
// module is evaluated. ESM evaluates static imports in source order before the
// importing module's body, so .env has to be loaded by a side-effect module
// imported ahead of ./server.js — loading it in index.ts's body is too late and
// silently gives the process a random signing key.
describe('API entry point loads .env before anything reads process.env (C-11)', () => {
  const entry = fs.readFileSync(path.resolve('apps/api/src/index.ts'), 'utf8');

  it("imports './load-env.js' first", () => {
    const imports = entry.match(/^import\s.*$/gm) ?? [];
    expect(imports[0]).toBe("import './load-env.js';");
  });

  it('no longer loads .env in its own body', () => {
    expect(entry).not.toMatch(/loadEnvFile/);
  });

  it('load-env reads .env from the working directory without overriding set variables', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-load-env-'));
    try {
      fs.writeFileSync(path.join(dir, '.env'), 'C11_FROM_FILE=file\nC11_ALREADY_SET=file\n');
      const loader = path.resolve('apps/api/src/load-env.ts');
      const out = execFileSync(
        process.execPath,
        [
          '--experimental-strip-types',
          '--no-warnings',
          '--input-type=module',
          '-e',
          `await import(${JSON.stringify(loader)}); console.log(JSON.stringify([process.env.C11_FROM_FILE, process.env.C11_ALREADY_SET]));`,
        ],
        { cwd: dir, env: { PATH: process.env.PATH, C11_ALREADY_SET: 'process' }, encoding: 'utf8' }
      );
      expect(JSON.parse(out.trim())).toEqual(['file', 'process']);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
