import crypto from 'node:crypto';
import { Role } from './core.js';

const KEY_LEN = 64;
const DIGEST = 'sha512';
/**
 * OWASP Password Storage Cheat Sheet (2023): PBKDF2-HMAC-SHA512 needs at
 * least 210,000 iterations. The original 10,000 is ~20x too cheap to resist
 * offline guessing of a leaked hash table.
 */
export const PBKDF2_DEFAULT_ITERATIONS = 210_000;
/** Iteration count of hashes written before the versioned format existed. */
const LEGACY_ITERATIONS = 10_000;
const FORMAT = 'pbkdf2-sha512';

/**
 * Work factor for NEW hashes. Read at call time (not module load) so a test
 * run can lower it for speed via PASSWORD_PBKDF2_ITERATIONS; anything below
 * 1,000 is ignored. Stored hashes record their own count, so verification is
 * independent of this setting.
 */
export function configuredPasswordIterations(): number {
  const raw = Number(process.env.PASSWORD_PBKDF2_ITERATIONS);
  return Number.isInteger(raw) && raw >= 1000 ? raw : PBKDF2_DEFAULT_ITERATIONS;
}

interface ParsedHash {
  iterations: number;
  salt: string;
  hash: string;
}

/** `pbkdf2-sha512$<iterations>$<salt>$<hash>`, or legacy `<salt>:<hash>`. */
function parseStoredHash(stored: string): ParsedHash | null {
  if (stored.startsWith(`${FORMAT}$`)) {
    const [, iterations, salt, hash] = stored.split('$');
    const n = Number(iterations);
    if (!Number.isInteger(n) || n < 1 || !salt || !hash) return null;
    return { iterations: n, salt, hash };
  }
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return null;
  return { iterations: LEGACY_ITERATIONS, salt, hash };
}

const derive = (password: string, salt: string, iterations: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LEN, DIGEST, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });

/**
 * Hashes a plaintext password with PBKDF2-HMAC-SHA512 and a random salt.
 * Stored as `pbkdf2-sha512$<iterations>$<salt>$<hash>` so the work factor can
 * be raised later without breaking existing accounts.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = configuredPasswordIterations();
  const key = await derive(password, salt, iterations);
  return `${FORMAT}$${iterations}$${salt}$${key.toString('hex')}`;
}

/**
 * Verifies a password against a stored hash (current or legacy format) using
 * a constant-time comparison. Any malformed stored value verifies as false.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return false;
  try {
    const derived = await derive(password, parsed.salt, parsed.iterations);
    const expected = Buffer.from(parsed.hash, 'hex');
    if (expected.length !== derived.length) return false;
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

/**
 * True when a stored hash is weaker than what hashPassword would write today
 * (legacy format or fewer iterations). Callers re-hash on the next successful
 * sign-in, when the plaintext is briefly available.
 */
export function passwordNeedsRehash(storedHash: string): boolean {
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return false;
  return !storedHash.startsWith(`${FORMAT}$`) || parsed.iterations < configuredPasswordIterations();
}

/**
 * Token payload structure
 */
export interface AuthPayload {
  userId: string;
  email: string;
  roles: Role[];
  issuedAt: number;
  expiresAt: number;
}

/**
 * HMAC key for session token signing.
 *
 * A hardcoded fallback would let anyone read a valid signing key out of the source
 * tree and mint a token with arbitrary `roles`, which every authorization check in
 * the API trusts. So when TOKEN_SECRET is unset we generate a random per-process
 * key instead: tokens stay unforgeable, and the only cost is that sessions do not
 * survive a restart. Set TOKEN_SECRET to a stable random value (>= 32 bytes) for
 * any environment where sessions must outlive the process.
 */
const TOKEN_SECRET =
  process.env.TOKEN_SECRET && process.env.TOKEN_SECRET.length >= 32
    ? process.env.TOKEN_SECRET
    : crypto.randomBytes(48).toString('hex');

/**
 * Creates a signed session token using HMAC-SHA256.
 */
export function createSessionToken(
  userId: string,
  email: string,
  roles: Role[],
  ttlSeconds: number = 86400,
  /** Issue time in ms; defaults to now. Used to mint a token just after a session cut-off. */
  issuedAtMs: number = Date.now()
): string {
  const issuedAt = Math.floor(issuedAtMs / 1000);
  const expiresAt = issuedAt + ttlSeconds;
  const payload: AuthPayload = { userId, email, roles, issuedAt, expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): AuthPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');
  if (signature.length !== expectedSig.length) return null;

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: AuthPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.expiresAt) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
