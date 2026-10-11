/**
 * When a session dies, the sign-in page says why (apps/web/src/lib/api.ts).
 *
 * Found with Reticle on 2026-10-11: an in-app navigation fires several
 * requests at once and every one of them gets 401. One whose body could not
 * be read (the page was already leaving for sign-in) overwrote the API's
 * reason with the generic fallback, so the person read "Your session ended"
 * instead of "This session was ended from another device". The order the
 * responses arrive in must not matter.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '../../apps/web/src/lib/api.js';
import { peekSessionEnded } from '../../apps/web/src/lib/session.js';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

const REASON = 'This session was ended from another device. Sign in again.';
const withReason = () =>
  new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: REASON } }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
const unreadable = () => new Response('', { status: 401 });

describe('the sign-in page is told why the session ended', () => {
  beforeEach(() => {
    const local = new MemoryStorage();
    local.setItem('talentsphere_token', 'a-token');
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('sessionStorage', new MemoryStorage());
    vi.stubGlobal('window', {
      location: { pathname: '/evidence', search: '', replace: vi.fn() },
      dispatchEvent: () => true,
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Two requests leave with the token before either answer comes back; the
   * answers then arrive in the given order, each fully handled before the
   * next is released (so the order is the test's, not the microtask queue's).
   */
  async function twoRequests(first: () => Response, second: () => Response) {
    const answer: Array<(res: Response) => void> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>((resolve) => answer.push(resolve)))
    );
    const a = apiFetch('/api/v1/notifications/summary');
    const b = apiFetch('/api/v1/jobs');
    expect(answer).toHaveLength(2);
    answer[0](first());
    await a;
    answer[1](second());
    await b;
  }

  it('keeps the API’s reason when an unreadable 401 arrives after it', async () => {
    await twoRequests(withReason, unreadable);
    expect(peekSessionEnded()).toBe(REASON);
  });

  it('replaces the generic wording when the reason arrives second', async () => {
    await twoRequests(unreadable, withReason);
    expect(peekSessionEnded()).toBe(REASON);
  });

  it('falls back to plain wording when no response says why', async () => {
    await twoRequests(unreadable, unreadable);
    expect(peekSessionEnded()).toBe('Your session ended. Sign in again.');
  });
});
