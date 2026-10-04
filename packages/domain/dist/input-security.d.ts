/**
 * Throws VALIDATION_FAILED if a raw string looks like it was meant to escape
 * its SQL context. Use this on values that flow into query-building code as a
 * defense-in-depth tripwire; the primary defense remains parameterized
 * queries ($1/$2 placeholders) everywhere in the data layer.
 */
export declare function assertNoSqlInjection(value: string, field?: string): void;
export declare function assertSafeSqlIdentifier(name: string, field?: string): void;
/**
 * Context-aware HTML entity escaping for user-generated content rendered into
 * the DOM (comments, usernames, display names). Never interpolate unescaped
 * user data into innerHTML/dangerouslySetInnerHTML.
 */
export declare function escapeHtml(input: string): string;
export declare function assertNoXssPayload(value: string, field?: string): void;
/** Only these schemes may ever be fetched server-side on behalf of a user. */
export declare const ALLOWED_URL_SCHEMES: ReadonlyArray<string>;
/**
 * Host allow-list for outbound fetches. In production this comes from
 * configuration; requests to any host outside this list are rejected before a
 * socket is opened. Extend via env-driven config, never via user input.
 */
export declare const DEFAULT_OUTBOUND_HOST_ALLOWLIST: ReadonlyArray<string>;
/**
 * True for IPv4 literals that must never be reached from a user-controlled URL:
 * loopback, RFC1918, link-local (includes the 169.254.169.254 cloud metadata
 * endpoint), CGNAT, and unspecified address.
 */
export declare function isPrivateIpv4(host: string): boolean;
/**
 * Validates a user-supplied URL for server-side fetching. Deny-by-default:
 * - https/http only (blocks file://, gopher://, dict://);
 * - no embedded credentials;
 * - blocks localhost/.internal/.local/.corp and raw private IP literals;
 * - optional strict host allow-list (recommended in production).
 * Returns the canonical URL string on success.
 */
export declare function validateOutboundUrl(raw: string, hostAllowlist?: ReadonlyArray<string>): string;
//# sourceMappingURL=input-security.d.ts.map