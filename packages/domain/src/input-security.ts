/**
 * Input Security Firewall — shared defenses for the classic injection classes
 * that "vibe-coded" apps ship with (SQL injection, XSS, SSRF).
 *
 * Design rules (docs/quality/SECURITY.md §5 Threat Model):
 * 1. User input is DATA, never executable syntax. Anything destined for a SQL
 *    string context or an outbound URL must pass through this module first.
 * 2. Validation is deny-by-default: identifiers use strict allow-list regexes,
 *    URLs are validated against a scheme/host allow-list and private address
 *    ranges are blocked before any fetch is attempted.
 * 3. Output escaping is explicit so templating layers can be audited.
 */
import { DomainError } from './core.js';

// ---------------------------------------------------------------------------
// SQL Injection defense
// ---------------------------------------------------------------------------

/**
 * Canonical SQL injection payloads used by attackers and by our own test
 * suites. Detection is intentionally conservative: it flags tautologies,
 * comment terminators, stacked queries, and common exfiltration primitives
 * when they appear in a raw user-supplied string.
 */
const SQL_INJECTION_PATTERNS: ReadonlyArray<RegExp> = [
  /(\bor\b|\band\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, // ' OR '1'='1  /  " OR 1=1
  /'\s*(\s*(or|and)\s*)?[\d'"]*\s*=\s*[\d'"]+/i, // ' OR 1=1, '-- style quote breaking
  /;\s*(drop|delete|insert|update|alter|truncate|create)\s+/i, // stacked queries
  /(--|#|\/\*)/, // SQL comment terminators
  /\bunion\b[\s\S]*\bselect\b/i, // UNION-based exfiltration
  /\bselect\b[\s\S]+\bfrom\b[\s\S]+\blimit\b/i, // raw SELECT fragments
  /\b(drop|truncate)\s+table\b/i,
  /\bsleep\s*\(\s*\d+\s*\)/i, // time-based blind injection
  /\bbenchmark\s*\(/i,
  /\binformation_schema\b/i,
  /\bxp_cmdshell\b/i,
];

/**
 * Throws VALIDATION_FAILED if a raw string looks like it was meant to escape
 * its SQL context. Use this on values that flow into query-building code as a
 * defense-in-depth tripwire; the primary defense remains parameterized
 * queries ($1/$2 placeholders) everywhere in the data layer.
 */
export function assertNoSqlInjection(value: string, field = 'input'): void {
  if (typeof value !== 'string') {
    throw new DomainError('VALIDATION_FAILED', `${field} must be a string.`);
  }
  const candidate = value.trim();
  if (candidate.length === 0) return;

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(candidate)) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `${field} contains prohibited SQL syntax patterns. Queries must use parameterized statements.`
      );
    }
  }
}

/**
 * Strict allow-list validator for SQL IDENTIFIERS (table/column names, ORDER BY
 * directions). Identifiers cannot be parameterized, so the only safe approach is
 * to accept a known-good shape or reject outright.
 */
const SQL_IDENTIFIER_RE = /^[a-z_][a-z0-9_]{0,62}$/;

export function assertSafeSqlIdentifier(name: string, field = 'identifier'): void {
  if (typeof name !== 'string' || !SQL_IDENTIFIER_RE.test(name.toLowerCase())) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `${field} is not a permitted SQL identifier (expected lowercase letters, digits, underscores).`
    );
  }
}

// ---------------------------------------------------------------------------
// XSS defense
// ---------------------------------------------------------------------------

const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

/**
 * Context-aware HTML entity escaping for user-generated content rendered into
 * the DOM (comments, usernames, display names). Never interpolate unescaped
 * user data into innerHTML/dangerouslySetInnerHTML.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    throw new DomainError('VALIDATION_FAILED', 'Content to escape must be a string.');
  }
  return input.replace(/[&<>"'`]/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * Rejects strings containing raw script/event-handler payloads before they are
 * stored. Complements escapeHtml() — storage should be clean AND rendering must
 * still escape, because filters can be bypassed but output encoding cannot.
 */
const XSS_PATTERNS: ReadonlyArray<RegExp> = [
  /<\s*script\b/i,
  /<\/\s*script\s*>/i,
  /javascript\s*:/i,
  /on(error|load|click|mouseover|focus)\s*=/i,
  /<\s*(iframe|object|embed|svg)\b/i,
  /document\s*\.\s*cookie/i,
];

export function assertNoXssPayload(value: string, field = 'input'): void {
  if (typeof value !== 'string') {
    throw new DomainError('VALIDATION_FAILED', `${field} must be a string.`);
  }
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(value)) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `${field} contains prohibited markup or script payloads.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// SSRF defense
// ---------------------------------------------------------------------------

/** Only these schemes may ever be fetched server-side on behalf of a user. */
export const ALLOWED_URL_SCHEMES: ReadonlyArray<string> = ['https:', 'http:'];

/**
 * Host allow-list for outbound fetches. In production this comes from
 * configuration; requests to any host outside this list are rejected before a
 * socket is opened. Extend via env-driven config, never via user input.
 */
export const DEFAULT_OUTBOUND_HOST_ALLOWLIST: ReadonlyArray<string> = [
  'api.openai.com',
  'api.anthropic.com',
  'hooks.stripe.com',
  'cdn.talentsphere.example',
];

const PRIVATE_HOSTNAMES: ReadonlySet<string> = new Set([
  'localhost',
  'internal',
  'metadata.google.internal',
  'metadata',
]);

/**
 * True for IPv4 literals that must never be reached from a user-controlled URL:
 * loopback, RFC1918, link-local (includes the 169.254.169.254 cloud metadata
 * endpoint), CGNAT, and unspecified address.
 */
export function isPrivateIpv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const octets = m.slice(1).map(Number);
  if (octets.some((o) => o > 255)) return true; // malformed → treat as hostile
  const [a, b] = octets;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // RFC1918
  if (a === 0) return true; // unspecified
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIpv6Literal(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h.includes(':')) return false;
  if (h === '::1' || h === '::') return true;
  if (/^f[cd]/.test(h) || /^fe[89ab]/.test(h)) return true; // ULA / link-local
  const v4 = h.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4 && isPrivateIpv4(v4[1])) return true; // ::ffff:127.0.0.1 style
  return false;
}

/**
 * Validates a user-supplied URL for server-side fetching. Deny-by-default:
 * - https/http only (blocks file://, gopher://, dict://);
 * - no embedded credentials;
 * - blocks localhost/.internal/.local/.corp and raw private IP literals;
 * - optional strict host allow-list (recommended in production).
 * Returns the canonical URL string on success.
 */
export function validateOutboundUrl(
  raw: string,
  hostAllowlist: ReadonlyArray<string> = DEFAULT_OUTBOUND_HOST_ALLOWLIST
): string {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'URL must be a non-empty string.');
  }

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new DomainError('VALIDATION_FAILED', 'URL is malformed and was rejected.');
  }

  if (!ALLOWED_URL_SCHEMES.includes(url.protocol)) {
    throw new DomainError('POLICY_VIOLATION', `URL scheme ${url.protocol} is not permitted.`);
  }
  if (url.username || url.password) {
    throw new DomainError('POLICY_VIOLATION', 'URLs with embedded credentials are not permitted.');
  }

  const host = url.hostname.toLowerCase();

  if (PRIVATE_HOSTNAMES.has(host)) {
    throw new DomainError('POLICY_VIOLATION', 'Requests to internal/private hosts are blocked.');
  }
  if (/\.(local|internal|corp|lan)$/.test(host)) {
    throw new DomainError('POLICY_VIOLATION', 'Requests to internal/private hosts are blocked.');
  }
  if (isPrivateIpv4(host) || isPrivateIpv6Literal(host)) {
    throw new DomainError(
      'POLICY_VIOLATION',
      'Requests to private or reserved IP addresses are blocked.'
    );
  }

  if (hostAllowlist.length > 0 && !hostAllowlist.includes(host)) {
    throw new DomainError('POLICY_VIOLATION', `Host ${host} is not on the outbound allow-list.`);
  }

  return url.toString();
}
