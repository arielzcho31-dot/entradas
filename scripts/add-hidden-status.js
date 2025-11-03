import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function addHiddenStatus() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // 1. Eliminar la restricción antigua
    console.log('\n1. Eliminando restricción antigua...');
    await client.query(`
      ALTER TABLE events 
      DROP CONSTRAINT IF EXISTS events_status_check;
    `);
    console.log('✓ Restricción antigua eliminada');

    // 2. Agregar nueva restricción con 'hidden'
    console.log('\n2. Agregando nueva restricción con estado "hidden"...');
    await client.query(`
      ALTER TABLE events 
      ADD CONSTRAINT events_status_check 
      CHECK (status IN ('active', 'ended', 'cancelled', 'hidden'));
    `);
    console.log('✓ Nueva restricción agregada: active, ended, cancelled, hidden');

    // 3. Actualizar comentario
    console.log('\n3. Actualizando comentario...');
    await client.query(`
      COMMENT ON COLUMN events.status IS 'Estados: active (visible y comprando), ended (visible, finalizado), cancelled (visible, cancelado), hidden (oculto en página principal)';
    `);
    console.log('✓ Comentario actualizado');

    console.log('\n✅ Estado "hidden" agregado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addHiddenStatus();
