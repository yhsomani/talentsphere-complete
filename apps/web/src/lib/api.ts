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

/** A non-2xx API response, carrying the server's own explanation. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * apiFetch + JSON in one step. Resolves with the parsed body on 2xx; throws
 * ApiError with the API's error-envelope message otherwise (or a plain,
 * honest fallback when the server sent none). Callers render `err.message`.
 */
export async function apiJson<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await apiFetch(input, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Could not reach TalentSphere. Check your connection and try again.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.message ?? `The request failed (HTTP ${res.status}).`,
      body?.error?.code,
      body?.error?.details
    );
  }
  return body as T;
}

/** Message to show for any thrown value from apiJson. */
export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';
