import { describe, expect, it } from 'vitest';
import {
  LOGIN_ACCOUNT_FAILURE_WINDOW_MS,
  loginFailureDecision,
  recentLoginFailures,
} from '../../packages/domain/src/auth.js';

describe('per-account sign-in failure throttle (C-23)', () => {
  it('refuses once the failures in the window reach the cap', () => {
    expect(loginFailureDecision(0, 3)).toBe('allow');
    expect(loginFailureDecision(2, 3)).toBe('allow');
    expect(loginFailureDecision(3, 3)).toBe('refuse');
    expect(loginFailureDecision(4, 3)).toBe('refuse');
  });

  it('keeps only failures younger than the 15-minute window', () => {
    const now = 1_000_000_000;
    const times = [
      now - LOGIN_ACCOUNT_FAILURE_WINDOW_MS,
      now - LOGIN_ACCOUNT_FAILURE_WINDOW_MS + 1,
      now,
    ];
    expect(recentLoginFailures(times, now)).toEqual([
      now - LOGIN_ACCOUNT_FAILURE_WINDOW_MS + 1,
      now,
    ]);
    expect(LOGIN_ACCOUNT_FAILURE_WINDOW_MS).toBe(15 * 60 * 1000);
  });
});
