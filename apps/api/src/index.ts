import { buildApp } from './server.js';
import { productionConfigProblems, validateServerEnv } from '@talentsphere/config';

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

async function main() {
  const env = validateServerEnv();
  const problems = productionConfigProblems(env);
  if (problems.length > 0) {
    console.error('Refusing to start with an unsafe production configuration:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  const app = await buildApp();

  try {
    const address = await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`TalentSphere API listening on ${address}`);
  } catch (err) {
    app.log.error(err, 'Failed to start API server');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}
