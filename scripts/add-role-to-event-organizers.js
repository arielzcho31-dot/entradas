import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function addRoleColumn() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // 1. Agregar columna role si no existe
    console.log('\n1. Agregando columna role...');
    await client.query(`
      ALTER TABLE event_organizers 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'organizer';
    `);
    console.log('✓ Columna role agregada');

    // 2. Agregar alias added_at como vista de assigned_at (para compatibilidad)
    console.log('\n2. Creando alias added_at...');
    await client.query(`
      ALTER TABLE event_organizers 
      ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ;
    `);
    
    // Copiar valores de assigned_at a added_at si added_at es null
    await client.query(`
      UPDATE event_organizers 
      SET added_at = assigned_at 
      WHERE added_at IS NULL;
    `);
    
    // Establecer default para nuevos registros
    await client.query(`
      ALTER TABLE event_organizers 
      ALTER COLUMN added_at SET DEFAULT NOW();
    `);
    console.log('✓ Columna added_at agregada');

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addRoleColumn();
