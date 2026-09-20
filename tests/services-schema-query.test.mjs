import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

let client;

before(async () => {
  client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
});

after(async () => {
  if (client) {
    await client.end();
  }
});

test('Database jobs join with users (employer) and organizations succeeds without error 42703', async () => {
  const res = await client.query(`
    SELECT j.id, j.title, j.salary_min, j.salary_max, o.name AS org_name, o.logo_url,
           u.id AS employer_id, u.full_name AS employer_name, u.email AS employer_email, u.avatar_url
    FROM jobs j
    LEFT JOIN organizations o ON j.organization_id = o.id
    LEFT JOIN users u ON j.employer_id = u.id
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database courses join with users (instructor) and organizations succeeds without error 42703', async () => {
  const res = await client.query(`
    SELECT c.id, c.title, c.level, c.xp_reward, o.name AS org_name,
           u.id AS instructor_id, u.full_name AS instructor_name, u.avatar_url
    FROM courses c
    LEFT JOIN users u ON c.instructor_id = u.id
    LEFT JOIN organizations o ON c.organization_id = o.id
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database candidate_profiles join with users succeeds without error 42703', async () => {
  const res = await client.query(`
    SELECT cp.id, cp.headline, cp.location_city, cp.availability_status,
           u.id AS user_id, u.full_name, u.email, u.avatar_url, u.role
    FROM candidate_profiles cp
    LEFT JOIN users u ON cp.user_id = u.id
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database user_levels join with users (leaderboard) succeeds without error 42703', async () => {
  const res = await client.query(`
    SELECT ul.user_id, ul.current_level, ul.current_xp, ul.total_xp_earned,
           u.full_name, u.email, u.avatar_url
    FROM user_levels ul
    JOIN users u ON ul.user_id = u.id
    ORDER BY ul.total_xp_earned DESC
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database conversation_participants join with users succeeds without error 42703', async () => {
  const res = await client.query(`
    SELECT cp.id, cp.conversation_id, cp.user_id,
           u.email, u.full_name, u.role, u.avatar_url
    FROM conversation_participants cp
    LEFT JOIN users u ON cp.user_id = u.id
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database job_bookmarks queries succeed with valid columns and references', async () => {
  const res = await client.query(`
    SELECT jb.id, jb.user_id, jb.job_id, jb.created_at,
           j.title, j.salary_min, j.salary_max
    FROM job_bookmarks jb
    JOIN jobs j ON jb.job_id = j.id
    LIMIT 5;
  `);

  assert.ok(Array.isArray(res.rows), 'Query returned rows array');
});

test('Database candidate profile sub-entities queries succeed with exact schema names', async () => {
  // 1. experience (singular)
  const expRes = await client.query(`
    SELECT id, candidate_profile_id, company_name, job_title, start_date, end_date, is_current, location_city, description
    FROM experience
    LIMIT 5;
  `);
  assert.ok(Array.isArray(expRes.rows), 'experience table query succeeded');

  // 2. education (singular)
  const eduRes = await client.query(`
    SELECT id, candidate_profile_id, institution_name, degree_type, field_of_study, grade, start_date, end_date, is_current
    FROM education
    LIMIT 5;
  `);
  assert.ok(Array.isArray(eduRes.rows), 'education table query succeeded');

  // 3. certifications (plural)
  const certRes = await client.query(`
    SELECT id, candidate_profile_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url
    FROM certifications
    LIMIT 5;
  `);
  assert.ok(Array.isArray(certRes.rows), 'certifications table query succeeded');

  // 4. portfolio_items (plural)
  const portRes = await client.query(`
    SELECT id, candidate_profile_id, title, description, project_url, repository_url, project_type, is_featured, created_at
    FROM portfolio_items
    LIMIT 5;
  `);
  assert.ok(Array.isArray(portRes.rows), 'portfolio_items table query succeeded');

  // 5. candidate_skills join skills
  const skillsRes = await client.query(`
    SELECT cs.id, cs.candidate_profile_id, cs.proficiency, s.id AS skill_id, s.name, s.category
    FROM candidate_skills cs
    JOIN skills s ON cs.skill_id = s.id
    LIMIT 5;
  `);
  assert.ok(Array.isArray(skillsRes.rows), 'candidate_skills join query succeeded');
});

test('Database user_levels and xp_ledger queries succeed with gamification columns', async () => {
  const levelsRes = await client.query(`
    SELECT user_id, current_level, current_xp, xp_to_next_level, total_xp_earned, level_progress
    FROM user_levels
    LIMIT 5;
  `);
  assert.ok(Array.isArray(levelsRes.rows), 'user_levels query succeeded');

  const ledgerRes = await client.query(`
    SELECT id, user_id, amount, transaction_type, source_type, balance_after
    FROM xp_ledger
    LIMIT 5;
  `);
  assert.ok(Array.isArray(ledgerRes.rows), 'xp_ledger query succeeded');
});

test('Database hiring_pipeline_stages query succeeds with default stages in correct order', async () => {
  const res = await client.query(`
    SELECT id, name, order_index, type, is_default
    FROM hiring_pipeline_stages
    ORDER BY order_index ASC;
  `);

  assert.ok(Array.isArray(res.rows), 'hiring_pipeline_stages query returned rows array');
  assert.ok(res.rows.length >= 6, 'Contains at least 6 default pipeline stages');
  assert.strictEqual(res.rows[0].name, 'Application Received');
  assert.strictEqual(res.rows[0].order_index, 1);
});

test('Database applications join with candidate_profiles, users, and hiring_pipeline_stages succeeds', async () => {
  const res = await client.query(`
    SELECT a.id, a.job_id, a.status, a.current_stage_id, a.applied_at,
           cp.id AS candidate_profile_id, cp.headline, cp.location_city,
           u.id AS user_id, u.full_name, u.email,
           hps.name AS stage_name, hps.type AS stage_type
    FROM applications a
    LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
    LEFT JOIN users u ON cp.user_id = u.id
    LEFT JOIN hiring_pipeline_stages hps ON a.current_stage_id = hps.id
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'applications join query returned rows array');
});

test('Database application_activity_log query and columns succeed', async () => {
  const res = await client.query(`
    SELECT id, application_id, actor_id, action, previous_value, new_value, metadata, created_at
    FROM application_activity_log
    ORDER BY created_at DESC
    LIMIT 10;
  `);

  assert.ok(Array.isArray(res.rows), 'application_activity_log query returned rows array');
});

test('Database scorecards query and columns succeed', async () => {
  const res = await client.query(`
    SELECT id, application_id, interviewer_id, stage_id, overall_decision, overall_score,
           technical_score, communication_score, culture_fit_score, problem_solving_score,
           leadership_score, comments, strengths, weaknesses, would_rehire, submitted_at
    FROM scorecards
    LIMIT 5;
  `);

  assert.ok(Array.isArray(res.rows), 'scorecards query returned rows array');
});

