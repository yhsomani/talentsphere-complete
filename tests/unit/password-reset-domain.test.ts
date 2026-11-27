import { describe, expect, it } from 'vitest';
import {
  hashPasswordResetToken,
  issuePasswordResetToken,
  passwordResetSendDecision,
  passwordResetTokenUsable,
  PASSWORD_RESET_MAX_PER_HOUR,
  PASSWORD_RESET_TTL_MS,
} from '../../packages/domain/src/auth.js';
import { MemoryPasswordResetStore } from '../../apps/api/src/storage/password-reset-store.js';
import { renderTemplate } from '../../apps/worker/src/email/templates.js';

// Password reset (ADR-019): hashed, single-use, 30-minute tokens.
describe('password reset tokens (ADR-019)', () => {
  it('stores only the hash of a random token, valid for 30 minutes', () => {
    const now = Date.parse('2026-11-27T10:00:00Z');
    const { token, record } = issuePasswordResetToken('user-1', now);
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(record.tokenHash).toBe(hashPasswordResetToken(token));
    expect(record.tokenHash).not.toContain(token);
    expect(JSON.stringify(record)).not.toContain(token);
    expect(Date.parse(record.expiresAt) - now).toBe(PASSWORD_RESET_TTL_MS);
    expect(PASSWORD_RESET_TTL_MS).toBe(30 * 60 * 1000);
    expect(passwordResetTokenUsable(record, now + PASSWORD_RESET_TTL_MS - 1)).toBe(true);
    expect(passwordResetTokenUsable(record, now + PASSWORD_RESET_TTL_MS)).toBe(false);
    expect(issuePasswordResetToken('user-1', now).token).not.toBe(token);
  });

  it('sends at most three links an hour to one account', () => {
    expect(PASSWORD_RESET_MAX_PER_HOUR).toBe(3);
    expect(passwordResetSendDecision(2)).toBe('send');
    expect(passwordResetSendDecision(3)).toBe('skip');
  });

  it('a token can be claimed once, and invalidating a user ends the rest', async () => {
    const store = new MemoryPasswordResetStore();
    const a = issuePasswordResetToken('user-1');
    const b = issuePasswordResetToken('user-1');
    await store.create(a.record);
    await store.create(b.record);
    const now = new Date().toISOString();
    expect(await store.countSince('user-1', new Date(Date.now() - 60_000).toISOString())).toBe(2);
    expect((await store.claim(a.record.tokenHash, now))?.userId).toBe('user-1');
    expect(await store.claim(a.record.tokenHash, now)).toBeNull();
    await store.invalidateUser('user-1', now);
    expect(await store.claim(b.record.tokenHash, now)).toBeNull();
    await store.eraseUser('user-1');
    expect(await store.countSince('user-1', new Date(0).toISOString())).toBe(0);
  });

  it('the email puts the token in the link fragment', () => {
    const r = renderTemplate(
      {
        templateId: 'auth.password_reset',
        variables: { token: 'tok_abc', expiresAt: '2026-11-27T10:30:00.000Z' },
      },
      'https://app.example.test'
    );
    expect(r.subject).toBe('Reset your TalentSphere password');
    expect(r.text).toContain('https://app.example.test/reset-password#token=tok_abc');
    expect(r.text).toContain('ignore this email');
    expect(() =>
      renderTemplate({ templateId: 'auth.password_reset', variables: { token: 'x' } }, 'u')
    ).toThrow(/expiresAt/);
  });
});
