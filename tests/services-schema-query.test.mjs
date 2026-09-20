import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

test('Supabase jobs query with users!employer_id and organizations succeeds', async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      organizations (
        id,
        name,
        logo_url,
        industry
      ),
      users:users!employer_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `, { count: 'exact' })
    .limit(5);

  assert.equal(error, null, `jobs query should not return error: ${error?.message}`);
  assert.ok(Array.isArray(data), 'jobs data is an array');
});

test('Supabase courses query with users!instructor_id succeeds', async () => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      users!instructor_id (
        id,
        full_name,
        avatar_url
      ),
      organizations (
        id,
        name,
        logo_url
      )
    `)
    .limit(5);

  assert.equal(error, null, `courses query should not return error: ${error?.message}`);
  assert.ok(Array.isArray(data), 'courses data is an array');
});

test('Supabase candidate_profiles query with users succeeds', async () => {
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      user_id,
      headline,
      xp_points,
      level,
      user:users (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .limit(5);

  assert.equal(error, null, `candidate_profiles query should not return error: ${error?.message}`);
  assert.ok(Array.isArray(data), 'candidate_profiles data is an array');
});

test('Supabase users query with full_name, email, role succeeds', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, avatar_url')
    .limit(5);

  assert.equal(error, null, `users query should not return error: ${error?.message}`);
  assert.ok(Array.isArray(data), 'users data is an array');
});
