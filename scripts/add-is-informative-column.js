import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function addIsInformativeColumn() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // 1. Agregar columna is_informative a tabla events
    console.log('\n1. Agregando columna is_informative a eventos...');
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS is_informative BOOLEAN DEFAULT false;
    `);
    console.log('✓ Columna is_informative agregada');

    // 2. Agregar comentario descriptivo
    console.log('\n2. Agregando comentario...');
    await client.query(`
      COMMENT ON COLUMN events.is_informative IS 'Si es true, el evento se muestra sin opción de comprar entradas (solo informativo)';
    `);
    console.log('✓ Comentario agregado');

    // 3. Crear índice para búsquedas
    console.log('\n3. Creando índice...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_is_informative ON events(is_informative);
    `);
    console.log('✓ Índice creado');

    console.log('\n✅ Columna is_informative agregada exitosamente');
    console.log('\nNOTA: Los eventos informativos se mostrarán sin botón de comprar entradas.');
    console.log('Usa UPDATE events SET is_informative = true WHERE id = \'...\' para marcar un evento como informativo.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addIsInformativeColumn();
