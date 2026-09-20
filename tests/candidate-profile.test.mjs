import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

test('Database has correct candidate profile schema and sub-entity tables', async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // 1. Check candidate_profiles columns
    const cpCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_profiles'
    `);
    const cpColNames = cpCols.rows.map(r => r.column_name);
    assert.ok(cpColNames.includes('id'), 'candidate_profiles has id');
    assert.ok(cpColNames.includes('user_id'), 'candidate_profiles has user_id');
    assert.ok(cpColNames.includes('headline'), 'candidate_profiles has headline');
    assert.ok(cpColNames.includes('summary'), 'candidate_profiles has summary');
    assert.ok(cpColNames.includes('location_city'), 'candidate_profiles has location_city');
    assert.ok(cpColNames.includes('availability_status'), 'candidate_profiles has availability_status');
    assert.ok(cpColNames.includes('profile_visibility'), 'candidate_profiles has profile_visibility');

    // 2. Check candidate_skills columns
    const csCols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'candidate_skills'
    `);
    const csColNames = csCols.rows.map(r => r.column_name);
    assert.ok(csColNames.includes('candidate_profile_id'), 'candidate_skills has candidate_profile_id');
    assert.ok(csColNames.includes('skill_id'), 'candidate_skills has skill_id');
    assert.ok(csColNames.includes('proficiency'), 'candidate_skills has proficiency');

    // 3. Check experience table (singular)
    const expCols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'experience'
    `);
    const expColNames = expCols.rows.map(r => r.column_name);
    assert.ok(expColNames.includes('candidate_profile_id'), 'experience has candidate_profile_id');
    assert.ok(expColNames.includes('company_name'), 'experience has company_name');
    assert.ok(expColNames.includes('job_title'), 'experience has job_title');
    assert.ok(expColNames.includes('start_date'), 'experience has start_date');

    // 4. Check education, certifications, portfolio_items
    const eduCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'education'`);
    assert.ok(eduCols.rows.map(r => r.column_name).includes('candidate_profile_id'));

    const certCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'certifications'`);
    assert.ok(certCols.rows.map(r => r.column_name).includes('candidate_profile_id'));

    const portCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'portfolio_items'`);
    assert.ok(portCols.rows.map(r => r.column_name).includes('candidate_profile_id'));
  } finally {
    await client.end();
  }
});
