import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve('.');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Persistence honesty guards', () => {
  describe('scripts/migrate.mjs must not claim to have applied SQL', () => {
    const source = readRepoFile('scripts/migrate.mjs');

    it('never reports that migrations were executed', () => {
      expect(source).not.toMatch(/executed successfully/i);
    });

    it('does not print a success line after targeting a real database', () => {
      const realDbBranch = source.slice(source.indexOf('isPlaceholderDatabaseUrl(databaseUrl)'));
      expect(realDbBranch).not.toMatch(/console\.log\([^)]*success/i);
    });

    it('fails loudly when a real DATABASE_URL is targeted', () => {
      const realDbBranch = source.slice(source.indexOf('isPlaceholderDatabaseUrl(databaseUrl)'));
      expect(realDbBranch).toMatch(/process\.exit\(1\)/);
    });

    it('points at the Supabase CLI as the real apply path', () => {
      expect(source).toMatch(/supabase db push/);
    });

    it('has no Postgres client available to apply SQL, and does not pretend otherwise', () => {
      const pkg = JSON.parse(readRepoFile('package.json')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      const hasClient = ['pg', 'postgres', '@supabase/supabase-js', 'knex', 'typeorm'].some(
        (dep) => dep in all
      );
      expect(hasClient).toBe(false);
    });
  });

  describe('health diagnostics must not hardcode an unmeasured database', () => {
    const serverSource = readRepoFile('apps/api/src/server.ts');
    const diagnosticsBlock = serverSource.slice(
      serverSource.indexOf("app.get('/api/v1/admin/health-diagnostics'"),
      serverSource.indexOf('// 8. Toggle maintenance mode')
    );

    it('does not assert dbConnected: true', () => {
      expect(diagnosticsBlock).not.toMatch(/dbConnected:\s*true/);
    });

    it('does not assert the database is connected', () => {
      expect(diagnosticsBlock).not.toMatch(/database:\s*'connected'/);
    });
  });

  describe('no database driver is wired into the API', () => {
    const apiPkg = JSON.parse(readRepoFile('apps/api/package.json')) as {
      dependencies?: Record<string, string>;
    };

    it('apps/api declares no Postgres client or ORM', () => {
      const deps = Object.keys(apiPkg.dependencies ?? {});
      const dbDrivers = [
        'pg',
        'postgres',
        '@supabase/supabase-js',
        'knex',
        'typeorm',
        'prisma',
        '@prisma/client',
        'drizzle-orm',
        'sequelize',
        'mikro-orm',
      ];
      expect(deps.filter((d) => dbDrivers.includes(d))).toEqual([]);
    });
  });
});
