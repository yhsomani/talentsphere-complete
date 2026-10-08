import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve('.');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Persistence honesty guards', () => {
  describe('migration runner must actually apply SQL (Phase 1 — D3 replaced)', () => {
    const source = readRepoFile('scripts/migrate.mjs');

    it('requires DATABASE_URL and fails loudly when it is missing', () => {
      expect(source).toMatch(/requireDatabaseUrl/);
      const helper = readRepoFile('scripts/lib/pg.mjs');
      expect(helper).toMatch(/DATABASE_URL is not set/);
      expect(helper).toMatch(/process\.exit\(1\)/);
    });

    it('tracks applied migrations in a schema_migrations ledger', () => {
      expect(source).toMatch(/schema_migrations/);
      expect(source).toMatch(/INSERT INTO schema_migrations/);
    });

    it('runs each migration file inside a transaction with rollback on failure', () => {
      expect(source).toMatch(/BEGIN/);
      expect(source).toMatch(/COMMIT/);
      expect(source).toMatch(/ROLLBACK/);
    });

    it('exits non-zero and reports which file failed, without claiming success for it', () => {
      expect(source).toMatch(/FAILED: \$\{file\}/);
      // Success is only printed after every pending file applied cleanly.
      expect(source).toMatch(/Applied \$\{results\.length\} migration/);
    });

    it('is the apply path (no longer punts to the Supabase CLI)', () => {
      expect(source).not.toMatch(/supabase db push/);
      expect(source).not.toMatch(/REFUSING TO REPORT SUCCESS/);
    });
  });

  describe('seeder must be gated on migrations and run real SQL', () => {
    const source = readRepoFile('scripts/seed.mjs');

    it('refuses to seed before migrations are applied', () => {
      expect(source).toMatch(/Refusing to seed/);
      expect(source).toMatch(/db:migrate/);
    });

    it('executes seed SQL files through the database client', () => {
      expect(source).toMatch(/client\.query\(sql\)/);
      expect(source).not.toMatch(/Seed files validated successfully/);
    });
  });

  describe('Postgres client is a declared dependency (was: asserted absent)', () => {
    it('root tooling declares pg for the migrate/seed scripts', () => {
      const pkg = JSON.parse(readRepoFile('package.json')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      expect('pg' in all).toBe(true);
    });

    it('apps/api declares pg for the runtime repositories', () => {
      const apiPkg = JSON.parse(readRepoFile('apps/api/package.json')) as {
        dependencies?: Record<string, string>;
      };
      expect(Object.keys(apiPkg.dependencies ?? {})).toContain('pg');
    });
  });

  describe('health diagnostics must measure the database, not hardcode it', () => {
    const serverSource = readRepoFile('apps/api/src/server.ts');
    const diagnosticsBlock = serverSource.slice(
      serverSource.indexOf("app.get('/api/v1/admin/health-diagnostics'"),
      serverSource.indexOf('// 8. Toggle maintenance mode')
    );

    it('derives every database claim from a live storage check', () => {
      expect(diagnosticsBlock).toMatch(/await storage\.health\(\)/);
      expect(diagnosticsBlock).toMatch(/dbConnected: dbHealth\.ok/);
      expect(diagnosticsBlock).toMatch(/database: dbHealth\.ok \? 'connected' : 'disconnected'/);
    });

    it('never asserts a connection state that was not measured', () => {
      expect(diagnosticsBlock).not.toMatch(/dbConnected:\s*(true|false)/);
      expect(diagnosticsBlock).not.toMatch(/database:\s*'(connected|disconnected)'/);
    });

    it('derives queue health from the measured store, never a hardcoded claim', () => {
      expect(diagnosticsBlock).toMatch(/queueOperational = storage\.mode === 'pg' && dbHealth\.ok/);
      expect(diagnosticsBlock).toMatch(/queueOperational \? 'operational' : 'degraded'/);
      expect(diagnosticsBlock).not.toMatch(/queue:\s*'operational'/);
      expect(diagnosticsBlock).not.toMatch(/queueOperational:\s*(true|false)/);
      expect(diagnosticsBlock).toMatch(/activeJobsCount: await storage\.jobs\.countActive\(\)/);
    });
  });
});
