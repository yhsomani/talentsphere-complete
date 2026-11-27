/**
 * The web app keeps no session token (ADR-019): the API's httpOnly cookie
 * carries it, every API call sends the CSRF header, and an old token left in
 * localStorage by an earlier version is removed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '../../apps/web/src/lib/api.js';
import { clearSession, hasSession, storeSession } from '../../apps/web/src/lib/session.js';

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

describe('web session without a stored token (ADR-019)', () => {
  let local: MemoryStorage;

  beforeEach(() => {
    local = new MemoryStorage();
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('sessionStorage', new MemoryStorage());
    vi.stubGlobal('window', {
      location: { pathname: '/dashboard', search: '', replace: vi.fn() },
      dispatchEvent: () => true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores the signed-in user only, and drops a token an older version left', () => {
    local.setItem('talentsphere_token', 'old-token');
    expect(hasSession()).toBe(false);
    storeSession({ id: 'u1', email: 'a@example.com' });
    expect(hasSession()).toBe(true);
    expect(local.getItem('talentsphere_token')).toBeNull();
    clearSession();
    expect(hasSession()).toBe(false);
  });

  it('sends the CSRF header and the cookie, never an Authorization header', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    storeSession({ id: 'u1' });
    await apiFetch('/api/v1/auth/session', { method: 'POST' });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('X-TalentSphere-CSRF')).toBe('1');
    expect(headers.has('Authorization')).toBe(false);
    expect(init.credentials).toBe('same-origin');
  });

  it('ends the local session on 401 only when this browser thought it was signed in', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 }))
    );
    await apiFetch('/api/v1/auth/session');
    expect((window.location.replace as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    storeSession({ id: 'u1' });
    await apiFetch('/api/v1/auth/session');
    expect(hasSession()).toBe(false);
    expect((window.location.replace as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
  });
});
