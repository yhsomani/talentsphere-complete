import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

test('Audit live database tables and schema', async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = res.rows.map(r => r.table_name);
    console.log('Public tables count:', tables.length);
    console.log('Public tables:', tables);

    assert.ok(tables.includes('jobs'), 'jobs table exists');
    assert.ok(tables.includes('applications'), 'applications table exists');
    assert.ok(tables.includes('job_bookmarks'), 'job_bookmarks table exists');
    assert.ok(tables.includes('candidate_profiles'), 'candidate_profiles table exists');
    assert.ok(tables.includes('organizations'), 'organizations table exists');
    assert.ok(tables.includes('users'), 'users table exists');

    const jCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs'
    `);
    console.log('jobs cols:', jCols.rows.map(r => r.column_name));

    const jbCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'job_bookmarks'
    `);
    console.log('job_bookmarks cols:', jbCols.rows.map(r => r.column_name));

    const appCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'applications'
    `);
    console.log('applications cols:', appCols.rows.map(r => r.column_name));

    const jobCount = await client.query(`SELECT COUNT(*) FROM jobs`);
    console.log('Total jobs in database:', jobCount.rows[0].count);

    const enumVals = await client.query(`
      SELECT e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname = 'job_status'
    `);
    console.log('job_status enum labels:', enumVals.rows.map(r => r.enumlabel));
  } finally {
    await client.end();
  }
});
