import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// C-02: tests/e2e/responsive.spec.ts flags any text whose computed size is below
// 12px. SVG presentation attributes are the computed value here, so every literal
// fontSize in the landing art must be at least 12.
describe('Landing art captions (C-02)', () => {
  it('uses no SVG font size below 12', () => {
    const source = fs.readFileSync(path.resolve('apps/web/src/components/LandingArt.tsx'), 'utf8');
    const sizes = [...source.matchAll(/fontSize="(\d+(?:\.\d+)?)"/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter((size) => size < 12)).toEqual([]);
  });
});
