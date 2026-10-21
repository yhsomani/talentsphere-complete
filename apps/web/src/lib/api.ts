import { clearSession, getToken, peekSessionEnded, rememberSessionEnded } from './session.js';

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
    // Say why on the sign-in page (another device ended it, it expired, the
    // account was closed) instead of dropping the person there unexplained.
    let reason: string | undefined;
    try {
      reason = (await res.clone().json())?.error?.message;
    } catch {
      // No JSON body: fall back to the generic wording.
    }
    // Several requests can fail together (an in-app navigation fires a few);
    // one whose body cannot be read must not overwrite another's reason.
    if (typeof reason === 'string' && reason) rememberSessionEnded(reason);
    else if (!peekSessionEnded()) rememberSessionEnded('Your session ended. Sign in again.');
    clearSession();
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/login?return=${encodeURIComponent(returnTo)}`);
  }
  return res;
}

/** "contactEmail" → "Contact email", so a field issue reads as a sentence. */
const fieldLabel = (path: string): string => {
  const words = path
    .replace(/\[\d+\]/g, '')
    .split('.')
    .pop()!
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** First field issue of the API's validation envelope, e.g. "Project url: Invalid url". */
export function validationMessage(details: unknown): string | undefined {
  if (!Array.isArray(details) || details.length === 0) return undefined;
  const first = details[0] as { path?: unknown; message?: unknown };
  if (typeof first?.message !== 'string' || !first.message) return undefined;
  return typeof first.path === 'string' && first.path
    ? `${fieldLabel(first.path)}: ${first.message}`
    : first.message;
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
    // A hung request must end: without a deadline a page sits on its spinner forever.
    res = await apiFetch(input, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(20_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError(0, 'The request timed out. Check your connection and try again.');
    }
    throw new ApiError(0, 'Could not reach TalentSphere. Check your connection and try again.');
  }
  const body = await res.json().catch(() => null);
  if (res.ok && body === null && /text\/html/i.test(res.headers.get('content-type') ?? '')) {
    // A proxy or gateway error page served with 200: callers expect JSON and would
    // otherwise show "Cannot read properties of null" to the person using the app.
    throw new ApiError(
      res.status,
      'TalentSphere sent an unexpected response. Try again in a moment.'
    );
  }
  if (!res.ok) {
    if (res.status === 429) {
      // Refreshing would only spend more of the budget. When the server says
      // how long to wait (Retry-After), say exactly that; otherwise show the
      // server's own explanation.
      const retryAfter = Number(res.headers.get('retry-after'));
      const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
      const wait =
        retryAfter <= 60
          ? plural(Math.ceil(retryAfter), 'second')
          : plural(Math.ceil(retryAfter / 60), 'minute');
      throw new ApiError(
        429,
        Number.isFinite(retryAfter) && retryAfter > 0
          ? `Too many requests right now. Try again in ${wait}.`
          : (body?.error?.message ?? 'Too many requests right now. Wait a moment, then try again.'),
        body?.error?.code ?? 'RATE_LIMIT_EXCEEDED'
      );
    }
    // A 5xx body can carry internals; only an explicit 503 (maintenance, outage) is
    // allowed to speak for itself.
    const masked = res.status >= 500 && res.status !== 503;
    throw new ApiError(
      res.status,
      masked
        ? 'TalentSphere had a problem on its side. Try again in a moment.'
        : (body?.error?.code === 'VALIDATION_FAILED' && validationMessage(body.error.details)) ||
            body?.error?.message ||
            (res.status >= 500
              ? 'TalentSphere had a problem on its side. Try again in a moment.'
              : `The request failed (HTTP ${res.status}).`),
      body?.error?.code,
      body?.error?.details
    );
  }
  return body as T;
}

/** Message to show for any thrown value from apiJson. */
export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';
