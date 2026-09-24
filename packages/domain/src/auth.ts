import crypto from 'node:crypto';
import { Role } from './index.js';

const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

/**
 * Hashes a plaintext password using PBKDF2 with a cryptographically secure random salt.
 * Stored in format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a plaintext password against a stored salt:hash string using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return resolve(false);

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return resolve(false);
      const derivedHex = derivedKey.toString('hex');
      try {
        const hashBuf = Buffer.from(hash, 'hex');
        const derivedBuf = Buffer.from(derivedHex, 'hex');
        if (hashBuf.length !== derivedBuf.length) return resolve(false);
        resolve(crypto.timingSafeEqual(hashBuf, derivedBuf));
      } catch {
        resolve(false);
      }
    });
  });
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

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'talentsphere_local_secret_must_be_32_bytes_min!';

/**
 * Creates a signed session token using HMAC-SHA256.
 */
export function createSessionToken(userId: string, email: string, roles: Role[], ttlSeconds: number = 86400): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + ttlSeconds;
  const payload: AuthPayload = { userId, email, roles, issuedAt, expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url');
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

  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url');
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
