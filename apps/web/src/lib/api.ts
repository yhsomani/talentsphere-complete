import { clearSession, getToken } from './session.js';

/**
 * fetch for authenticated API calls: attaches the session token and gives
 * 401 exactly one meaning.
 *
 * 401 = the session is no longer valid (expired, revoked, or the API
 * restarted and reissued its signing key). The stale token is cleared and
 * the browser returns to sign-in with the current destination preserved in
 * ?return=, so the user is never parked on a protected page whose every
 * request can only fail.
 *
 * 403 is deliberately NOT handled here: it means "you lack this feature",
 * which callers surface inline without destroying the session.
 *
 * The login endpoint must NOT use this helper — for it, 401 means
 * "wrong credentials", not "dead session".
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && token) {
    clearSession();
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/login?return=${encodeURIComponent(returnTo)}`);
  }
  return res;
}
