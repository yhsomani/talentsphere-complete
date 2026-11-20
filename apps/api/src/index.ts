import './load-env.js';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './server.js';
import { createShutdown } from './lifecycle.js';
import { productionConfigProblems, validateServerEnv } from '@talentsphere/config';

async function main() {
  const env = validateServerEnv();
  const problems = productionConfigProblems(env);
  if (problems.length > 0) {
    console.error('Refusing to start with an unsafe production configuration:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  let app: FastifyInstance | undefined;
  const shutdown = createShutdown(() => app, {
    log: (level, message) => (app ? app.log[level](message) : console.error(message)),
  });
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
  app = await buildApp(undefined, { onWriterLeaseLost: () => void shutdown('lease_lost') });

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
