/**
 * The session cookie (ADR-019, docs/engineering/DECISIONS.md). The API sets
 * the signed session token as an httpOnly cookie, so page script cannot read
 * it, and still accepts the `Authorization: Bearer` header for API clients.
 *
 * A cookie is sent by the browser on its own, so a state-changing request
 * authenticated by the cookie must also carry `X-TalentSphere-CSRF: 1` (a
 * cross-site form cannot set a header, and a cross-site script cannot send
 * one without passing CORS) and, when the browser names an Origin, come from
 * an allowed one.
 */
import type { IncomingHttpHeaders } from 'node:http';

export const SESSION_COOKIE = 'ts_session';
export const CSRF_HEADER = 'x-talentsphere-csrf';
/** Matches the session token's own lifetime (createSessionToken's default). */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 86400;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** The value of one cookie from a Cookie header, or null. */
export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    const value = part.slice(eq + 1).trim();
    try {
      return value ? decodeURIComponent(value) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export type SessionTokenSource = { token: string; via: 'bearer' | 'cookie' };

/** The request's session token: the Bearer header wins, then the cookie. */
export function sessionTokenOf(headers: IncomingHttpHeaders): SessionTokenSource | null {
  const auth = headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    const token = auth.substring(7).trim();
    return token ? { token, via: 'bearer' } : null;
  }
  const cookie = readCookie(headers.cookie, SESSION_COOKIE);
  return cookie ? { token: cookie, via: 'cookie' } : null;
}

/**
 * Why a cookie-authenticated request is refused as a possible cross-site
 * request forgery, or null when it may proceed. Bearer requests never reach
 * this: a browser does not attach a header by itself.
 */
export function cookieCsrfProblem(
  method: string,
  headers: IncomingHttpHeaders,
  allowedOrigins: readonly string[]
): string | null {
  if (SAFE_METHODS.has(method.toUpperCase())) return null;
  if (headers[CSRF_HEADER] !== '1') {
    return 'This request needs the X-TalentSphere-CSRF header.';
  }
  const origin = headers.origin;
  if (typeof origin === 'string' && !allowedOrigins.includes(origin)) {
    return 'This request comes from a site that may not use your session.';
  }
  return null;
}

/** Set-Cookie value that stores a session token. */
export function sessionCookie(token: string, secure: boolean): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}

/** Set-Cookie value that removes the session cookie. */
export function clearedSessionCookie(secure: boolean): string {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}
