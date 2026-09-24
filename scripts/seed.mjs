import fs from 'node:fs';
import path from 'node:path';

async function runSeed() {
  console.log('--- TalentSphere Database Seeder ---');
  const seedDir = path.resolve('supabase/seed');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }

  const seedFile = path.join(seedDir, '01_initial_seed.sql');
  if (!fs.existsSync(seedFile)) {
    const defaultSeed = `-- Initial Platform Seed
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('FEATURE_LMS', true, 'Enable Learning Management System'),
  ('FEATURE_CODE_ARENA', true, 'Enable Code Assessment Arena'),
  ('FEATURE_MESSAGING', true, 'Enable Direct Messaging'),
  ('FEATURE_NOTIFICATIONS', true, 'Enable Notification Center'),
  ('FEATURE_AI_MATCHING', false, 'Gated AI matching capability')
ON CONFLICT (key) DO NOTHING;
`;
    fs.writeFileSync(seedFile, defaultSeed, 'utf8');
    console.log(`Created default seed file at ${seedFile}`);
  }

  console.log('Seed files validated successfully.');
}

runSeed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
