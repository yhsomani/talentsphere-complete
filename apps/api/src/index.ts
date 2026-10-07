import { buildApp } from './server.js';
import { validateServerEnv } from '@talentsphere/config';

async function main() {
  const env = validateServerEnv();
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
