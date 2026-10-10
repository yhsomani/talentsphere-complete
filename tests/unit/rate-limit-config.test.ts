/**
 * The global rate limiter's defaults and proxy handling (found by driving the
 * running app with Reticle, 2026-10-10): the former default of 100 requests
 * per 15 minutes per address locked a normal user out after ~20 page views,
 * and behind a load balancer every user shared one bucket.
 */
import { describe, expect, it } from 'vitest';
import { validateServerEnv } from '../../packages/config/src/env.js';
import { parseTrustProxy } from '../../apps/api/src/server.js';

describe('global rate limit defaults', () => {
  it('allow an ordinary browsing session (300 requests per minute per account or address)', () => {
    const env = validateServerEnv({});
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(300);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60_000);
  });

  it('reject a zero or negative budget instead of silently blocking everything', () => {
    expect(() => validateServerEnv({ RATE_LIMIT_MAX_REQUESTS: '0' })).toThrow();
    expect(() => validateServerEnv({ RATE_LIMIT_WINDOW_MS: '-1' })).toThrow();
  });
});

describe('TRUST_PROXY parsing', () => {
  it('trusts no proxy unless told to', () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy('')).toBe(false);
    expect(parseTrustProxy('false')).toBe(false);
  });

  it('accepts true, a hop count, or an address list', () => {
    expect(parseTrustProxy('true')).toBe(true);
    const oneHop = parseTrustProxy('1') as (address: string, hop: number) => boolean;
    expect(oneHop('10.0.0.1', 0)).toBe(true);
    expect(oneHop('10.0.0.2', 1)).toBe(false);
    expect(parseTrustProxy('10.0.0.0/8, 192.168.1.1')).toEqual(['10.0.0.0/8', '192.168.1.1']);
  });
});
