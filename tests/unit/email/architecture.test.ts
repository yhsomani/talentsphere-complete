import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '../../..');
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(e)) out.push(p);
  }
  return out;
}
const sources = ['apps', 'packages'].flatMap((d) => walk(join(root, d)));

describe('email architecture guard', () => {
  it('keeps vendor endpoints and credentials inside the Brevo adapter', () => {
    const allowed = new Set([
      'apps/worker/src/email/brevo.ts',
      'apps/worker/src/email/config.ts',
      'packages/config/src/env.ts',
    ]);
    const offenders = sources
      .filter((f) => /api\.brevo\.com|BREVO_API_KEY|api-key/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(root, f))
      .filter((f) => !allowed.has(f));
    expect(offenders).toEqual([]);
  });
  it('has no Resend code left', () => {
    const offenders = sources
      .filter((f) => /resend/i.test(readFileSync(f, 'utf8')))
      .map((f) => relative(root, f));
    expect(offenders).toEqual([]);
  });
});
