const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    connectionString: 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  console.log('--- ENUMS ---');
  const enums = await client.query(`
    SELECT t.typname as enum_name, count(e.enumlabel) as val_count
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    GROUP BY t.typname
    ORDER BY t.typname;
  `);
  console.log(`Found ${enums.rows.length} enums:`, enums.rows.map(r => `${r.enum_name} (${r.val_count})`).join(', '));

  console.log('\n--- EXTENSIONS ---');
  const exts = await client.query(`SELECT extname FROM pg_extension;`);
  console.log('Extensions:', exts.rows.map(r => r.extname).join(', '));

  console.log('\n--- TRIGGERS ---');
  const triggers = await client.query(`
    SELECT event_object_table, trigger_name 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' OR trigger_schema = 'auth'
    ORDER BY event_object_table, trigger_name;
  `);
  console.log(`Found ${triggers.rows.length} triggers:`);
  for (const row of triggers.rows) {
    console.log(`  Table: ${row.event_object_table} -> Trigger: ${row.trigger_name}`);
  }

  console.log('\n--- FUNCTIONS ---');
  const funcs = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    ORDER BY routine_name;
  `);
  console.log(`Found ${funcs.rows.length} functions in public:`, funcs.rows.map(r => r.routine_name).join(', '));

  console.log('\n--- RLS STATUS ---');
  const rls = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);
  const rlsEnabled = rls.rows.filter(r => r.rowsecurity).length;
  console.log(`Total public tables: ${rls.rows.length}, RLS enabled: ${rlsEnabled}`);

  console.log('\n--- STORAGE BUCKETS ---');
  try {
    const buckets = await client.query(`SELECT id, name, public FROM storage.buckets;`);
    console.log(`Storage buckets (${buckets.rows.length}):`, buckets.rows);
  } catch (e) {
    console.log('Could not query storage.buckets:', e.message);
  }

  await client.end();
}

checkDatabase().catch(console.error);
