import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'ticketwase2',
  user: 'postgres',
  password: '124783',
});

async function createCompaniesTable() {
  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // 1. Crear tabla companies
    console.log('\n1. Creando tabla companies...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla companies creada');

    // 2. Crear índice
    console.log('\n2. Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
    `);
    console.log('✓ Índices creados');

    // 3. Insertar empresa por defecto (General)
    console.log('\n3. Creando empresa por defecto...');
    const defaultCompany = await client.query(`
      INSERT INTO companies (name, description, status)
      VALUES ('General', 'Empresa por defecto del sistema', 'active')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    
    const defaultCompanyId = defaultCompany.rows[0]?.id;
    console.log('✓ Empresa por defecto creada:', defaultCompanyId);

    console.log('\n✅ Tabla companies creada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createCompaniesTable();
