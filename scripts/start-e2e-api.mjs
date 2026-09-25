import { buildApp } from '../apps/api/dist/server.js';

async function start() {
  const app = await buildApp({
    NODE_ENV: 'test',
    PORT: '4000',
    HOST: '127.0.0.1',
    LOG_LEVEL: 'error',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
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
