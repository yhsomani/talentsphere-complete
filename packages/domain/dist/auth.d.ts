import { Role } from './core.js';
/**
 * Hashes a plaintext password using PBKDF2 with a cryptographically secure random salt.
 * Stored in format: salt:hash
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verifies a plaintext password against a stored salt:hash string using constant-time comparison.
 */
export declare function verifyPassword(password: string, storedHash: string): Promise<boolean>;
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
 * Creates a signed session token using HMAC-SHA256.
 */
export declare function createSessionToken(userId: string, email: string, roles: Role[], ttlSeconds?: number): string;
/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export declare function verifySessionToken(token: string): AuthPayload | null;
//# sourceMappingURL=auth.d.ts.map