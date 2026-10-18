/**
 * Database-backed RLS smoke tests. The API currently authorizes its own
 * sessions; this suite proves that direct JWT-role database access fails closed
 * across two independent accounts. Requires TEST_DATABASE_URL.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) throw new Error('TEST_DATABASE_URL is required for the pg suite');

const dbName = `ts_pgrls_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
const databaseUrl = withDb(baseUrl, dbName);

const alice = { user: crypto.randomUUID(), profile: crypto.randomUUID(), thread: crypto.randomUUID() };
const ben = { user: crypto.randomUUID(), profile: crypto.randomUUID(), thread: crypto.randomUUID() };
const notificationIds = { alice: crypto.randomUUID(), ben: crypto.randomUUID() };

let pool: pg.Pool;

/** Role and JWT subject are transaction-local; no identity leaks across pooled clients. */
async function asUser<T>(
  userId: string | null,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE authenticated');
    if (userId !== null) {
      await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId]);
    }
    const result = await fn(client);
    await client.query('ROLLBACK');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

describe('RLS: two-account isolation on real PostgreSQL', () => {
  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    try {
      await admin.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await admin.end();
    }

    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });

    // Plain Postgres does not install Supabase's default role grants. Supply
    // minimum test-only grants so the policies (not missing privileges) are
    // what the tests exercise. No production grants are changed.
    await pool.query(`
      GRANT USAGE ON SCHEMA public, auth TO authenticated;
      GRANT SELECT ON public.profiles, public.message_threads,
        public.thread_participants, public.messages, public.notifications,
        public.notification_preferences TO authenticated;
      GRANT INSERT ON public.messages, public.notification_preferences TO authenticated;
      GRANT UPDATE ON public.notification_preferences TO authenticated;
    `);

    await pool.query(
      `INSERT INTO public.users (id, email, password_hash, roles)
       VALUES ($1, 'alice-rls@example.test', 'not-a-real-hash', ARRAY['candidate']),
              ($2, 'ben-rls@example.test', 'not-a-real-hash', ARRAY['candidate'])`,
      [alice.user, ben.user]
    );
    await pool.query(
      `INSERT INTO public.profiles (id, user_id, full_name, privacy)
       VALUES ($1, $2, 'Alice RLS', 'private'), ($3, $4, 'Ben RLS', 'private')`,
      [alice.profile, alice.user, ben.profile, ben.user]
    );
    await pool.query(
      `INSERT INTO public.message_threads (id, subject)
       VALUES ($1, 'Alice private thread'), ($2, 'Ben private thread')`,
      [alice.thread, ben.thread]
    );
    await pool.query(
      `INSERT INTO public.thread_participants (thread_id, user_id)
       VALUES ($1, $2), ($3, $4)`,
      [alice.thread, alice.profile, ben.thread, ben.profile]
    );
    await pool.query(
      `INSERT INTO public.messages (thread_id, sender_id, content)
       VALUES ($1, $2, 'Alice secret'), ($3, $4, 'Ben secret')`,
      [alice.thread, alice.profile, ben.thread, ben.profile]
    );
    await pool.query(
      `INSERT INTO public.notifications (id, recipient_id, type, title, body)
       VALUES ($1, $2, 'system', 'Alice notice', 'Private A'),
              ($3, $4, 'system', 'Ben notice', 'Private B')`,
      [notificationIds.alice, alice.profile, notificationIds.ben, ben.profile]
    );
    await pool.query(
      `INSERT INTO public.notification_preferences (user_id)
       VALUES ($1), ($2)`,
      [alice.profile, ben.profile]
    );
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('shows each account only its own threads, participants, messages and notifications', async () => {
    for (const [actor, other] of [[alice, ben], [ben, alice]]) {
      await asUser(actor.user, async (client) => {
        const threads = await client.query('SELECT id FROM public.message_threads');
        expect(threads.rows.map((row) => row.id)).toEqual([actor.thread]);

        const participants = await client.query(
          'SELECT thread_id, user_id FROM public.thread_participants'
        );
        expect(participants.rows).toEqual([{ thread_id: actor.thread, user_id: actor.profile }]);

        const messages = await client.query('SELECT thread_id FROM public.messages');
        expect(messages.rows.map((row) => row.thread_id)).toEqual([actor.thread]);

        const notices = await client.query('SELECT recipient_id FROM public.notifications');
        expect(notices.rows.map((row) => row.recipient_id)).toEqual([actor.profile]);

        const prefs = await client.query('SELECT user_id FROM public.notification_preferences');
        expect(prefs.rows.map((row) => row.user_id)).toEqual([actor.profile]);

        const swapped = await client.query(
          'SELECT id FROM public.message_threads WHERE id = $1',
          [other.thread]
        );
        expect(swapped.rowCount).toBe(0);
      });
    }
  });

  it('returns no private rows without a JWT subject', async () => {
    await asUser(null, async (client) => {
      for (const table of [
        'message_threads',
        'thread_participants',
        'messages',
        'notifications',
        'notification_preferences',
      ]) {
        const rows = await client.query(`SELECT * FROM public.${table}`);
        expect(rows.rowCount, table).toBe(0);
      }
    });
  });

  it('rejects unauthorized thread joining and message sender impersonation', async () => {
    await asUser(ben.user, async (client) => {
      await expect(
        client.query(
          'INSERT INTO public.thread_participants (thread_id, user_id) VALUES ($1, $2)',
          [alice.thread, ben.profile]
        )
      ).rejects.toMatchObject({ code: '42501' });
    });

    await asUser(ben.user, async (client) => {
      await expect(
        client.query(
          'INSERT INTO public.messages (thread_id, sender_id, content) VALUES ($1, $2, $3)',
          [alice.thread, ben.profile, 'intrusion']
        )
      ).rejects.toMatchObject({ code: '42501' });
    });

    await asUser(ben.user, async (client) => {
      await expect(
        client.query(
          'INSERT INTO public.messages (thread_id, sender_id, content) VALUES ($1, $2, $3)',
          [ben.thread, alice.profile, 'impersonation']
        )
      ).rejects.toMatchObject({ code: '42501' });
    });

    await asUser(ben.user, async (client) => {
      const inserted = await client.query(
        'INSERT INTO public.messages (thread_id, sender_id, content) VALUES ($1, $2, $3)',
        [ben.thread, ben.profile, 'authorized']
      );
      expect(inserted.rowCount).toBe(1);
    });
  });

  it('permits marking own notifications read, not changing another account or message body', async () => {
    await asUser(ben.user, async (client) => {
      const own = await client.query(
        'UPDATE public.notifications SET is_read = true WHERE id = $1',
        [notificationIds.ben]
      );
      expect(own.rowCount).toBe(1);
      const foreign = await client.query(
        'UPDATE public.notifications SET is_read = true WHERE id = $1',
        [notificationIds.alice]
      );
      expect(foreign.rowCount).toBe(0);
    });

    await asUser(ben.user, async (client) => {
      await expect(
        client.query('UPDATE public.notifications SET body = $1 WHERE id = $2', [
          'tampered',
          notificationIds.ben,
        ])
      ).rejects.toMatchObject({ code: '42501' });
    });
  });

  it('restricts preference updates and inserts to the owning profile', async () => {
    await asUser(ben.user, async (client) => {
      const own = await client.query(
        'UPDATE public.notification_preferences SET allow_messages = false WHERE user_id = $1',
        [ben.profile]
      );
      expect(own.rowCount).toBe(1);
      const foreign = await client.query(
        'UPDATE public.notification_preferences SET allow_messages = false WHERE user_id = $1',
        [alice.profile]
      );
      expect(foreign.rowCount).toBe(0);
    });

    await asUser(ben.user, async (client) => {
      await expect(
        client.query(
          'INSERT INTO public.notification_preferences (user_id) VALUES ($1)',
          [alice.profile]
        )
      ).rejects.toMatchObject({ code: '42501' });
    });
  });
});
