import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function addCompanyIdColumns() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // Obtener el ID de la empresa por defecto
    const defaultCompanyResult = await client.query(`
      SELECT id FROM companies WHERE name = 'General' LIMIT 1
    `);
    
    if (defaultCompanyResult.rows.length === 0) {
      throw new Error('No se encontró la empresa por defecto. Ejecuta create-companies-table.js primero.');
    }
    
    const defaultCompanyId = defaultCompanyResult.rows[0].id;
    console.log('✓ Empresa por defecto encontrada:', defaultCompanyId);

    // 1. Agregar company_id a tabla users
    console.log('\n1. Agregando company_id a tabla users...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
    `);
    console.log('✓ Columna company_id agregada a users');

    // Asignar empresa por defecto a usuarios existentes sin company_id
    console.log('\n2. Asignando empresa por defecto a usuarios existentes...');
    const updatedUsers = await client.query(`
      UPDATE users 
      SET company_id = $1 
      WHERE company_id IS NULL
      RETURNING id;
    `, [defaultCompanyId]);
    console.log(`✓ ${updatedUsers.rowCount} usuarios asignados a empresa por defecto`);

    // 3. Agregar company_id a tabla events
    console.log('\n3. Agregando company_id a tabla events...');
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
    `);
    console.log('✓ Columna company_id agregada a events');

    // Asignar empresa por defecto a eventos existentes sin company_id
    console.log('\n4. Asignando empresa por defecto a eventos existentes...');
    const updatedEvents = await client.query(`
      UPDATE events 
      SET company_id = $1 
      WHERE company_id IS NULL
      RETURNING id;
    `, [defaultCompanyId]);
    console.log(`✓ ${updatedEvents.rowCount} eventos asignados a empresa por defecto`);

    // 5. Crear índices
    console.log('\n5. Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
      CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);
    `);
    console.log('✓ Índices creados');

    console.log('\n✅ Columnas company_id agregadas exitosamente a users y events');
    console.log('\nNOTA: Los admins pueden ver todos los eventos. Los organizadores solo verán eventos de su empresa.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addCompanyIdColumns();
