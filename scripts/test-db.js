const { Client } = require('pg');

async function testConnection(connectionString, label) {
  console.log(`Testing ${label}...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log(`✅ Successfully connected to ${label}!`);
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log(`Database: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}`);
    console.log(`Version: ${res.rows[0].version}`);
    
    // Check tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`Public tables count: ${tablesRes.rows.length}`);
    if (tablesRes.rows.length > 0) {
      console.log('Tables:', tablesRes.rows.map(r => r.table_name).join(', '));
    }
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Connection failed for ${label}:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function main() {
  const conn1 = 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';
  const conn2 = 'postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
  const conn3 = 'postgresql://postgres:talentsphere-complete@db.qumgxoscwrygwykbojym.supabase.co:5432/postgres';

  let ok = await testConnection(conn1, 'Pooler 5432 (Session Mode)');
  if (!ok) {
    ok = await testConnection(conn2, 'Pooler 6543 (Transaction Mode)');
  }
  if (!ok) {
    ok = await testConnection(conn3, 'Direct db.qumgxoscwrygwykbojym.supabase.co:5432');
  }
}

main();
