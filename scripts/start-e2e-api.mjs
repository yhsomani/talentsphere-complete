import { buildApp } from '../apps/api/dist/server.js';

// Session tokens are signed with process.env.TOKEN_SECRET, which the domain layer
// reads directly rather than through buildApp's validated env. playwright.config.ts
// pins it for this process; see test-secrets.mjs.

async function start() {
  const app = await buildApp({
    NODE_ENV: 'test',
    PORT: '4000',
    HOST: '127.0.0.1',
    LOG_LEVEL: 'error',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    CORS_ALLOWED_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173',
    RATE_LIMIT_MAX_REQUESTS: '100000',
  });

  const address = await app.listen({ port: 4000, host: '127.0.0.1' });
  console.log(`TalentSphere E2E API listening on ${address}`);
}

start().catch((err) => {
  console.error('Failed to start E2E API server:', err);
  process.exit(1);
});
