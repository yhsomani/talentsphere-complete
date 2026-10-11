/**
 * Teardown for the per-file test databases.
 *
 * pg-pool's end() resolves as soon as it has ASKED its clients to close
 * (_remove() drops them from the pool and calls client.end() without waiting),
 * so their sockets may still be open when afterAll moves on. DROP DATABASE
 * ... WITH (FORCE) then terminates a connection that is mid-close, and the
 * resulting FATAL 57P01 surfaces as an unhandled 'error' event from a pool
 * with no error listener — failing the suite intermittently after every test
 * passed. Waiting for the database's connections to go away first removes the
 * race; FORCE remains the fallback for a connection that never closes.
 */
import pg from 'pg';

export async function dropTestDatabase(adminUrl: string, name: string): Promise<void> {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      const { rows } = await admin.query(
        'SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = $1',
        [name]
      );
      if (rows[0].n === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  } finally {
    await admin.end();
  }
}
