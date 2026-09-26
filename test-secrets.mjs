/**
 * Shared test-only signing secret.
 *
 * The API signs session tokens with HMAC-SHA256 using TOKEN_SECRET. Anything that
 * mints a token out of band (the Playwright workers, or a test importing the domain
 * package directly) must agree with the API process on that secret, so the test
 * harnesses pin it explicitly instead of relying on the per-process random fallback
 * in packages/domain/src/auth.ts.
 *
 * This value is for local/CI test runs only. It is deliberately not a usable
 * production secret, and nothing reads it outside the test configuration.
 */
export const TEST_TOKEN_SECRET = 'talentsphere_test_only_token_secret_min_32_chars';
