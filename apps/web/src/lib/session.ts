/**
 * Single owner of the client session contract: the two localStorage keys,
 * how a stored user is parsed, and how a session is written or cleared.
 *
 * Every auth read/write routes through here so the raw key strings cannot
 * drift across the app (they were duplicated in eight files), and so
 * "clear the session" has exactly one definition.
 */

export const TOKEN_KEY = 'talentsphere_token';
export const USER_KEY = 'talentsphere_user';

/** The API user payload as persisted by login/register. Fields are optional because pages must tolerate a partial record without crashing. */
export type StoredUser = {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  [key: string]: unknown;
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

/**
 * Why the last session ended without the person signing out (ended from
 * another device, expired, account closed): the API's own explanation, kept
 * for the sign-in page to show once. sessionStorage, so it belongs to this
 * tab and does not outlive it.
 */
const ENDED_KEY = 'talentsphere_session_ended';

export const rememberSessionEnded = (reason: string): void => {
  try {
    sessionStorage.setItem(ENDED_KEY, reason);
  } catch {
    // Storage unavailable: the sign-in page simply shows no reason.
  }
};

/** Read without consuming (safe to call twice, e.g. from a state initializer). */
export const peekSessionEnded = (): string | null => {
  try {
    return sessionStorage.getItem(ENDED_KEY);
  } catch {
    return null;
  }
};

export const forgetSessionEnded = (): void => {
  try {
    sessionStorage.removeItem(ENDED_KEY);
  } catch {
    // Nothing stored.
  }
};

/** Fired on this window whenever the stored session changes (sign-in/out). */
export const SESSION_EVENT = 'talentsphere:session';

const announce = () => {
  try {
    window.dispatchEvent(new Event(SESSION_EVENT));
  } catch {
    // Non-browser environment: nothing listens.
  }
};

export const storeSession = (token: string, user: StoredUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  announce();
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage unavailable (private mode): nothing durable to clear.
  }
  announce();
};

/**
 * Sign out: forget the session on this device at once, then ask the API to
 * end it there too, so a copied token stops working (before 2026-10-11 it
 * stayed valid for up to 24 hours). Fire-and-forget with keepalive: leaving
 * the page, or being offline, must never keep someone signed in here.
 */
export const signOut = (): void => {
  const token = getToken();
  clearSession();
  if (!token) return;
  try {
    void fetch('/api/v1/auth/sign-out', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // No fetch (non-browser environment): nothing to tell the server.
  }
};
