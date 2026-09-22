const { Client } = require('pg');

async function setupStorage() {
  const client = new Client({
    connectionString: 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Updating buckets...');
  await client.query("UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'portfolio', 'resumes');");

  const policies = [
    {
      name: 'Anyone can read avatars',
      sql: `CREATE POLICY "Anyone can read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');`
    },
    {
      name: 'Anyone can read resumes',
      sql: `CREATE POLICY "Anyone can read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');`
    },
    {
      name: 'Users can upload own avatar',
      sql: `CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can update own avatar',
      sql: `CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can delete own avatar',
      sql: `CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can upload own resumes',
      sql: `CREATE POLICY "Users can upload own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can update own resumes',
      sql: `CREATE POLICY "Users can update own resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can delete own resumes',
      sql: `CREATE POLICY "Users can delete own resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Anyone can read portfolio',
      sql: `CREATE POLICY "Anyone can read portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');`
    },
    {
      name: 'Users can upload own portfolio',
      sql: `CREATE POLICY "Users can upload own portfolio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can update own portfolio',
      sql: `CREATE POLICY "Users can update own portfolio" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);`
    },
    {
      name: 'Users can delete own portfolio',
      sql: `CREATE POLICY "Users can delete own portfolio" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);`
    }
  ];

  for (const p of policies) {
    try {
      await client.query(p.sql);
      console.log('✅ Created policy:', p.name);
    } catch (e) {
      console.log('⚠️ Policy note (' + p.name + '):', e.message);
    }
  }

  const buckets = await client.query('SELECT id, name, public FROM storage.buckets;');
  console.log('\nUpdated Buckets:');
  console.table(buckets.rows);

  const pols = await client.query("SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'storage';");
  console.log(`\nStorage policies (${pols.rows.length}):`);
  console.table(pols.rows);

  await client.end();
}

setupStorage().catch(console.error);
