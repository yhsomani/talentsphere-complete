// Side-effect module: import it FIRST in the process entry point.
//
// ESM evaluates a module's static imports before its own body, so .env must be
// loaded by a module that is imported ahead of ./server.js. Otherwise modules
// that read process.env at evaluation time (packages/domain/src/auth.ts reads
// TOKEN_SECRET) see the variables as unset while validateServerEnv(), called
// later, sees them set (C-11, A05-007).
//
// Load .env natively (Node process.loadEnvFile): found from the repo root, or
// two levels up when started from apps/api (pnpm --filter dev). A missing file
// is fine — CI and production pass environment variables directly — and values
// already in process.env are never overridden by the file.
for (const candidate of ['.env', '../../.env']) {
  try {
    process.loadEnvFile(candidate);
    break;
  } catch {
    // not here — try the next location
  }
}
