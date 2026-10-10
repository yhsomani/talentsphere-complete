import { afterEach, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import {
  PBKDF2_DEFAULT_ITERATIONS,
  configuredPasswordIterations,
  hashPassword,
  passwordNeedsRehash,
  verifyPassword,
} from '../../packages/domain/src/auth.js';

const legacyHash = (password: string): string => {
  // The pre-2026-10 format: `salt:hash`, PBKDF2-SHA512, 10,000 iterations.
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(password, salt, 10_000, 64, 'sha512');
  return `${salt}:${key.toString('hex')}`;
};

describe('Password hashing (OWASP work factor, versioned format)', () => {
  const original = process.env.PASSWORD_PBKDF2_ITERATIONS;
  afterEach(() => {
    if (original === undefined) delete process.env.PASSWORD_PBKDF2_ITERATIONS;
    else process.env.PASSWORD_PBKDF2_ITERATIONS = original;
  });

  it('defaults to 210,000 PBKDF2-SHA512 iterations when not overridden', () => {
    delete process.env.PASSWORD_PBKDF2_ITERATIONS;
    expect(PBKDF2_DEFAULT_ITERATIONS).toBe(210_000);
    expect(configuredPasswordIterations()).toBe(210_000);
  });

  it('ignores an override below 1,000 iterations', () => {
    process.env.PASSWORD_PBKDF2_ITERATIONS = '10';
    expect(configuredPasswordIterations()).toBe(210_000);
  });

  it('writes a self-describing hash that verifies only the right password', async () => {
    process.env.PASSWORD_PBKDF2_ITERATIONS = '2000';
    const stored = await hashPassword('correct horse battery staple');
    expect(stored).toMatch(/^pbkdf2-sha512\$2000\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(await verifyPassword('correct horse battery staple', stored)).toBe(true);
    expect(await verifyPassword('correct horse battery stapl', stored)).toBe(false);
  });

  it('still verifies legacy hashes and flags them for re-hashing', async () => {
    process.env.PASSWORD_PBKDF2_ITERATIONS = '2000';
    const stored = legacyHash('old-account-password');
    expect(await verifyPassword('old-account-password', stored)).toBe(true);
    expect(await verifyPassword('wrong', stored)).toBe(false);
    expect(passwordNeedsRehash(stored)).toBe(true);
  });

  it('flags hashes written at a lower work factor than the current one', async () => {
    process.env.PASSWORD_PBKDF2_ITERATIONS = '2000';
    const stored = await hashPassword('pw-under-old-factor');
    expect(passwordNeedsRehash(stored)).toBe(false);
    process.env.PASSWORD_PBKDF2_ITERATIONS = '4000';
    expect(passwordNeedsRehash(stored)).toBe(true);
    // ...and the hash still verifies: it records its own iteration count.
    expect(await verifyPassword('pw-under-old-factor', stored)).toBe(true);
  });

  it('never verifies a malformed or erased credential', async () => {
    for (const stored of [
      '',
      '!erased',
      'pbkdf2-sha512$x$y$z',
      'nocolon',
      'pbkdf2-sha512$1000$$',
    ]) {
      expect(await verifyPassword('anything', stored)).toBe(false);
    }
  });
});
