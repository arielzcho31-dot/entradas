import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'ticketwase2',
  password: process.env.DATABASE_PASSWORD || '',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
});

async function getEvents() {
  try {
    const result = await pool.query('SELECT id, name FROM events LIMIT 5');
    console.log('\n📋 Eventos en la base de datos:');
    console.log('=====================================');
    result.rows.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   UUID: ${event.id}`);
      console.log(`   URL: http://localhost:9004/events/${event.id}\n`);
    });
    
    if (result.rows.length === 0) {
      console.log('❌ No hay eventos en la base de datos');
      console.log('\n💡 Solución: Crear un evento desde el dashboard de admin');
      console.log('   URL: http://localhost:9004/dashboard/admin\n');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

getEvents();
