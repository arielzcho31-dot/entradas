import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function createEventOrganizersTable() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // 1. Crear tabla event_organizers para asignar múltiples organizadores a eventos
    console.log('\n1. Creando tabla event_organizers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_organizers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        assigned_by UUID REFERENCES users(id),
        UNIQUE(event_id, user_id)
      );
    `);
    console.log('✓ Tabla event_organizers creada');

    // 2. Crear índices
    console.log('\n2. Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_event_organizers_event_id ON event_organizers(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_organizers_user_id ON event_organizers(user_id);
    `);
    console.log('✓ Índices creados');

    // 3. Agregar comentarios
    console.log('\n3. Agregando comentarios...');
    await client.query(`
      COMMENT ON TABLE event_organizers IS 'Tabla para asignar múltiples organizadores a un evento';
      COMMENT ON COLUMN event_organizers.event_id IS 'Evento asignado';
      COMMENT ON COLUMN event_organizers.user_id IS 'Usuario organizador asignado';
      COMMENT ON COLUMN event_organizers.assigned_by IS 'Usuario admin que hizo la asignación';
    `);
    console.log('✓ Comentarios agregados');

    console.log('\n✅ Sistema de asignación de organizadores creado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createEventOrganizersTable();
