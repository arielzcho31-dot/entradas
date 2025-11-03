import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'ticketwase2',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
});

async function addCategoryColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    
    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'category'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('ℹ️  La columna "category" ya existe en la tabla events');
      return;
    }
    
    console.log('📝 Agregando columna "category" a la tabla events...');
    
    // Agregar columna category
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN category VARCHAR(50) DEFAULT 'Todos'
    `);
    
    console.log('✅ Columna "category" agregada exitosamente');
    
    // Crear índice para búsquedas más rápidas
    console.log('📝 Creando índice para la columna category...');
    await client.query(`
      CREATE INDEX idx_events_category ON events(category)
    `);
    
    console.log('✅ Índice creado exitosamente');
    
    console.log('🎉 Script completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCategoryColumn();
