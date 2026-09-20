const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS job_bookmarks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id)
    );
    ALTER TABLE job_bookmarks ENABLE ROW LEVEL SECURITY;
  `);

  const policies = [
    {
      name: 'Users can view own bookmarks',
      sql: `CREATE POLICY "Users can view own bookmarks" ON job_bookmarks FOR SELECT USING (auth.uid() = user_id);`
    },
    {
      name: 'Users can insert own bookmarks',
      sql: `CREATE POLICY "Users can insert own bookmarks" ON job_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);`
    },
    {
      name: 'Users can delete own bookmarks',
      sql: `CREATE POLICY "Users can delete own bookmarks" ON job_bookmarks FOR DELETE USING (auth.uid() = user_id);`
    }
  ];

  for (const p of policies) {
    try {
      await client.query(p.sql);
      console.log('✅ Created policy:', p.name);
    } catch (e) {
      console.log('Policy notice:', e.message);
    }
  }

  console.log('job_bookmarks ready!');
  await client.end();
}

run().catch(console.error);
