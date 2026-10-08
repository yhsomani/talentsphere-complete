import { describe, it, expect, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

// Phase 1 boot honesty: STORAGE=pg must fail fast when Postgres is
// unreachable, and the memory mode must report "no database" rather than
// claim connectivity it does not have.
describe('Storage boot honesty (Phase 1: pg fails fast, memory is explicit)', () => {
  const openApps: FastifyInstance[] = [];

  afterAll(async () => {
    for (const app of openApps) {
      await app.close();
    }
  });

  it('refuses to boot when STORAGE=pg cannot reach the database (no silent fallback)', async () => {
    await expect(
      buildApp({
        NODE_ENV: 'test',
        LOG_LEVEL: 'error',
        STORAGE: 'pg',
        // Nothing listens on localhost:1, so this fails fast and stays offline.
        DATABASE_URL: 'postgresql://postgres:invalid@127.0.0.1:1/talentsphere_none',
      })
      // Generous timeout: connection refusal is instant, but a firewall drop
      // would otherwise hit vitest's 5s default.
    ).rejects.toThrow(/Database unreachable at boot/);
  }, 15_000);

  it('health-diagnostics reports no database under the memory mode', async () => {
    const app = await buildApp({ NODE_ENV: 'test', LOG_LEVEL: 'error' });
    openApps.push(app);
    const adminToken = createSessionToken(
      '00000000-0000-4000-a000-000000000099',
      'admin.storage@talentsphere.internal',
      ['platform_admin']
    );

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/health-diagnostics',
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).toBe(200);
    const { diagnostics } = res.json();
    // Memory mode has no database — it must say so, not claim connectivity.
    expect(diagnostics.database).toBe('disconnected');
    expect(diagnostics.status).toBe('degraded');
  });
});
