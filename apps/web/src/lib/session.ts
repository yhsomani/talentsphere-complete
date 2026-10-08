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

export const storeSession = (token: string, user: StoredUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage unavailable (private mode): nothing durable to clear.
  }
};
