// scripts/test-db.js
const { Pool } = require('pg');

// Configuración desde .env.local
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function testConnection() {
  try {
    console.log('🔌 Attempting connection to PostgreSQL...');
    console.log('Host: 127.0.0.1:5432');
    console.log('Database: ticketwase2');
    console.log('User: postgres');
    
    // Test 1: Simple query
    console.log('\n📤 Test 1: Simple query...');
    const timeResult = await pool.query('SELECT NOW() as timestamp');
    console.log('✅ Connected! Current time:', timeResult.rows[0].timestamp);
    
    // Test 2: List users
    console.log('\n📤 Test 2: Listing all users...');
    const usersResult = await pool.query(
      'SELECT id, email, role, display_name, created_at FROM users LIMIT 10'
    );
    console.log(`✅ Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.role})`);
    });
    
    // Test 3: Find specific user
    if (process.argv[2]) {
      console.log('\n📤 Test 3: Finding user:', process.argv[2]);
      const userResult = await pool.query(
        'SELECT id, email, role, display_name, password FROM users WHERE LOWER(email) = LOWER($1)',
        [process.argv[2]]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log('✅ User found:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Display Name:', user.display_name);
        console.log('   Password:', user.password ? `${user.password.substring(0, 20)}...` : 'NULL');
        console.log('   Hash Length:', user.password ? user.password.length : 0);
      } else {
        console.log('❌ User NOT found');
      }
    }
    
    await pool.end();
    console.log('\n✅ All tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
